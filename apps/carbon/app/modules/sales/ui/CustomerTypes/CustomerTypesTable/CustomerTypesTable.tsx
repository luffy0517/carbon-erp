import { Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill, BsPeopleFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { CustomerType } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomerTypesTableProps = {
  data: CustomerType[];
  count: number;
};

const CustomerTypesTable = memo(({ data, count }: CustomerTypesTableProps) => {
  const [params] = useUrlParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const columns = useMemo<ColumnDef<(typeof data)[number]>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Customer Type",
        cell: ({ row }) => (
          <Hyperlink onClick={() => navigate(row.original.id)}>
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        accessorKey: "color",
        header: "Color",
        cell: (item) => (
          <div
            aria-label="Color"
            className="w-6 h-6 rounded-md bg-zinc-500"
            style={{ background: item.getValue<string>() ?? "#000000" }}
          />
        ),
      },
    ];
  }, [navigate]);

  const renderContextMenu = useCallback(
    (row: (typeof data)[number]) => {
      return (
        <>
          <MenuItem
            onClick={() => {
              navigate(`${path.to.customers}?type=${row.id}`);
            }}
          >
            <MenuIcon icon={<BsPeopleFill />} />
            View Customers
          </MenuItem>
          <MenuItem
            disabled={row.protected || !permissions.can("update", "sales")}
            onClick={() => {
              navigate(`${path.to.customerType(row.id)}?${params.toString()}`);
            }}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Customer Type
          </MenuItem>
          <MenuItem
            disabled={row.protected || !permissions.can("delete", "sales")}
            onClick={() => {
              navigate(
                `${path.to.deleteCustomerType(row.id)}?${params.toString()}`
              );
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete Customer Type
          </MenuItem>
        </>
      );
    },
    [navigate, params, permissions]
  );

  return (
    <Table<(typeof data)[number]>
      data={data}
      columns={columns}
      count={count}
      renderContextMenu={renderContextMenu}
    />
  );
});

CustomerTypesTable.displayName = "CustomerTypesTable";
export default CustomerTypesTable;
