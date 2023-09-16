import { useMatches, useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { EditableNumber } from "~/components/Editable";
import { usePermissions, useRouteData, useUrlParams, useUser } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import type { receiptValidator } from "~/modules/inventory";
import type {
  ReceiptLine,
  ReceiptLineItem,
  ReceiptSourceDocument,
} from "~/modules/inventory/types";
import type { PurchaseOrderLine } from "~/modules/purchasing";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";

export default function useReceiptForm({
  receipt,
  receiptLines,
}: {
  receipt: TypeOfValidator<typeof receiptValidator>;
  receiptLines: ReceiptLine[];
}) {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const user = useUser();
  const [params] = useUrlParams();
  const [error, setError] = useState<string | null>(null);
  const { supabase } = useSupabase();

  const isDisabled = !permissions.can("update", "inventory");
  const isEditing = !useMatches().some(({ pathname }) =>
    pathname.includes("new")
  );

  const routeData = useRouteData<{
    locations: ListItem[];
  }>("/x/inventory/receipts");

  const [internalReceiptItems, setReceiptItems] = useState<ReceiptLine[]>(
    receiptLines ?? []
  );

  const [locationId, setLocationId] = useState<string | null>(
    receipt.locationId ?? user.defaults.locationId ?? null
  );
  const [supplierId, setSupplierId] = useState<string | null>(
    receipt.supplierId ?? null
  );

  const [sourceDocuments, setSourceDocuments] = useState<ListItem[]>([]);
  const [sourceDocument, setSourceDocument] = useState<ReceiptSourceDocument>(
    receipt.sourceDocument ?? "Purchase Order"
  );

  const [sourceDocumentId, setSourceDocumentId] = useState<string | null>(
    receipt.sourceDocumentId ?? null
  );

  const onClose = async () => {
    if (
      !isEditing &&
      (!sourceDocumentId || !locationId || receiptLines.length === 0)
    ) {
      await deleteReceipt();
    }

    if (isEditing) {
      navigate(`/x/inventory/receipts`);
    } else {
      navigate(-1);
    }
  };

  const onPost = () => {
    navigate(`/x/inventory/receipts/${receipt.id}/post`);
  };

  const sourceDocumentIdFromParams = params.get("sourceDocumentId");
  const sourceDocumentFromParams = params.get("sourceDocument");

  useEffect(() => {
    if (sourceDocumentIdFromParams && sourceDocumentFromParams) {
      setSourceDocument(sourceDocumentFromParams as ReceiptSourceDocument);
      setSourceDocumentId(sourceDocumentIdFromParams);
    }
  }, [
    setSourceDocument,
    setSourceDocumentId,
    sourceDocumentFromParams,
    sourceDocumentIdFromParams,
  ]);

  //  TODO: verify that it is not posted or received
  const deleteReceipt = useCallback(async () => {
    if (!supabase) return;

    try {
      await fetch(
        `/api/settings/sequence/rollback?table=receipt&currentSequence=${receipt.receiptId}`,
        {
          method: "DELETE",
        }
      )
        .then(console.log)
        .catch(console.error);

      await supabase
        .from("receipt")
        .delete()
        .eq("receiptId", receipt.receiptId);
    } catch {
      setError("Failed to delete receipt");
    }
  }, [receipt.receiptId, supabase]);

  const deleteReceiptItems = useCallback(async () => {
    if (!supabase) throw new Error("supabase client is not defined");

    return supabase
      .from("receiptLine")
      .delete()
      .eq("receiptId", receipt.receiptId);
  }, [receipt.receiptId, supabase]);

  const fetchSourceDocuments = useCallback(() => {
    if (!supabase) return;

    switch (sourceDocument) {
      case "Purchase Order":
        supabase
          ?.from("purchaseOrder")
          .select("id, purchaseOrderId")
          .eq("status", "Released")
          .then((response) => {
            if (response.error) {
              setError(response.error.message);
            } else {
              setSourceDocuments(
                response.data.map((d) => ({
                  name: d.purchaseOrderId,
                  id: d.id,
                }))
              );
            }
          });

      default:
        setSourceDocuments([]);
    }
  }, [sourceDocument, supabase]);

  const fetchSourceDocument = useCallback(async () => {
    if (!supabase || !sourceDocumentId) return;

    switch (sourceDocument) {
      case "Purchase Order":
        const [
          purchaseOrder,
          receiptLines,
          previouslyReceivedLines,
          purchaseOrderLines,
        ] = await Promise.all([
          supabase
            .from("purchase_order_view")
            .select("*")
            .eq("id", sourceDocumentId)
            .single(),

          supabase
            .from("receiptLine")
            .select("*")
            .eq("receiptId", receipt.receiptId),
          supabase
            .from("receipt_quantity_received_by_line")
            .select("*")
            .eq("sourceDocumentId", sourceDocumentId),
          locationId
            ? supabase
                .from("purchaseOrderLine")
                .select("*")
                .eq("purchaseOrderId", sourceDocumentId)
                .eq("purchaseOrderLineType", "Part")
                .eq("locationId", locationId)
            : Promise.resolve({ data: [] as PurchaseOrderLine[], error: null }),
        ]);

        if (purchaseOrder.error) {
          setError(purchaseOrder.error.message);
          setReceiptItems([]);
          break;
        } else {
          setSupplierId(purchaseOrder.data.supplierId);
        }

        if (receiptLines.error) {
          setError(receiptLines.error.message);
          setReceiptItems([]);
          break;
        }

        if (
          receipt.sourceDocumentId === sourceDocumentId &&
          receiptLines.data.length > 0
        ) {
          // no need to insert and fetch lines if they already exist
          setReceiptItems(receiptLines.data);
          break;
        }

        const deleteExistingLines = await deleteReceiptItems();
        if (deleteExistingLines.error) {
          setError(deleteExistingLines.error.message);
          break;
        }

        if (purchaseOrderLines.error) {
          setError(purchaseOrderLines.error.message);
          break;
        }

        const previouslyReceivedQuantitiesByLine = (
          previouslyReceivedLines.data ?? []
        ).reduce<Record<string, number>>((acc, d) => {
          if (d.lineId) acc[d.lineId] = d.receivedQuantity ?? 0;
          return acc;
        }, {});

        const receiptLineItems = purchaseOrderLines.data.reduce<
          ReceiptLineItem[]
        >((acc, d) => {
          if (
            !d.partId ||
            !d.purchaseQuantity ||
            d.unitPrice === null ||
            isNaN(d.unitPrice)
          ) {
            return acc;
          }

          const outstandingQuantity =
            d.purchaseQuantity -
            (previouslyReceivedQuantitiesByLine[d.id] ?? 0);

          acc.push({
            receiptId: receipt.receiptId,
            lineId: d.id,
            partId: d.partId,
            orderQuantity: d.purchaseQuantity,
            outstandingQuantity,
            receivedQuantity: outstandingQuantity,
            unitPrice: d.unitPrice,
            unitOfMeasure: d.unitOfMeasureCode ?? "EA",
            locationId: d.locationId,
            shelfId: d.shelfId,
            createdBy: user?.id ?? "",
          });

          return acc;
        }, []);

        const { error: insertError } = await supabase
          .from("receiptLine")
          .insert(receiptLineItems);

        if (insertError) {
          setError(insertError.message);
          setReceiptItems([]);
          break;
        }

        const { data: receiptLinesData, error: selectError } = await supabase
          .from("receiptLine")
          .select("*")
          .eq("receiptId", receipt.receiptId);

        if (selectError) {
          setError(selectError.message);
          setReceiptItems([]);
          break;
        }

        setReceiptItems(receiptLinesData ?? []);
        break;
      default:
        return;
    }
  }, [
    deleteReceiptItems,
    locationId,
    receipt.receiptId,
    receipt.sourceDocumentId,
    sourceDocument,
    sourceDocumentId,
    supabase,
    user?.id,
  ]);

  useEffect(() => {
    fetchSourceDocuments();
  }, [fetchSourceDocuments, sourceDocument]);

  useEffect(() => {
    if (sourceDocumentId) {
      fetchSourceDocument();
    } else {
      setSupplierId(null);
    }
  }, [fetchSourceDocument, setLocationId, setSupplierId, sourceDocumentId]);

  const receiptLineColumns = useMemo<ColumnDef<ReceiptLine>[]>(() => {
    return [
      {
        accessorKey: "partId",
        header: "Part",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "orderQuantity",
        header: "Order Quantity",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "outstandingQuantity",
        header: "Outstanding Quantity",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "receivedQuantity",
        header: "Received Quantity",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Cost",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "locationId",
        header: "Location",
        cell: ({ row }) =>
          (routeData?.locations ?? []).find(
            (l) => l.id === row.original.locationId
          )?.name ?? null,
      },
      {
        accessorKey: "shelfId",
        header: "Shelf",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "unitOfMeasure",
        header: "Unit of Measure",
        cell: (item) => item.getValue(),
      },
    ];
  }, [routeData?.locations]);

  const handleCellEdit = useCallback(
    async (id: string, value: unknown, row: ReceiptLine) => {
      if (!supabase) throw new Error("Supabase client not found");
      return await supabase
        .from("receiptLine")
        .update({
          [id]: value,
        })
        .eq("id", row.id);
    },
    [supabase]
  );

  const receiptLineEditableComponents = useMemo(
    () => ({
      receivedQuantity: EditableNumber(handleCellEdit),
    }),
    [handleCellEdit]
  );

  return {
    editableComponents: receiptLineEditableComponents,
    error,
    locationId,
    locations: routeData?.locations ?? [],
    internalReceiptItems,
    isEditing,
    isDisabled,
    receiptLineColumns,
    sourceDocument,
    sourceDocumentId,
    supplierId,
    sourceDocuments,
    onClose,
    onPost,
    setLocationId,
    setSourceDocument,
    setSourceDocumentId,
  };
}
