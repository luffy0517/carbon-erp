import { HStack } from "@carbon/react";
import { Avatar, Link, MenuItem } from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { Partner } from "~/modules/resources";
import { path } from "~/utils/path";

type PartnersTableProps = {
  data: Partner[];
  count: number;
};

const PartnersTable = memo(({ data, count }: PartnersTableProps) => {
  const navigate = useNavigate();
  const permissions = usePermissions();
  const [params] = useUrlParams();

  const rows = data.map((row) => ({
    ...row,
  }));

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(() => {
    return [
      {
        accessorKey: "supplier",
        header: "Supplier",
        cell: ({ row }) => (
          <HStack>
            <Avatar size="sm" name={row.original.supplierName ?? ""} />

            <Link
              onClick={() => {
                navigate(path.to.supplier(row?.original.supplierId!));
              }}
            >
              {row.original.supplierName}
            </Link>
          </HStack>
        ),
      },
      {
        header: "Location",
        cell: ({ row }) => (
          <>
            {row.original.city}, {row.original.state}
          </>
        ),
      },
      {
        accessorKey: "hoursPerWeek",
        header: "Hours per Week",
        cell: (item) => item.getValue(),
      },
    ];
  }, [navigate]);

  const renderContextMenu = useCallback(
    (row: (typeof rows)[number]) => {
      return (
        <>
          <MenuItem
            icon={<BsPencilSquare />}
            onClick={() => {
              navigate(
                `${path.to.partner(
                  row.supplierLocationId!
                )}?${params.toString()}`
              );
            }}
          >
            Edit Partner
          </MenuItem>
          <MenuItem
            isDisabled={!permissions.can("delete", "resources")}
            icon={<IoMdTrash />}
            onClick={() => {
              navigate(
                `${path.to.deletePartner(
                  row.supplierLocationId!
                )}?${params.toString()}`
              );
            }}
          >
            Delete Partner
          </MenuItem>
        </>
      );
    },
    [navigate, params, permissions]
  );

  return (
    <Table<Partner>
      data={rows}
      count={count}
      columns={columns}
      renderContextMenu={renderContextMenu}
    />
  );
});

PartnersTable.displayName = "PartnersTable";
export default PartnersTable;
