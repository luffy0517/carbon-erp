CREATE TYPE "purchaseInvoiceStatus" AS ENUM (
  'Draft', 
  'Pending',
  'Submitted',
  'Return',
  'Debit Note Issued',
  'Paid', 
  'Partially Paid', 
  'Overdue',
  'Voided'
);

CREATE TABLE "purchaseInvoice" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "invoiceId" TEXT NOT NULL,
  "status" "purchaseInvoiceStatus" NOT NULL DEFAULT 'Draft',
  "supplierId" TEXT,
  "supplierReference" TEXT,
  "invoiceSupplierId" TEXT,
  "invoiceSupplierLocationId" TEXT,
  "invoiceSupplierContactId" TEXT,
  "paymentTermId" TEXT,
  "currencyCode" TEXT NOT NULL,
  "exchangeRate" NUMERIC(10, 4) NOT NULL DEFAULT 1,
  "postingDate" DATE,
  "dateIssued" DATE,
  "dateDue" DATE,
  "datePaid" DATE,
  "subtotal" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "totalDiscount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "totalAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "totalTax" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "balance" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,

  CONSTRAINT "purchaseInvoice_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchaseInvoice_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id"),
  CONSTRAINT "purchaseInvoice_invoiceSupplierId_fkey" FOREIGN KEY ("invoiceSupplierId") REFERENCES "supplier" ("id"),
  CONSTRAINT "purchaseInvoice_invoiceSupplierLocationId_fkey" FOREIGN KEY ("invoiceSupplierLocationId") REFERENCES "supplierLocation" ("id"),
  CONSTRAINT "purchaseInvoice_invoiceSupplierContactId_fkey" FOREIGN KEY ("invoiceSupplierContactId") REFERENCES "supplierContact" ("id"),
  CONSTRAINT "purchaseInvoice_paymentTermId_fkey" FOREIGN KEY ("paymentTermId") REFERENCES "paymentTerm" ("id"),
  CONSTRAINT "purchaseInvoice_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency" ("code"),
  CONSTRAINT "purchaseInvoice_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id"),
  CONSTRAINT "purchaseInvoice_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id")
);

CREATE INDEX "purchaseInvoice_invoiceId_idx" ON "purchaseInvoice" ("invoiceId");
CREATE INDEX "purchaseInvoice_status_idx" ON "purchaseInvoice" ("status");
CREATE INDEX "purchaseInvoice_supplierId_idx" ON "purchaseInvoice" ("supplierId");
CREATE INDEX "purchaseInvoice_dateDue_idx" ON "purchaseInvoice" ("dateDue");
CREATE INDEX "purchaseInvoice_datePaid_idx" ON "purchaseInvoice" ("datePaid");

ALTER publication supabase_realtime ADD TABLE "purchaseInvoice";

