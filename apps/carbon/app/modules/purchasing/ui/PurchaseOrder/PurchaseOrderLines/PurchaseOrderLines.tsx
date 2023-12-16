import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Heading,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { Link, Outlet, useNavigate, useParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { MdMoreHoriz } from "react-icons/md";
import {
  EditableNumber,
  EditablePurchaseOrderLineNumber,
  EditableText,
} from "~/components/Editable";
import Grid from "~/components/Grid";
import { useRouteData, useUser } from "~/hooks";
import type { PurchaseOrder, PurchaseOrderLine } from "~/modules/purchasing";
import { usePurchaseOrderTotals } from "~/modules/purchasing";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";
import usePurchaseOrderLines from "./usePurchaseOrderLines";

const PurchaseOrderLines = () => {
  const { orderId } = useParams();
  if (!orderId) throw new Error("orderId not found");

  const navigate = useNavigate();

  const routeData = useRouteData<{
    purchaseOrderLines: PurchaseOrderLine[];
    locations: ListItem[];
    purchaseOrder: PurchaseOrder;
  }>(path.to.purchaseOrder(orderId));

  const locations = routeData?.locations ?? [];
  const { defaults, id: userId } = useUser();
  const {
    canEdit,
    canDelete,
    supabase,
    partOptions,
    accountOptions,
    onCellEdit,
  } = usePurchaseOrderLines();
  const [, setPurchaseOrderTotals] = usePurchaseOrderTotals();

  const isEditable = ["Draft", "To Review"].includes(
    routeData?.purchaseOrder?.status ?? ""
  );

  const columns = useMemo<ColumnDef<PurchaseOrderLine>[]>(() => {
    return [
      {
        header: "Line",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "purchaseOrderLineType",
        header: "Type",
        cell: ({ row }) => (
          <HStack justify="space-between" minW={100}>
            <span>{row.original.purchaseOrderLineType}</span>
            <Box position="relative" w={6} h={5}>
              <Menu>
                <MenuButton
                  as={IconButton}
                  aria-label="Edit purchase order line type"
                  icon={<MdMoreHoriz />}
                  size="sm"
                  position="absolute"
                  right={-1}
                  top="-6px"
                  variant="ghost"
                  onClick={(e) => e.stopPropagation()}
                />
                <MenuList>
                  <MenuItem
                    icon={<BsPencilSquare />}
                    onClick={() => navigate(row.original.id)}
                    isDisabled={!isEditable || !canEdit}
                  >
                    Edit Line
                  </MenuItem>
                  <MenuItem
                    icon={<IoMdTrash />}
                    onClick={() => navigate(`delete/${row.original.id}`)}
                    isDisabled={!isEditable || !canDelete}
                  >
                    Delete Line
                  </MenuItem>
                </MenuList>
              </Menu>
            </Box>
          </HStack>
        ),
      },
      {
        accessorKey: "partId",
        header: "Number",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Part":
              return <span>{row.original.partId}</span>;
            case "Service":
              return <span>{row.original.serviceId}</span>;
            case "G/L Account":
              return <span>{row.original.accountNumber}</span>;
            case "Comment":
              return null;
            case "Fixed Asset":
              return <span>{row.original.assetId}</span>;
            default:
              return null;
          }
        },
      },
      {
        accessorKey: "description",
        header: "Description",
        cell: ({ row }) => {
          let description = row.original.description ?? "";
          if (description.length > 50) {
            description = description.substring(0, 50) + "...";
          }
          return <span>{description}</span>;
        },
      },
      {
        accessorKey: "purchaseQuantity",
        header: "Quantity",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <span>{row.original.purchaseQuantity}</span>;
          }
        },
      },
      {
        accessorKey: "unitPrice",
        header: "Unit Price",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <span>{row.original.unitPrice}</span>;
          }
        },
      },
      {
        accessorKey: "locationId",
        header: "Location",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Part":
              return (
                <span>
                  {locations.find((l) => l.id == row.original.locationId)?.name}
                </span>
              );
          }
        },
      },
      {
        accessorKey: "shelfId",
        header: "Shelf",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <span>{row.original.shelfId}</span>;
          }
        },
      },
      {
        id: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              if (!row.original.unitPrice || !row.original.purchaseQuantity)
                return 0;
              return (
                row.original.unitPrice * row.original.purchaseQuantity
              ).toFixed(2);
          }
        },
      },
      {
        id: "quantityReceived",
        header: "Quantity Received",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <span>{row.original.quantityReceived}</span>;
          }
        },
      },
      {
        id: "quantityInvoiced",
        header: "Quantity Invoiced",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <span>{row.original.quantityInvoiced}</span>;
          }
        },
      },
      {
        id: "receivedComplete",
        header: "Received Complete",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <Checkbox isChecked={row.original.receivedComplete} />;
          }
        },
      },
      {
        id: "invoicedComplete",
        header: "Invoiced Complete",
        cell: ({ row }) => {
          switch (row.original.purchaseOrderLineType) {
            case "Comment":
              return null;
            default:
              return <Checkbox isChecked={row.original.invoicedComplete} />;
          }
        },
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const editableComponents = useMemo(
    () => ({
      description: EditableText(onCellEdit),
      purchaseQuantity: EditableNumber(onCellEdit),
      unitPrice: EditableNumber(onCellEdit),
      partId: EditablePurchaseOrderLineNumber(onCellEdit, {
        client: supabase,
        parts: partOptions,
        accounts: accountOptions,
        defaultLocationId: defaults.locationId,
        userId: userId,
      }),
    }),
    [
      onCellEdit,
      supabase,
      partOptions,
      accountOptions,
      defaults.locationId,
      userId,
    ]
  );

  return (
    <>
      <Card w="full" h="full">
        <CardHeader display="flex" justifyContent="space-between">
          <Heading size="md" display="inline-flex">
            Purchase Order Lines
          </Heading>
          {canEdit && isEditable && (
            <Button colorScheme="brand" as={Link} to="new">
              New
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <Grid<PurchaseOrderLine>
            data={routeData?.purchaseOrderLines ?? []}
            columns={columns}
            canEdit={canEdit && isEditable}
            editableComponents={editableComponents}
            onDataChange={(lines: PurchaseOrderLine[]) => {
              const totals = lines.reduce(
                (acc, line) => {
                  acc.total +=
                    (line.purchaseQuantity ?? 0) * (line.unitPrice ?? 0);

                  return acc;
                },
                { total: 0 }
              );
              setPurchaseOrderTotals(totals);
            }}
            onNewRow={canEdit && isEditable ? () => navigate("new") : undefined}
          />
        </CardBody>
      </Card>
      <Outlet />
    </>
  );
};

export default PurchaseOrderLines;
