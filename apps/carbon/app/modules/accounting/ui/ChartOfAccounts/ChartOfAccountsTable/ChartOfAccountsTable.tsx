import { Button, HStack } from "@carbon/react";
import { Checkbox, Link, Text } from "@chakra-ui/react";
import { Link as RemixLink, useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useMemo } from "react";
import { MdMoreHoriz } from "react-icons/md";
import Grid from "~/components/Grid";
import type { Chart } from "~/modules/accounting";

type ChartOfAccountsTableProps = {
  data: Chart[];
};

const ChartOfAccountsTable = memo(({ data }: ChartOfAccountsTableProps) => {
  const navigate = useNavigate();
  const columns = useMemo<ColumnDef<Chart>[]>(() => {
    return [
      {
        accessorKey: "number",
        header: "Number",
        cell: ({ row }) => {
          const isPosting = row.original.type === "Posting";

          return (
            <HStack>
              <Link
                onClick={() => navigate(row.original.id)}
                fontWeight={isPosting ? "normal" : "bold"}
              >
                {row.original.number}
              </Link>

              <div className="relative w-6 h-6">
                <Button
                  asChild
                  isIcon
                  variant="ghost"
                  className="absolute right-[-3px] top-[-3px] outline-none border-none active:outline-none focus-visible:outline-none"
                  aria-label="Edit account"
                  onClick={(e) => e.stopPropagation()}
                >
                  <RemixLink to={`${row.original.id}`}>
                    <MdMoreHoriz />
                  </RemixLink>
                </Button>
              </div>
            </HStack>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => {
          const isPosting = row.original.type === "Posting";
          return (
            <Text
              fontWeight={isPosting ? "normal" : "bold"}
              pl={`calc(${0.75 * row.original.level}rem)`}
            >
              {row.original.name}
            </Text>
          );
        },
      },
      {
        accessorKey: "netChange",
        header: "Net Change",
        cell: ({ row }) => {
          const hasValue = ["Posting", "End Total"].includes(row.original.type);
          return hasValue ? (row.original.netChange ?? 0).toFixed(2) : null;
        },
      },
      {
        accessorKey: "balanceAtDate",
        header: "Balance at Date",
        cell: ({ row }) => {
          const hasValue = ["Posting", "End Total"].includes(row.original.type);
          return hasValue ? (row.original.balanceAtDate ?? 0).toFixed(2) : null;
        },
      },
      {
        accessorKey: "balance",
        header: "Balance",
        cell: ({ row }) => {
          const hasValue = ["Posting", "End Total"].includes(row.original.type);
          return hasValue ? (row.original.balance ?? 0).toFixed(2) : null;
        },
      },
      {
        accessorKey: "incomeBalance",
        header: "Income/Balance",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "type",
        header: "Account Type",
        cell: (item) => item.getValue(),
      },
      {
        acessorKey: "totaling",
        header: "Totaling",
        cell: ({ row }) => row.original.totaling ?? "",
      },
      {
        accessorKey: "accountCategory",
        header: "Account Category",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "accountSubCategory",
        header: "Account Subcategory",
        cell: (item) => item.getValue(),
      },
      {
        accessorKey: "directPosting",
        header: "Direct Posting",
        cell: (item) => <Checkbox isChecked={item.getValue<boolean>()} />,
      },
    ];
  }, [navigate]);

  return <Grid<Chart> data={data} columns={columns} withSimpleSorting />;
});

ChartOfAccountsTable.displayName = "ChartOfAccountsTable";
export default ChartOfAccountsTable;
