CREATE TABLE "partner" (
  "id" TEXT NOT NULL,
  "hoursPerWeek" INTEGER NOT NULL DEFAULT 0,
  "abilityId" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  "updatedBy" TEXT,
  "updatedAt" TIMESTAMP WITH TIME ZONE,

  CONSTRAINT "partner_pkey" PRIMARY KEY ("id", "abilityId"),
  CONSTRAINT "partner_id_fkey" FOREIGN KEY ("id") REFERENCES "supplierLocation"("id"),
  CONSTRAINT "partner_abilityId_fkey" FOREIGN KEY ("abilityId") REFERENCES "ability"("id"),
  CONSTRAINT "partner_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "user"("id"),
  CONSTRAINT "partner_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES "user"("id")
);

CREATE INDEX "partner_id_idx" ON "partner" ("id");
CREATE INDEX "partner_abilityId_idx" ON "partner" ("abilityId");

CREATE OR REPLACE VIEW "partners" AS
  SELECT 
    p.id AS "supplierLocationId", 
    p."active", 
    p."hoursPerWeek",
    p."abilityId",
    a2.name AS "abilityName",
    s.id AS "supplierId", 
    s.name AS "supplierName", 
    a.city,
    a.state
  FROM "partner" p 
    INNER JOIN "supplierLocation" sl 
      ON sl.id = p.id
    INNER JOIN "supplier" s
      ON s.id = sl."supplierId"
    INNER JOIN "address" a 
      ON a.id = sl."addressId"
    INNER JOIN "ability" a2
      ON a2.id = p."abilityId"
  WHERE p."active" = true;