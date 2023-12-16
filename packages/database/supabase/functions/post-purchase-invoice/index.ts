// deno-lint-ignore-file no-case-declarations
import { serve } from "https://deno.land/std@0.175.0/http/server.ts";
import { format } from "https://deno.land/std@0.205.0/datetime/mod.ts";
import { nanoid } from "https://deno.land/x/nanoid@v3.0.0/mod.ts";
import type { Database } from "../../../src/types.ts";
import { DB, getConnectionPool, getDatabaseClient } from "../lib/database.ts";
import { corsHeaders } from "../lib/headers.ts";
import { getSupabaseServiceRole } from "../lib/supabase.ts";
import { credit, debit, journalReference } from "../lib/utils.ts";
import { getCurrentAccountingPeriod } from "../shared/get-accounting-period.ts";
import { getNextSequence } from "../shared/get-next-sequence.ts";
import {
  getInventoryPostingGroup,
  getPurchasingPostingGroup,
} from "../shared/get-posting-group.ts";

const pool = getConnectionPool(1);
const db = getDatabaseClient<DB>(pool);

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { invoiceId } = await req.json();
  const today = format(new Date(), "yyyy-MM-dd");

  try {
    if (!invoiceId) throw new Error("Payload is missing invoiceId");

    const client = getSupabaseServiceRole(req.headers.get("Authorization"));

    const [purchaseInvoice, purchaseInvoiceLines] = await Promise.all([
      client.from("purchaseInvoice").select("*").eq("id", invoiceId).single(),
      client.from("purchaseInvoiceLine").select("*").eq("invoiceId", invoiceId),
    ]);

    if (purchaseInvoice.error)
      throw new Error("Failed to fetch purchaseInvoice");
    if (purchaseInvoiceLines.error)
      throw new Error("Failed to fetch receipt lines");

    const [partGroups, purchaseOrderLines, supplier] = await Promise.all([
      client
        .from("part")
        .select("id, partGroupId")
        .in(
          "id",
          purchaseInvoiceLines.data.reduce<string[]>((acc, invoiceLine) => {
            if (invoiceLine.partId && !acc.includes(invoiceLine.partId)) {
              acc.push(invoiceLine.partId);
            }
            return acc;
          }, [])
        ),
      client
        .from("purchaseOrderLine")
        .select("*")
        .in(
          "id",
          purchaseInvoiceLines.data.reduce<string[]>((acc, invoiceLine) => {
            if (
              invoiceLine.purchaseOrderLineId &&
              !acc.includes(invoiceLine.purchaseOrderLineId)
            ) {
              acc.push(invoiceLine.purchaseOrderLineId);
            }
            return acc;
          }, [])
        ),
      client
        .from("supplier")
        .select("*")
        .eq("id", purchaseInvoice.data.supplierId ?? "")
        .single(),
    ]);
    if (partGroups.error) throw new Error("Failed to fetch part groups");
    if (purchaseOrderLines.error)
      throw new Error("Failed to fetch purchase order lines");
    if (supplier.error) throw new Error("Failed to fetch supplier");

    const purchaseOrders = await client
      .from("purchaseOrder")
      .select("*")
      .in(
        "purchaseOrderId",
        purchaseOrderLines.data.reduce<string[]>((acc, purchaseOrderLine) => {
          if (
            purchaseOrderLine.purchaseOrderId &&
            !acc.includes(purchaseOrderLine.purchaseOrderId)
          ) {
            acc.push(purchaseOrderLine.purchaseOrderId);
          }
          return acc;
        }, [])
      );
    if (purchaseOrders.error)
      throw new Error("Failed to fetch purchase orders");

    const costLedgerInserts: Database["public"]["Tables"]["costLedger"]["Insert"][] =
      [];

    const journalLineInserts: Omit<
      Database["public"]["Tables"]["journalLine"]["Insert"],
      "journalId"
    >[] = [];

    const receiptLineInserts: Omit<
      Database["public"]["Tables"]["receiptLine"]["Insert"],
      "receiptId"
    >[] = [];

    const partLedgerInserts: Database["public"]["Tables"]["partLedger"]["Insert"][] =
      [];

    const purchaseInvoiceLinesByPurchaseOrderLine =
      purchaseInvoiceLines.data.reduce<
        Record<
          string,
          Database["public"]["Tables"]["purchaseInvoiceLine"]["Row"]
        >
      >((acc, invoiceLine) => {
        if (invoiceLine.purchaseOrderLineId) {
          acc[invoiceLine.purchaseOrderLineId] = invoiceLine;
        }
        return acc;
      }, {});

    const purchaseOrderLineUpdates = purchaseOrderLines.data.reduce<
      Record<
        string,
        Database["public"]["Tables"]["purchaseOrderLine"]["Update"]
      >
    >((acc, purchaseOrderLine) => {
      const invoiceLine =
        purchaseInvoiceLinesByPurchaseOrderLine[purchaseOrderLine.id];
      if (
        invoiceLine &&
        invoiceLine.quantity &&
        purchaseOrderLine.purchaseQuantity &&
        purchaseOrderLine.purchaseQuantity > 0
      ) {
        const newQuantityInvoiced =
          (purchaseOrderLine.quantityInvoiced ?? 0) + invoiceLine.quantity;

        const invoicedComplete =
          purchaseOrderLine.invoicedComplete ||
          invoiceLine.quantity >=
            (purchaseOrderLine.quantityToInvoice ??
              purchaseOrderLine.purchaseQuantity);

        return {
          ...acc,
          [purchaseOrderLine.id]: {
            quantityInvoiced: newQuantityInvoiced,
            invoicedComplete,
            purchaseOrderId: purchaseOrderLine.purchaseOrderId,
          },
        };
      }

      return acc;
    }, {});

    const journalLines = await client
      .from("journalLine")
      .select("*")
      .in(
        "documentLineReference",
        purchaseOrderLines.data.reduce<string[]>((acc, purchaseOrderLine) => {
          if (
            (purchaseOrderLine.quantityReceived ?? 0) >
            (purchaseOrderLine.quantityInvoiced ?? 0)
          ) {
            acc.push(journalReference.to.receipt(purchaseOrderLine.id));
          }
          return acc;
        }, [])
      );
    if (journalLines.error) {
      throw new Error("Failed to fetch journal entries to reverse");
    }

    const journalLinesByPurchaseOrderLine = journalLines.data.reduce<
      Record<string, Database["public"]["Tables"]["journalLine"]["Row"][]>
    >((acc, journalEntry) => {
      const [type, purchaseOrderLineId] = (
        journalEntry.documentLineReference ?? ""
      ).split(":");
      if (type === "receipt") {
        if (
          acc[purchaseOrderLineId] &&
          Array.isArray(acc[purchaseOrderLineId])
        ) {
          acc[purchaseOrderLineId].push(journalEntry);
        } else {
          acc[purchaseOrderLineId] = [journalEntry];
        }
      }
      return acc;
    }, {});

    // save the posting groups in memory to avoid unnecessary queries
    const inventoryPostingGroups: Record<
      string,
      Database["public"]["Tables"]["postingGroupInventory"]["Row"] | null
    > = {};

    for await (const invoiceLine of purchaseInvoiceLines.data) {
      switch (invoiceLine.invoiceLineType) {
        case "G/L Account":
          const [account, accountDefaults] = await Promise.all([
            client
              .from("accounts")
              .select("name, number, directPosting")
              .eq("number", invoiceLine.accountNumber ?? "")
              .single(),
            client
              .from("accountDefault")
              .select(
                "overheadCostAppliedAccount, payablesAccount, purchaseAccount"
              )
              .single(),
          ]);
          if (account.error || !account.data)
            throw new Error("Failed to fetch account");
          if (!account.data.directPosting)
            throw new Error("Account is not a direct posting account");

          if (accountDefaults.error || !accountDefaults.data)
            throw new Error("Failed to fetch account defaults");

          let journalLineReference = nanoid();

          // debit the G/L account
          journalLineInserts.push({
            accountNumber: account.data.number!,
            description: account.data.name!,
            // we limit the account to assets and expenses in the UI, so we don't need to check here
            amount: debit(
              "asset",
              invoiceLine.quantity * invoiceLine.unitPrice
            ),
            quantity: invoiceLine.quantity,
            documentType: "Invoice",
            documentId: purchaseInvoice.data?.id,
            externalDocumentId: purchaseInvoice.data?.supplierReference,
            documentLineReference: journalReference.to.purchaseInvoice(
              invoiceLine.purchaseOrderLineId!
            ),
            journalLineReference,
          });

          // creidt the direct cost applied account
          journalLineInserts.push({
            accountNumber: accountDefaults.data.overheadCostAppliedAccount!,
            description: "Overhead Cost Applied",
            amount: credit(
              "expense",
              invoiceLine.quantity * invoiceLine.unitPrice
            ),
            quantity: invoiceLine.quantity,
            documentType: "Invoice",
            documentId: purchaseInvoice.data?.id,
            externalDocumentId: purchaseInvoice.data?.supplierReference,
            documentLineReference: journalReference.to.purchaseInvoice(
              invoiceLine.purchaseOrderLineId!
            ),
            journalLineReference,
          });

          journalLineReference = nanoid();

          // debit the purchase account
          journalLineInserts.push({
            accountNumber: accountDefaults.data.purchaseAccount!,
            description: "Purchase Account",
            amount: debit(
              "expense",
              invoiceLine.quantity * invoiceLine.unitPrice
            ),
            quantity: invoiceLine.quantity,
            documentType: "Invoice",
            documentId: purchaseInvoice.data?.id,
            externalDocumentId: purchaseInvoice.data?.supplierReference,
            documentLineReference: journalReference.to.purchaseInvoice(
              invoiceLine.purchaseOrderLineId!
            ),
            journalLineReference,
          });

          // credit the accounts payable account
          journalLineInserts.push({
            accountNumber: accountDefaults.data.payablesAccount!,
            description: "Accounts Payable",
            amount: credit(
              "liability",
              invoiceLine.quantity * invoiceLine.unitPrice
            ),
            quantity: invoiceLine.quantity,
            documentType: "Invoice",
            documentId: purchaseInvoice.data?.id,
            externalDocumentId: purchaseInvoice.data?.supplierReference,
            documentLineReference: journalReference.to.purchaseInvoice(
              invoiceLine.purchaseOrderLineId!
            ),
            journalLineReference,
          });
          break;
        case "Part":
          let postingGroupInventory:
            | Database["public"]["Tables"]["postingGroupInventory"]["Row"]
            | null = null;

          const partGroupId: string | null =
            partGroups.data.find(
              (partGroup) => partGroup.id === invoiceLine.partId
            )?.partGroupId ?? null;
          const locationId = invoiceLine.locationId ?? null;
          const supplierTypeId: string | null =
            supplier.data.supplierTypeId ?? null;

          // inventory posting group
          if (`${partGroupId}-${locationId}` in inventoryPostingGroups) {
            postingGroupInventory =
              inventoryPostingGroups[`${partGroupId}-${locationId}`];
          } else {
            const inventoryPostingGroup = await getInventoryPostingGroup(
              client,
              {
                partGroupId,
                locationId,
              }
            );

            if (inventoryPostingGroup.error || !inventoryPostingGroup.data) {
              throw new Error("Error getting inventory posting group");
            }

            postingGroupInventory = inventoryPostingGroup.data ?? null;
            inventoryPostingGroups[`${partGroupId}-${locationId}`] =
              postingGroupInventory;
          }

          if (!postingGroupInventory) {
            throw new Error("No inventory posting group found");
          }

          // purchasing posting group
          const purchasingPostingGroups: Record<
            string,
            Database["public"]["Tables"]["postingGroupPurchasing"]["Row"] | null
          > = {};

          let postingGroupPurchasing:
            | Database["public"]["Tables"]["postingGroupPurchasing"]["Row"]
            | null = null;

          if (`${partGroupId}-${supplierTypeId}` in purchasingPostingGroups) {
            postingGroupPurchasing =
              purchasingPostingGroups[`${partGroupId}-${supplierTypeId}`];
          } else {
            const purchasingPostingGroup = await getPurchasingPostingGroup(
              client,
              {
                partGroupId,
                supplierTypeId,
              }
            );

            if (purchasingPostingGroup.error || !purchasingPostingGroup.data) {
              throw new Error("Error getting purchasing posting group");
            }

            postingGroupPurchasing = purchasingPostingGroup.data ?? null;
            purchasingPostingGroups[`${partGroupId}-${supplierTypeId}`] =
              postingGroupPurchasing;
          }

          if (!postingGroupPurchasing) {
            throw new Error("No purchasing posting group found");
          }

          // if the purchase order line is null, we receive the part, do the normal entries and do not use accrual/reversing
          if (invoiceLine.purchaseOrderLineId === null) {
            // create the receipt line
            receiptLineInserts.push({
              partId: invoiceLine.partId!,
              lineId: invoiceLine.id,
              orderQuantity: invoiceLine.quantity,
              outstandingQuantity: invoiceLine.quantity,
              receivedQuantity: invoiceLine.quantity,
              locationId: invoiceLine.locationId,
              shelfId: invoiceLine.shelfId,
              unitOfMeasure: invoiceLine.unitOfMeasureCode ?? "EA",
              unitPrice: invoiceLine.unitPrice,
              createdBy: invoiceLine.createdBy,
            });

            // create the part ledger line
            partLedgerInserts.push({
              postingDate: today,
              partId: invoiceLine.partId!,
              quantity: invoiceLine.quantity,
              locationId: invoiceLine.locationId,
              shelfId: invoiceLine.shelfId,
              entryType: "Positive Adjmt.",
              documentType: "Purchase Receipt",
              documentId: purchaseInvoice.data?.id ?? undefined,
              externalDocumentId:
                purchaseInvoice.data?.supplierReference ?? undefined,
            });

            // create the cost ledger line
            costLedgerInserts.push({
              partLedgerType: "Purchase",
              costLedgerType: "Direct Cost",
              adjustment: false,
              documentType: "Purchase Invoice",
              documentId: purchaseInvoice.data?.id ?? undefined,
              externalDocumentId:
                purchaseInvoice.data?.supplierReference ?? undefined,
              partId: invoiceLine.partId,
              quantity: invoiceLine.quantity,
              cost: invoiceLine.quantity * invoiceLine.unitPrice,
              costPostedToGL: invoiceLine.quantity * invoiceLine.unitPrice,
            });

            // create the normal GL entries

            let journalLineReference = nanoid();

            // debit the inventory account
            journalLineInserts.push({
              accountNumber: postingGroupInventory.inventoryAccount,
              description: "Inventory Account",
              amount: debit(
                "asset",
                invoiceLine.quantity * invoiceLine.unitPrice
              ),
              quantity: invoiceLine.quantity,
              documentType: "Invoice",
              documentId: purchaseInvoice.data?.id,
              externalDocumentId: purchaseInvoice.data?.supplierReference,
              journalLineReference,
            });

            // creidt the direct cost applied account
            journalLineInserts.push({
              accountNumber: postingGroupInventory.directCostAppliedAccount,
              description: "Direct Cost Applied",
              amount: credit(
                "expense",
                invoiceLine.quantity * invoiceLine.unitPrice
              ),
              quantity: invoiceLine.quantity,
              documentType: "Invoice",
              documentId: purchaseInvoice.data?.id,
              externalDocumentId: purchaseInvoice.data?.supplierReference,
              journalLineReference,
            });

            journalLineReference = nanoid();

            // debit the purchase account
            journalLineInserts.push({
              accountNumber: postingGroupPurchasing.purchaseAccount,
              description: "Purchase Account",
              amount: debit(
                "expense",
                invoiceLine.quantity * invoiceLine.unitPrice
              ),
              quantity: invoiceLine.quantity,
              documentType: "Invoice",
              documentId: purchaseInvoice.data?.id,
              externalDocumentId: purchaseInvoice.data?.supplierReference,
              documentLineReference: journalReference.to.purchaseInvoice(
                invoiceLine.purchaseOrderLineId!
              ),
              journalLineReference,
            });

            // credit the accounts payable account
            journalLineInserts.push({
              accountNumber: postingGroupPurchasing.payablesAccount,
              description: "Accounts Payable",
              amount: credit(
                "liability",
                invoiceLine.quantity * invoiceLine.unitPrice
              ),
              quantity: invoiceLine.quantity,
              documentType: "Invoice",
              documentId: purchaseInvoice.data?.id,
              externalDocumentId: purchaseInvoice.data?.supplierReference,
              documentLineReference: journalReference.to.purchaseInvoice(
                invoiceLine.purchaseOrderLineId!
              ),
              journalLineReference,
            });
          } // if the line is associated with a purchase order line, we do accrual/reversing
          else {
            // determine the journal lines that should be reversed
            const existingJournalLines = invoiceLine.purchaseOrderLineId
              ? journalLinesByPurchaseOrderLine[
                  invoiceLine.purchaseOrderLineId
                ] ?? []
              : [];

            let previousJournalId: number | null = null;
            let previousAccrual: boolean | null = null;
            let currentGroup = 0;

            const existingJournalLineGroups = existingJournalLines.reduce<
              Database["public"]["Tables"]["journalLine"]["Row"][][]
            >((acc, entry) => {
              const { journalId, accrual } = entry;

              if (
                journalId === previousJournalId &&
                accrual === previousAccrual
              ) {
                acc[currentGroup - 1].push(entry);
              } else {
                acc.push([entry]);
                currentGroup++;
              }

              previousJournalId = journalId;
              previousAccrual = accrual;
              return acc;
            }, []);

            const purchaseOrderLine = purchaseOrderLines.data.find(
              (line) => line.id === invoiceLine.purchaseOrderLineId
            );

            const quantityReceived = purchaseOrderLine?.quantityReceived ?? 0;
            const quantityInvoiced = purchaseOrderLine?.quantityInvoiced ?? 0;
            const quantityToReverse = Math.max(
              0,
              Math.min(
                invoiceLine.quantity ?? 0,
                quantityReceived - quantityInvoiced
              )
            );

            const quantityAlreadyReversed =
              quantityReceived > quantityInvoiced ? quantityInvoiced : 0;

            if (quantityToReverse > 0) {
              let counted = 0;
              let reversed = 0;

              existingJournalLineGroups.forEach((entry) => {
                if (entry[0].quantity) {
                  const unitCostForEntry =
                    (entry[0].amount ?? 0) / entry[0].quantity;

                  // we don't want to reverse an entry twice, so we need to keep track of what's been previously reversed

                  // akin to supply
                  const quantityAvailableToReverseForEntry =
                    quantityAlreadyReversed > counted
                      ? entry[0].quantity + counted - quantityAlreadyReversed
                      : entry[0].quantity;

                  // akin to demand
                  const quantityRequiredToReverse =
                    quantityToReverse - reversed;

                  // we can't reverse more than what's available or what's required
                  const quantityToReverseForEntry = Math.max(
                    0,
                    Math.min(
                      quantityAvailableToReverseForEntry,
                      quantityRequiredToReverse
                    )
                  );

                  if (quantityToReverseForEntry > 0) {
                    const journalLineReference = nanoid();

                    // create the reversal entries
                    journalLineInserts.push({
                      accountNumber: entry[0].accountNumber!,
                      description: entry[0].description,
                      amount:
                        entry[0].description === "Interim Inventory Accrual"
                          ? credit(
                              "asset",
                              quantityToReverseForEntry * unitCostForEntry
                            )
                          : debit(
                              "liability",
                              quantityToReverseForEntry * unitCostForEntry
                            ),
                      quantity: quantityToReverseForEntry,
                      documentType: "Invoice",
                      documentId: purchaseInvoice.data?.id,
                      externalDocumentId:
                        purchaseInvoice?.data.supplierReference,
                      documentLineReference: invoiceLine.purchaseOrderLineId
                        ? journalReference.to.purchaseInvoice(
                            invoiceLine.purchaseOrderLineId
                          )
                        : null,
                      journalLineReference,
                    });

                    journalLineInserts.push({
                      accountNumber: entry[1].accountNumber!,
                      description: entry[1].description,
                      amount:
                        entry[1].description === "Interim Inventory Accrual"
                          ? credit(
                              "asset",
                              quantityToReverseForEntry * unitCostForEntry
                            )
                          : debit(
                              "liability",
                              quantityToReverseForEntry * unitCostForEntry
                            ),
                      quantity: quantityToReverseForEntry,
                      documentType: "Invoice",
                      documentId: purchaseInvoice.data?.id,
                      externalDocumentId:
                        purchaseInvoice?.data.supplierReference,
                      documentLineReference:
                        journalReference.to.purchaseInvoice(
                          invoiceLine.purchaseOrderLineId!
                        ),
                      journalLineReference,
                    });
                  }

                  counted += entry[0].quantity;
                  reversed += quantityToReverseForEntry;
                }
              });

              // create the cost entry
              costLedgerInserts.push({
                partLedgerType: "Purchase",
                costLedgerType: "Direct Cost",
                adjustment: false,
                documentType: "Purchase Invoice",
                documentId: purchaseInvoice.data?.id ?? undefined,
                externalDocumentId:
                  purchaseInvoice.data?.supplierReference ?? undefined,
                partId: invoiceLine.partId,
                quantity: quantityToReverse,
                cost: quantityToReverse * invoiceLine.unitPrice,
                costPostedToGL: quantityToReverse * invoiceLine.unitPrice,
              });

              // create the normal GL entries

              let journalLineReference = nanoid();

              // debit the inventory account
              journalLineInserts.push({
                accountNumber: postingGroupInventory.inventoryAccount,
                description: "Inventory Account",
                amount: debit(
                  "asset",
                  quantityToReverse * invoiceLine.unitPrice
                ),
                quantity: quantityToReverse,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: journalReference.to.purchaseInvoice(
                  invoiceLine.purchaseOrderLineId!
                ),
                journalLineReference,
              });

              // creidt the direct cost applied account
              journalLineInserts.push({
                accountNumber: postingGroupInventory.directCostAppliedAccount,
                description: "Direct Cost Applied",
                amount: credit(
                  "expense",
                  quantityToReverse * invoiceLine.unitPrice
                ),
                quantity: quantityToReverse,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: journalReference.to.purchaseInvoice(
                  invoiceLine.purchaseOrderLineId!
                ),
                journalLineReference,
              });

              journalLineReference = nanoid();

              // debit the purchase account
              journalLineInserts.push({
                accountNumber: postingGroupPurchasing.purchaseAccount,
                description: "Purchase Account",
                amount: debit(
                  "expense",
                  quantityToReverse * invoiceLine.unitPrice
                ),
                quantity: quantityToReverse,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: journalReference.to.purchaseInvoice(
                  invoiceLine.purchaseOrderLineId!
                ),
                journalLineReference,
              });

              // credit the accounts payable account
              journalLineInserts.push({
                accountNumber: postingGroupPurchasing.payablesAccount,
                description: "Accounts Payable",
                amount: credit(
                  "liability",
                  quantityToReverse * invoiceLine.unitPrice
                ),
                quantity: quantityToReverse,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: journalReference.to.purchaseInvoice(
                  invoiceLine.purchaseOrderLineId!
                ),
                journalLineReference,
              });
            }

            if (invoiceLine.quantity > quantityToReverse) {
              // create the accrual entries for invoiced not received
              const quantityToAccrue = invoiceLine.quantity - quantityToReverse;

              const journalLineReference = nanoid();

              // debit the inventory invoiced not received account
              journalLineInserts.push({
                accountNumber:
                  postingGroupInventory.inventoryInvoicedNotReceivedAccount,
                description: "Inventory Invoiced Not Received",
                accrual: true,
                amount: debit(
                  "asset",
                  quantityToAccrue * invoiceLine.unitPrice
                ),
                quantity: quantityToAccrue,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: invoiceLine.purchaseOrderLineId
                  ? journalReference.to.purchaseInvoice(
                      invoiceLine.purchaseOrderLineId
                    )
                  : null,
                journalLineReference,
              });

              // credit the inventory interim accrual account
              journalLineInserts.push({
                accountNumber:
                  postingGroupInventory.inventoryInterimAccrualAccount,
                accrual: true,
                description: "Interim Inventory Accrual",
                amount: credit(
                  "asset",
                  quantityToAccrue * invoiceLine.unitPrice
                ),
                quantity: quantityToAccrue,
                documentType: "Invoice",
                documentId: purchaseInvoice.data?.id,
                externalDocumentId: purchaseInvoice.data?.supplierReference,
                documentLineReference: invoiceLine.purchaseOrderLineId
                  ? journalReference.to.purchaseInvoice(
                      invoiceLine.purchaseOrderLineId
                    )
                  : null,
                journalLineReference,
              });
            }
          }

          break;
        case "Fixed Asset":
          // TODO: fixed assets
          break;
        case "Comment":
          break;
        default:
          throw new Error("Unsupported invoice line type");
      }
    }

    const accountingPeriodId = await getCurrentAccountingPeriod(client, db);

    await db.transaction().execute(async (trx) => {
      if (receiptLineInserts.length > 0 && partLedgerInserts.length > 0) {
        const receiptLinesGroupedByLocationId = receiptLineInserts.reduce<
          Record<string, typeof receiptLineInserts>
        >((acc, line) => {
          if (line.locationId) {
            if (line.locationId in acc) {
              acc[line.locationId].push(line);
            } else {
              acc[line.locationId] = [line];
            }
          }

          return acc;
        }, {});

        for await (const [locationId, receiptLines] of Object.entries(
          receiptLinesGroupedByLocationId
        )) {
          const readableReceiptId = await getNextSequence(trx, "receipt");
          const receipt = await trx
            .insertInto("receipt")
            .values({
              receiptId: readableReceiptId,
              locationId,
              sourceDocument: "Purchase Invoice",
              sourceDocumentId: purchaseInvoice.data.id,
              sourceDocumentReadableId: purchaseInvoice.data.invoiceId,
              externalDocumentId: purchaseInvoice.data.supplierReference,
              supplierId: purchaseInvoice.data.supplierId,
              status: "Posted",
              postingDate: today,
              invoiced: true,
              createdBy: purchaseInvoice.data.createdBy,
            })
            .returning(["id"])
            .execute();

          const receiptId = receipt[0].id;
          if (!receiptId) throw new Error("Failed to insert receipt");

          await trx
            .insertInto("receiptLine")
            .values(
              receiptLines.map((r) => ({
                ...r,
                receiptId: receiptId,
              }))
            )
            .returning(["id"])
            .execute();
        }
      }

      for await (const [purchaseOrderLineId, update] of Object.entries(
        purchaseOrderLineUpdates
      )) {
        await trx
          .updateTable("purchaseOrderLine")
          .set(update)
          .where("id", "=", purchaseOrderLineId)
          .execute();
      }

      const purchaseOrdersUpdated = Object.values(
        purchaseOrderLineUpdates
      ).reduce<string[]>((acc, update) => {
        if (update.purchaseOrderId && !acc.includes(update.purchaseOrderId)) {
          acc.push(update.purchaseOrderId);
        }
        return acc;
      }, []);

      for await (const purchaseOrderId of purchaseOrdersUpdated) {
        const purchaseOrderLines = await trx
          .selectFrom("purchaseOrderLine")
          .select(["id", "invoicedComplete", "receivedComplete"])
          .where("purchaseOrderId", "=", purchaseOrderId)
          .execute();

        const areAllLinesInvoiced = purchaseOrderLines.every(
          (line) => line.invoicedComplete
        );

        const areAllLinesReceived = purchaseOrderLines.every(
          (line) => line.receivedComplete
        );

        let status: Database["public"]["Tables"]["purchaseOrder"]["Row"]["status"] =
          "To Receive and Invoice";

        if (areAllLinesInvoiced && areAllLinesReceived) {
          status = "Completed";
        } else if (areAllLinesInvoiced) {
          status = "To Receive";
        } else if (areAllLinesReceived) {
          status = "To Invoice";
        }

        await trx
          .updateTable("purchaseOrder")
          .set({
            status,
          })
          .where("id", "=", purchaseOrderId)
          .execute();
      }

      const journal = await trx
        .insertInto("journal")
        .values({
          accountingPeriodId,
          description: `Purchase Invoice ${purchaseInvoice.data?.invoiceId}`,
          postingDate: today,
        })
        .returning(["id"])
        .execute();

      const journalId = journal[0].id;
      if (!journalId) throw new Error("Failed to insert journal");

      await trx
        .insertInto("journalLine")
        .values(
          journalLineInserts.map((journalLine) => ({
            ...journalLine,
            journalId,
          }))
        )
        .returning(["id"])
        .execute();

      if (partLedgerInserts.length > 0) {
        await trx
          .insertInto("partLedger")
          .values(partLedgerInserts)
          .returning(["id"])
          .execute();
      }

      if (costLedgerInserts.length > 0) {
        await trx
          .insertInto("costLedger")
          .values(costLedgerInserts)
          .returning(["id"])
          .execute();
      }

      await trx
        .updateTable("purchaseInvoice")
        .set({
          postingDate: today,
          status: "Submitted",
        })
        .where("id", "=", invoiceId)
        .execute();
    });

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error(err);
    if (invoiceId) {
      const client = getSupabaseServiceRole(req.headers.get("Authorization"));
      client
        .from("purchaseInvoice")
        .update({ status: "Draft" })
        .eq("id", invoiceId);
    }
    return new Response(JSON.stringify(err), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
