import { withZod } from "@remix-validated-form/with-zod";
import { z } from "zod";
import { zfd } from "zod-form-data";

export const partTypes = ["Inventory", "Non-Inventory"] as const;
export const partReplenishmentSystems = [
  "Buy",
  "Make",
  "Buy and Make",
] as const;
export const partCostingMethods = [
  "Standard",
  "Average",
  "FIFO",
  "LIFO",
] as const;
export const partReorderingPolicies = [
  "Manual Reorder",
  "Demand-Based Reorder",
  "Fixed Reorder Quantity",
  "Maximum Quantity",
] as const;

export const partManufacturingPolicies = [
  "Make to Stock",
  "Make to Order",
] as const;

export const serviceType = ["Internal", "External"] as const;

export const partValidator = withZod(
  z.object({
    id: z.string().min(1, { message: "Part ID is required" }).max(255),
    name: z.string().min(1, { message: "Name is required" }).max(255),
    description: zfd.text(z.string().optional()),
    blocked: zfd.checkbox(),
    active: zfd.checkbox(),
    replenishmentSystem: z.enum(partReplenishmentSystems, {
      errorMap: (issue, ctx) => ({
        message: "Replenishment system is required",
      }),
    }),
    partGroupId: z.string().optional(),
    partType: z.enum(partTypes, {
      errorMap: (issue, ctx) => ({
        message: "Part type is required",
      }),
    }),
    unitOfMeasureCode: z
      .string()
      .min(1, { message: "Unit of Measure is required" }),
  })
);

export const partCostValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    costingMethod: z.enum(partCostingMethods, {
      errorMap: (issue, ctx) => ({
        message: "Costing method is required",
      }),
    }),
    standardCost: zfd.numeric(z.number().min(0)),
    unitCost: zfd.numeric(z.number().min(0)),
    costIsAdjusted: zfd.checkbox(),
  })
);

export const partGroupValidator = withZod(
  z.object({
    id: zfd.text(z.string().optional()),
    name: z.string().min(1, { message: "Name is required" }).max(255),
    description: z.string().optional(),
  })
);

export const partInventoryValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    locationId: z.string().min(20, { message: "Location is required" }),
    defaultShelfId: zfd.text(z.string().optional()),
    hasNewShelf: z.enum(["true", "false"]),
  })
);

export const partManufacturingValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    manufacturingPolicy: z.enum(partManufacturingPolicies, {
      errorMap: (issue, ctx) => ({
        message: "Manufacturing policy is required",
      }),
    }),
    manufacturingLeadTime: zfd.numeric(z.number().min(0)),
    manufacturingBlocked: zfd.checkbox(),
    requiresConfiguration: zfd.checkbox(),
    scrapPercentage: zfd.numeric(z.number().min(0).max(100)),
    lotSize: zfd.numeric(z.number().min(0)),
  })
);

export const partPlanningValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    locationId: z.string().min(20, { message: "Location is required" }),
    reorderingPolicy: z.enum(partReorderingPolicies, {
      errorMap: (issue, ctx) => ({
        message: "Reordering policy is required",
      }),
    }),
    critical: zfd.checkbox(),
    safetyStockQuantity: zfd.numeric(z.number().min(0)),
    safetyStockLeadTime: zfd.numeric(z.number().min(0)),
    demandAccumulationPeriod: zfd.numeric(z.number().min(0)),
    demandReschedulingPeriod: zfd.numeric(z.number().min(0)),
    demandAccumulationIncludesInventory: zfd.checkbox(),
    reorderPoint: zfd.numeric(z.number().min(0)),
    reorderQuantity: zfd.numeric(z.number().min(0)),
    reorderMaximumInventory: zfd.numeric(z.number().min(0)),
    minimumOrderQuantity: zfd.numeric(z.number().min(0)),
    maximumOrderQuantity: zfd.numeric(z.number().min(0)),
    orderMultiple: zfd.numeric(z.number().min(1)),
  })
);

export const partPurchasingValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    preferredSupplierId: zfd.text(z.string().optional()),
    conversionFactor: zfd.numeric(z.number().min(0)),
    purchasingLeadTime: zfd.numeric(z.number().min(0)),
    purchasingUnitOfMeasureCode: zfd.text(z.string().optional()),
    purchasingBlocked: zfd.checkbox(),
  })
);

export const partSupplierValidator = withZod(
  z.object({
    id: zfd.text(z.string().optional()),
    partId: z.string().min(1, { message: "Part ID is required" }),
    supplierId: z.string().min(36, { message: "Supplier ID is required" }),
    supplierPartId: z.string().optional(),
    supplierUnitOfMeasureCode: zfd.text(z.string().optional()),
    minimumOrderQuantity: zfd.numeric(z.number().min(0)),
    conversionFactor: zfd.numeric(z.number().min(0)),
  })
);

export const partUnitSalePriceValidator = withZod(
  z.object({
    partId: z.string().min(1, { message: "Part ID is required" }),
    unitSalePrice: zfd.numeric(z.number().min(0)),
    currencyCode: z.string().min(1, { message: "Currency is required" }),
    salesUnitOfMeasureCode: z
      .string()
      .min(1, { message: "Unit of Measure is required" }),
    salesBlocked: zfd.checkbox(),
    priceIncludesTax: zfd.checkbox(),
    allowInvoiceDiscount: zfd.checkbox(),
  })
);

export const serviceValidator = withZod(
  z.object({
    id: zfd.text(z.string().optional()),
    name: z.string().min(1, { message: "Name is required" }).max(255),
    description: z.string().optional(),
    serviceType: z.enum(serviceType, {
      errorMap: (issue, ctx) => ({
        message: "Service type is required",
      }),
    }),
    blocked: zfd.checkbox(),
    active: zfd.checkbox(),
  })
);

export const serviceSupplierValidator = withZod(
  z.object({
    id: zfd.text(z.string().optional()),
    serviceId: z.string().min(1, { message: "Part ID is required" }),
    supplierId: z.string().min(36, { message: "Supplier ID is required" }),
    supplierServiceId: z.string().optional(),
  })
);

export const unitOfMeasureValidator = withZod(
  z.object({
    id: zfd.text(z.string().optional()),
    code: z.string().min(1, { message: "Code is required" }).max(5),
    name: z.string().min(1, { message: "Name is required" }).max(50),
  })
);
