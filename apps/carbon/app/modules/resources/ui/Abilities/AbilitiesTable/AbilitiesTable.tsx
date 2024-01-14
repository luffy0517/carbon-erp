import {
  AvatarGroup,
  AvatarGroupList,
  AvatarOverflowIndicator,
  Hyperlink,
  MenuIcon,
  MenuItem,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo } from "react";
import { BsFillPenFill } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Avatar, Table } from "~/components";
import { usePermissions } from "~/hooks";
import type { Abilities, AbilityDatum } from "~/modules/resources";
import { path } from "~/utils/path";
import AbilityChart from "../AbilityChart";

type AbilitiesTableProps = {
  data: Abilities;
  count: number;
};

const AbilitiesTable = memo(({ data, count }: AbilitiesTableProps) => {
  const navigate = useNavigate();
  const permissions = usePermissions();

  const rows = data.map((row) => ({
    id: row.id,
    name: row.name,
    // @ts-ignore
    weeks: row.curve?.data.at(-1).week,
    curve: row.curve as { data: AbilityDatum[] },
    shadowWeeks: row.shadowWeeks,
    employees: Array.isArray(row.employeeAbility)
      ? row.employeeAbility.reduce<
          { name: string; avatarUrl: string | null }[]
        >((acc, curr) => {
          if (curr.user) {
            if (Array.isArray(curr.user)) {
              curr.user.forEach((user) => {
                acc.push({
                  name: user.fullName ?? "",
                  avatarUrl: user.avatarUrl,
                });
              });
            } else {
              acc.push({
                name: curr.user.fullName ?? "",
                avatarUrl: curr.user.avatarUrl,
              });
            }
          }
          return acc;
        }, [])
      : row.employeeAbility?.user && Array.isArray(row.employeeAbility?.user)
      ? row.employeeAbility.user.map((user) => ({
          name: user.fullName ?? "",
          avatarUrl: user.avatarUrl,
        }))
      : [],
  }));

  const columns = useMemo<ColumnDef<(typeof rows)[number]>[]>(() => {
    return [
      {
        accessorKey: "name",
        header: "Ability",
        cell: ({ row }) => (
          <Hyperlink onClick={() => navigate(path.to.ability(row.original.id))}>
            {row.original.name}
          </Hyperlink>
        ),
      },
      {
        header: "Employees",
        // accessorKey: undefined, // makes the column unsortable
        cell: ({ row }) => (
          <AvatarGroup limit={5}>
            <AvatarGroupList>
              {row.original.employees.map((employee, index: number) => (
                <Avatar
                  key={index}
                  name={employee.name ?? undefined}
                  title={employee.name ?? undefined}
                  path={employee.avatarUrl}
                />
              ))}
            </AvatarGroupList>
            <AvatarOverflowIndicator />
          </AvatarGroup>
        ),
      },
      {
        header: "Time to Learn",
        cell: ({ row }) => `${row.original.weeks} weeks`,
      },
      {
        header: "Efficiency Curve",
        size: 200,
        cell: ({ row }) => (
          <AbilityChart
            parentHeight={33}
            parentWidth={200}
            data={row.original.curve.data}
            shadowWeeks={row.original.shadowWeeks}
            margin={{ top: 0, right: 0, bottom: 0, left: 2 }}
          />
        ),
      },
    ];
  }, [navigate]);

  const renderContextMenu = useCallback(
    (row: (typeof rows)[number]) => {
      return (
        <>
          <MenuItem
            onClick={() => {
              navigate(path.to.ability(row.id));
            }}
          >
            <MenuIcon icon={<BsFillPenFill />} />
            Edit Ability
          </MenuItem>
          <MenuItem
            disabled={!permissions.can("delete", "resources")}
            onClick={() => {
              navigate(path.to.deleteAbility(row.id));
            }}
          >
            <MenuIcon icon={<IoMdTrash />} />
            Delete Ability
          </MenuItem>
        </>
      );
    },
    [navigate, permissions]
  );

  return (
    <Table<(typeof rows)[number]>
      data={rows}
      count={count}
      columns={columns}
      renderContextMenu={renderContextMenu}
    />
  );
});

AbilitiesTable.displayName = "AbilitiesTable";
export default AbilitiesTable;
