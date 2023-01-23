CREATE TABLE "country" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL
);

CREATE TABLE "contact" (
  "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "title" TEXT,
  "mobilePhone" TEXT,
  "homePhone" TEXT,
  "workPhone" TEXT,
  "fax" TEXT,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "countryId" INTEGER,
  "birthday" DATE,
  "notes" TEXT,

  CONSTRAINT "contact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "contact_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE
);


CREATE TABLE "address" (
  "id" SERIAL PRIMARY KEY,
  "addressLine1" TEXT,
  "addressLine2" TEXT,
  "city" TEXT,
  "state" TEXT,
  "postalCode" TEXT,
  "countryId" INTEGER,
  "phone" TEXT,
  "fax" TEXT,

  CONSTRAINT "address_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "country"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "supplierStatus" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

INSERT INTO "supplierStatus" ("name") VALUES ('Active'), ('Inactive'), ('Pending'), ('Rejected');

CREATE TABLE "supplierType" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#000000',
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "supplierType_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplierType_colorCheck" CHECK ("color" is null or "color" ~* '^#[a-f0-9]{6}$')
);

CREATE TABLE "supplier" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "supplierTypeId" TEXT,
    "supplierStatusId" INTEGER,
    "taxId" TEXT,
    "accountManagerId" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT NOW() NOT NULL,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplier_supplierTypeId_fkey" FOREIGN KEY ("supplierTypeId") REFERENCES "supplierType"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_supplierStatusId_fkey" FOREIGN KEY ("supplierStatusId") REFERENCES "supplierStatus"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "supplier_name_unique" UNIQUE ("name")
);

CREATE TABLE "supplierLocation" (
  "id" SERIAL PRIMARY KEY,
  "supplierId" TEXT NOT NULL,
  "addressId" INTEGER NOT NULL,

  CONSTRAINT "supplierLocation_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierLocation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE "supplierContact" (
  "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
  "supplierId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "supplierLocationId" INTEGER,
  "userId" TEXT,

  CONSTRAINT "supplierContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "supplierContact_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "supplierContact_supplierLocationId_fkey" FOREIGN KEY ("supplierLocationId") REFERENCES "supplierLocation"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "supplierContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE "supplierAccount" (
    "id" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,

    CONSTRAINT "supplierAccount_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplierAccount_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "supplier"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "supplierAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "customerStatus" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3)
);

INSERT INTO "customerStatus" ("name") VALUES ('Active'), ('Inactive'), ('Prospect'), ('Lead'), ('On Hold'), ('Cancelled'), ('Archived');

CREATE TABLE "customerType" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "color" TEXT DEFAULT '#000000',
    "protected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "customerType_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customerType_colorCheck" CHECK ("color" is null or "color" ~* '^#[a-f0-9]{6}$')
);

CREATE TABLE "customer" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "customerTypeId" TEXT,
    "customerStatusId" INTEGER,
    "taxId" TEXT,
    "accountManagerId" TEXT,
    "logo" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT NOW() NOT NULL,
    "createdBy" TEXT,
    "updatedAt" TIMESTAMP(3),
    "updatedBy" TEXT,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customer_customerTypeId_fkey" FOREIGN KEY ("customerTypeId") REFERENCES "customerType"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_customerStatusId_fkey" FOREIGN KEY ("customerStatusId") REFERENCES "customerStatus"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_accountManagerId_fkey" FOREIGN KEY ("accountManagerId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL,
    CONSTRAINT "customer_name_unique" UNIQUE ("name")
);

CREATE TABLE "customerLocation" (
  "id" SERIAL PRIMARY KEY,
  "customerId" TEXT NOT NULL,
  "addressId" INTEGER NOT NULL,

  CONSTRAINT "customerLocation_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerLocation_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "address"("id") ON UPDATE CASCADE ON DELETE CASCADE
);

CREATE TABLE "customerContact" (
  "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
  "customerId" TEXT NOT NULL,
  "contactId" TEXT NOT NULL,
  "customerLocationId" INTEGER,
  "userId" TEXT,

  CONSTRAINT "customerContact_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "customerContact_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerContact_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contact"("id") ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT "customerContact_customerLocationId_fkey" FOREIGN KEY ("customerLocationId") REFERENCES "customerLocation"("id") ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT "customerContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON UPDATE CASCADE ON DELETE SET NULL
);

CREATE TABLE "customerAccount" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,

    CONSTRAINT "customerAccount_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "customerAccount_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "customerAccount_id_fkey" FOREIGN KEY ("id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
