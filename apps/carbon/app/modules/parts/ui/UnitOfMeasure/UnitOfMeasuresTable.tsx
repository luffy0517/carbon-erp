import { Hyperlink, MenuIcon, MenuItem } from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { UnitOfMeasure } from "~/modules/parts";
import { path } from "~/utils/path";

type UnitOfMeasuresTableProps = {
  data: UnitOfMeasure[];
  count: number;
};

const UnitOfMeasuresTable = memo(
  ({ data, count }: UnitOfMeasuresTableProps) => {
    const [params] = useUrlParams();
    const navigate = useNavigate();
    const permissions = usePermissions();

    const columns = useMemo<ColumnDef<(typeof data)[number]>[]>(() => {
      return [
        {
          accessorKey: "name",
          header: "Name",
          cell: ({ row }) => (
            <Hyperlink onClick={() => navigate(row.original.id)}>
              {row.original.name}
            </Hyperlink>
          ),
        },
        {
          accessorKey: "code",
          header: "Code",
          cell: (item) => item.getValue(),
        },
      ];
    }, [navigate]);

    const renderContextMenu = useCallback(
      (row: (typeof data)[number]) => {
        return (
          <>
            <MenuItem
              disabled={!permissions.can("update", "parts")}
              onClick={() => {
                navigate(`${path.to.uom(row.id)}?${params.toString()}`);
              }}
            >
              <MenuIcon icon={<BsFillPenFill />} />
              Edit Unit of Measure
            </MenuItem>
            <MenuItem
              disabled={!permissions.can("delete", "parts")}
              onClick={() => {
                navigate(`${path.to.deleteUom(row.id)}?${params.toString()}`);
              }}
            >
              <MenuIcon icon={<IoMdTrash />} />
              Delete Unit of Measure
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
  }
);

UnitOfMeasuresTable.displayName = "UnitOfMeasuresTable";
export default UnitOfMeasuresTable;
