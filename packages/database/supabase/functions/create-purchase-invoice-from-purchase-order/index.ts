import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";

import { Database } from "../../../src/types.ts";
import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";
import { getNextSequence } from "../shared/get-next-sequence.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  const { id: purchaseOrderId, userId } = await req.json();

  try {
    if (!purchaseOrderId) throw new Error("Payload is missing id");
    if (!userId) throw new Error("Payload is missing userId");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));

    const [purchaseOrder, purchaseOrderLines, purchaseOrderPayment] =
      await Promise.all([
        client
          .from("purchaseOrder")
          .select("*")
          .eq("id", purchaseOrderId)
          .single(),
        client
          .from("purchaseOrderLine")
          .select("*")
          .eq("purchaseOrderId", purchaseOrderId),
        client
          .from("purchaseOrderPayment")
          .select("*")
          .eq("id", purchaseOrderId)
          .single(),
      ]);

    if (!purchaseOrder.data) throw new Error("Purchase order not found");
    if (purchaseOrderLines.error)
      throw new Error(purchaseOrderLines.error.message);
    if (!purchaseOrderPayment.data)
      throw new Error("Purchase order payment not found");

    const uninvoicedLines = purchaseOrderLines?.data?.reduce<
      (typeof purchaseOrderLines)["data"]
    >((acc, line) => {
      if (line?.quantityToInvoice && line.quantityToInvoice > 0) {
        acc.push(line);
      }

      return acc;
    }, []);

    const uninvoicedSubtotal = uninvoicedLines?.reduce((acc, line) => {
      if (
        line?.quantityToInvoice &&
        line.unitPrice &&
        line.quantityToInvoice > 0
      ) {
        acc += line.quantityToInvoice * line.unitPrice;
      }

      return acc;
    }, 0);

    let purchaseInvoiceId = "";

    await db.transaction().execute(async (trx) => {
      purchaseInvoiceId = await getNextSequence(trx, "purchaseInvoice");

      const purchaseInvoice = await trx
        .insertInto("purchaseInvoice")
        .values({
          invoiceId: purchaseInvoiceId,
          status: "Draft",
          supplierId: purchaseOrder.data?.supplierId,
          supplierReference: purchaseOrder.data?.supplierReference,
          invoiceSupplierId: purchaseOrderPayment.data.invoiceSupplierId,
          invoiceSupplierContactId:
            purchaseOrderPayment.data.invoiceSupplierContactId,
          invoiceSupplierLocationId:
            purchaseOrderPayment.data.invoiceSupplierLocationId,
          paymentTermId: purchaseOrderPayment.data.paymentTermId,
          currencyCode: purchaseOrderPayment.data.currencyCode,
          exchangeRate: 1,
          subtotal: uninvoicedSubtotal,
          totalDiscount: 0,
          totalAmount: uninvoicedSubtotal,
          totalTax: 0,
          balance: uninvoicedSubtotal,
          createdBy: userId,
        })
        .returning(["id"])
        .executeTakeFirstOrThrow();

      if (!purchaseInvoice.id) throw new Error("Purchase invoice not created");
      purchaseInvoiceId = purchaseInvoice.id;

      const purchaseInvoiceLines = uninvoicedLines?.reduce<
        Database["public"]["Tables"]["purchaseInvoiceLine"]["Insert"][]
      >((acc, line) => {
        if (
          line?.quantityToInvoice &&
          line.quantityToInvoice > 0 &&
          !line.invoicedComplete
        ) {
          acc.push({
            invoiceId: purchaseInvoiceId,
            invoiceLineType: line.purchaseOrderLineType,
            purchaseOrderId: line.purchaseOrderId,
            purchaseOrderLineId: line.id,
            partId: line.partId,
            serviceId: line.serviceId,
            locationId: line.locationId,
            shelfId: line.shelfId,
            accountNumber: line.accountNumber,
            assetId: line.assetId,
            description: line.description,
            quantity: line.quantityToInvoice,
            unitPrice: line.unitPrice ?? 0,
            // TODO: currency code and exchange rate
            currencyCode: "USD",
            exchangeRate: 1,
            createdBy: userId,
          });
        }
        return acc;
      }, []);

      await trx
        .insertInto("purchaseInvoiceLine")
        .values(purchaseInvoiceLines)
        .execute();
    });

    return new Response(
      JSON.stringify({
        id: purchaseInvoiceId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 201,
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
