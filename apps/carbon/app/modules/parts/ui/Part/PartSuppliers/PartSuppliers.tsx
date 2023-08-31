import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import { Link, Outlet, useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import Grid from "~/components/Grid";
import {
  EditableList,
  EditableNumber,
  EditableText,
} from "~/components/Editable";
import type { PartSupplier, UnitOfMeasureListItem } from "~/modules/parts";
import usePartSuppliers from "./usePartSuppliers";
import { useRouteData } from "~/hooks";
import { MdMoreHoriz } from "react-icons/md";

type PartSuppliersProps = {
  partSuppliers: PartSupplier[];
};

const PartSuppliers = ({ partSuppliers }: PartSuppliersProps) => {
  const navigate = useNavigate();
  const { canEdit, handleCellEdit } = usePartSuppliers();
  const sharedPartData = useRouteData<{
    unitOfMeasures: UnitOfMeasureListItem[];
  }>("/x/part");

  const unitOfMeasureOptions = useMemo(() => {
    return (
      sharedPartData?.unitOfMeasures.map((unitOfMeasure) => ({
        label: unitOfMeasure.code,
        value: unitOfMeasure.code,
      })) ?? []
    );
  }, [sharedPartData?.unitOfMeasures]);

  const columns = useMemo<ColumnDef<PartSupplier>[]>(() => {
    return [
      {
        accessorKey: "supplier.id",
        header: "Supplier",
        cell: ({ row }) => (
          <HStack justify="space-between">
            {/* @ts-ignore */}
            <span>{row.original.supplier.name}</span>
            {canEdit && (
              <Box position="relative" w={6} h={5}>
                <IconButton
                  aria-label="Edit part supplier"
                  as={Link}
                  icon={<MdMoreHoriz />}
                  size="sm"
                  position="absolute"
                  right={-1}
                  top={-1}
                  to={`${row.original.id}`}
                  onClick={(e) => e.stopPropagation()}
                  variant="ghost"
                />
              </Box>
            )}
          </HStack>
        ),
      },
      {
        accessorKey: "supplierPartId",
        header: "Part ID",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "supplierUnitOfMeasureCode",
        header: "Unit of Measure",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "minimumOrderQuantity",
        header: "Minimum Order Quantity",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "conversionFactor",
        header: "Conversion Factor",
        cell: (item) => item.getValue(),
      },
    ];
  }, [canEdit]);

  const editableComponents = useMemo(
    () => ({
      supplierPartId: EditableText(handleCellEdit),
      supplierUnitOfMeasureCode: EditableList(
        handleCellEdit,
        unitOfMeasureOptions
      ),
      minimumOrderQuantity: EditableNumber(handleCellEdit),
      conversionFactor: EditableNumber(handleCellEdit),
    }),
    [handleCellEdit, unitOfMeasureOptions]
  );

  return (
    <>
      <Card w="full">
        <CardHeader display="flex" justifyContent="space-between">
          <Heading size="md" display="inline-flex">
            Suppliers
          </Heading>
          {canEdit && (
            <Button colorScheme="brand" as={Link} to="new">
              New
            </Button>
          )}
        </CardHeader>
        <CardBody>
          <Grid<PartSupplier>
            data={partSuppliers}
            columns={columns}
            canEdit={canEdit}
            editableComponents={editableComponents}
            onNewRow={canEdit ? () => navigate("new") : undefined}
          />
        </CardBody>
      </Card>
      <Outlet />
    </>
  );
};

export default PartSuppliers;