ALTER TABLE "purchaseInvoice" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP invoices" ON "purchaseInvoice"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_create can insert AP invoices" ON "purchaseInvoice"
  FOR INSERT
  WITH CHECK (   
    coalesce(get_my_claim('invoicing_create')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

CREATE POLICY "Employees with invoicing_update can update AP invoices" ON "purchaseInvoice"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('invoicing_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_delete can delete AP invoices" ON "purchaseInvoice"
  FOR DELETE
  USING (
    coalesce(get_my_claim('invoicing_delete')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );



CREATE TABLE "purchaseInvoiceStatusHistory" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "invoiceId" TEXT NOT NULL,
  "status" "purchaseInvoiceStatus" NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  CONSTRAINT "purchaseInvoiceStatusHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchaseInvoiceStatusHistory_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "purchaseInvoice" ("id") ON UPDATE CASCADE ON DELETE CASCADE
);

ALTER TABLE "purchaseInvoiceStatusHistory" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP invoices status history" ON "purchaseInvoiceStatusHistory"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );


CREATE TYPE "payableLineType" AS ENUM (
  'G/L Account',
  'Part',
  'Fixed Asset',
  'Comment'
);

CREATE TABLE "purchaseInvoiceLine" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "invoiceId" TEXT NOT NULL,
  "invoiceLineType" "payableLineType" NOT NULL,
  "purchaseOrderId" TEXT,
  "purchaseOrderLineId" TEXT,
  "partId" TEXT,
  "locationId" TEXT,
  "shelfId" TEXT,
  "accountNumber" TEXT,
  "assetId" TEXT,
  "description" TEXT,
  "quantity" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "unitPrice" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "totalAmount" NUMERIC(10, 2) GENERATED ALWAYS AS ("quantity" * "unitPrice") STORED,
  "currencyCode" TEXT NOT NULL,
  "exchangeRate" NUMERIC(10, 4) NOT NULL DEFAULT 1,
  "unitOfMeasureCode" TEXT,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,

  CONSTRAINT "purchaseInvoiceLines_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchaseInvoiceLines_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "purchaseInvoice" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "purchaseInvoiceLines_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "purchaseOrder" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_purchaseOrderLineId_fkey" FOREIGN KEY ("purchaseOrderLineId") REFERENCES "purchaseOrderLine" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_partId_fkey" FOREIGN KEY ("partId") REFERENCES "part" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "location" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_shelfId_fkey" FOREIGN KEY ("shelfId", "locationId") REFERENCES "shelf" ("id", "locationId") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "purchaseInvoiceLines_accountNumber_fkey" FOREIGN KEY ("accountNumber") REFERENCES "account" ("number") ON UPDATE CASCADE ON DELETE RESTRICT,
  -- CONSTRAINT "purchaseInvoiceLines_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "fixedAsset" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency" ("code") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_unitOfMeasureCode_fkey" FOREIGN KEY ("unitOfMeasureCode") REFERENCES "unitOfMeasure" ("code") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchaseInvoiceLines_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE "purchaseInvoiceLine" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP invoice lines" ON "purchaseInvoiceLine"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_create can insert AP invoice lines" ON "purchaseInvoiceLine"
  FOR INSERT
  WITH CHECK (   
    coalesce(get_my_claim('invoicing_create')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

CREATE POLICY "Employees with invoicing_update can update AP invoice lines" ON "purchaseInvoiceLine"
  FOR UPDATE
  USING (
    coalesce(get_my_claim('invoicing_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_delete can delete AP invoice lines" ON "purchaseInvoiceLine"
  FOR DELETE
  USING (
    coalesce(get_my_claim('invoicing_delete')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE TABLE "purchaseInvoicePriceChange" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "invoiceId" TEXT NOT NULL,
  "invoiceLineId" TEXT NOT NULL,
  "previousPrice" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "newPrice" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "previousQuantity" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "newQuantity" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "updatedBy" TEXT NOT NULL,

  CONSTRAINT "purchaseInvoicePriceChange_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchaseInvoicePriceChange_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "purchaseInvoice" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "purchaseInvoicePriceChange_invoiceLineId_fkey" FOREIGN KEY ("invoiceLineId") REFERENCES "purchaseInvoiceLine" ("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "purchaseInvoicePriceChange_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE "purchaseInvoicePriceChange" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP invoice price changes" ON "purchaseInvoicePriceChange"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE OR REPLACE FUNCTION "purchaseInvoiceLine_update_price_change"()
  RETURNS TRIGGER AS $$
  BEGIN
    IF NEW."unitPrice" <> OLD."unitPrice" OR NEW."quantity" <> OLD."quantity" THEN
      INSERT INTO "purchaseInvoicePriceChange" (
        "invoiceId",
        "invoiceLineId",
        "previousPrice",
        "newPrice",
        "previousQuantity",
        "newQuantity",
        "updatedBy"
      ) VALUES (
        NEW."invoiceId",
        NEW."id",
        OLD."unitPrice",
        NEW."unitPrice",
        OLD."quantity",
        NEW."quantity",
        NEW."updatedBy"
      );
    END IF;
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER "purchaseInvoiceLine_update_price_change"
  AFTER UPDATE ON "purchaseInvoiceLine"
  FOR EACH ROW
  EXECUTE PROCEDURE "purchaseInvoiceLine_update_price_change"();

CREATE TABLE "purchasePayment" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "paymentId" TEXT NOT NULL,
  "supplierId" TEXT NOT NULL,
  "paymentDate" DATE,
  "currencyCode" TEXT NOT NULL,
  "exchangeRate" NUMERIC(10, 4) NOT NULL DEFAULT 1,
  "totalAmount" NUMERIC(10, 2) NOT NULL DEFAULT 0,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,

  CONSTRAINT "purchasePayment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchasePayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchasePayment_currencyCode_fkey" FOREIGN KEY ("currencyCode") REFERENCES "currency" ("code") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchasePayment_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchasePayment_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE "purchasePayment" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP payments" ON "purchasePayment"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_create can insert AP payments" ON "purchasePayment"
  FOR INSERT
  WITH CHECK (   
    coalesce(get_my_claim('invoicing_create')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
);

CREATE POLICY "Employees with invoicing_update can update AP payments" ON "purchasePayment"
  FOR UPDATE
  USING (
    "paymentDate" IS NULL
    AND coalesce(get_my_claim('invoicing_update')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE POLICY "Employees with invoicing_delete can delete AP payments" ON "purchasePayment"
  FOR DELETE
  USING (
    "paymentDate" IS NULL
    AND coalesce(get_my_claim('invoicing_delete')::boolean, false) = true 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );

CREATE TABLE "purchaseInvoicePaymentRelation" (
  "id" TEXT NOT NULL DEFAULT xid(),
  "invoiceId" TEXT NOT NULL,
  "paymentId" TEXT NOT NULL,

  CONSTRAINT "purchasePayments_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "purchasePayments_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "purchaseInvoice" ("id") ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT "purchasePayments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "purchasePayment" ("id") ON UPDATE CASCADE ON DELETE RESTRICT
);

ALTER TABLE "purchaseInvoicePaymentRelation" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees with invoicing_view can view AP invoice/payment relations" ON "purchaseInvoicePaymentRelation"
  FOR SELECT
  USING (
    coalesce(get_my_claim('invoicing_view')::boolean,false) 
    AND (get_my_claim('role'::text)) = '"employee"'::jsonb
  );


CREATE OR REPLACE VIEW "purchaseInvoices" AS 
  SELECT 
    pi."id",
    pi."invoiceId",
    pi."supplierId",
    pi."supplierReference",
    pi."invoiceSupplierId",
    pi."invoiceSupplierLocationId",
    pi."invoiceSupplierContactId",
    pi."postingDate",
    pi."dateIssued",
    pi."dateDue",
    pi."datePaid",
    pi."paymentTermId",
    pi."currencyCode",
    pi."exchangeRate",
    pi."subtotal",
    pi."totalDiscount",
    pi."totalAmount",
    pi."totalTax",
    pi."balance",
    pi."createdBy",
    pi."createdAt",
    pi."updatedBy",
    pi."updatedAt",
    CASE
      WHEN pi."dateDue" < CURRENT_DATE AND pi."status" = 'Submitted' THEN 'Overdue'
      ELSE pi."status"
    END AS status,
    s."name" AS "supplierName",
    c."fullName" AS "contactName",
    u."avatarUrl" AS "createdByAvatar",
    u."fullName" AS "createdByFullName",
    u2."avatarUrl" AS "updatedByAvatar",
    u2."fullName" AS "updatedByFullName"
  FROM "purchaseInvoice" pi
    LEFT JOIN "supplier" s ON s.id = pi."supplierId"
    LEFT JOIN "supplierContact" sc ON sc.id = pi."invoiceSupplierContactId"
    LEFT JOIN "contact" c ON c.id = sc."contactId"
    LEFT JOIN "user" u ON u."id" = pi."createdBy"
    LEFT JOIN "user" u2 ON u2."id" = pi."updatedBy";



ALTER VIEW "purchaseInvoices" SET (security_invoker = on);