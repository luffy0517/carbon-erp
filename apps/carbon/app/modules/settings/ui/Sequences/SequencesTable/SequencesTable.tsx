import { Hyperlink } from "@carbon/react";
import { MenuItem } from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsPencilSquare } from "react-icons/bs";
import { Table } from "~/components";
import { usePermissions, useUrlParams } from "~/hooks";
import type { Sequence } from "~/modules/settings";
import { path } from "~/utils/path";

type SequencesTableProps = {
  data: Sequence[];
  count: number;
};

const SequencesTable = memo(({ data, count }: SequencesTableProps) => {
  const [params] = useUrlParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const columns = useMemo<ColumnDef<(typeof data)[number]>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <Hyperlink onClick={() => navigate(row.original.table)}>
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        accessorKey: "prefix",
        header: "Prefix",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "next",
        header: "Next",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "size",
        header: "Size",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "step",
        header: "Step",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "suffix",
        header: "Suffix",
        cell: (item) => item.getValue(),
      },
    ];
  }, [navigate]);

  const renderContextMenu = useCallback(
    (row: (typeof data)[number]) => {
      return (
        <>
          <MenuItem
            isDisabled={!permissions.can("update", "settings")}
            icon={<BsPencilSquare />}
            onClick={() => {
              navigate(
                `${path.to.tableSequence(row.table)}?${params.toString()}`
              );
            }}
          >
            Edit Sequence
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

SequencesTable.displayName = "SequencesTable";
export default SequencesTable;
