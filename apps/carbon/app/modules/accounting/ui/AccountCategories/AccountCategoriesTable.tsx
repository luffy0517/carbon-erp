import {
  Button,
  Hyperlink,
  MenuIcon,
  MenuItem,
  useDisclosure,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import { BiAddToQueue } from "react-icons/bi";
import { BsFillPenFill, BsListUl } from "react-icons/bs";
import { IoMdTrash } from "react-icons/io";
import { Table } from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions, useUrlParams } from "~/hooks";
import type { AccountCategory } from "~/modules/accounting";
import { path } from "~/utils/path";

type AccountCategoriesTableProps = {
  data: AccountCategory[];
  count: number;
};

const AccountCategoriesTable = memo(
  ({ data, count }: AccountCategoriesTableProps) => {
    const navigate = useNavigate();
    const [params] = useUrlParams();
    const permissions = usePermissions();
    const deleteModal = useDisclosure();
    const [selectedCategory, setSelectedCategory] = useState<
      AccountCategory | undefined
    >();

    const onDelete = (data: AccountCategory) => {
      setSelectedCategory(data);
      deleteModal.onOpen();
    };

    const onDeleteCancel = () => {
      setSelectedCategory(undefined);
      deleteModal.onClose();
    };

    const columns = useMemo<ColumnDef<(typeof data)[number]>[]>(() => {
      return [
        {
          accessorKey: "category",
          header: "Category",
          cell: ({ row }) => (
            <Hyperlink onClick={() => navigate(row.original.id as string)}>
              {row.original.category}
            </Hyperlink>
          ),
        },
        {
          header: "Income/Balance",
          accessorKey: "incomeBalance",
          cell: (item) => item.getValue(),
        },
        {
          header: "Class",
          accessorKey: "class",
          cell: (item) => item.getValue(),
        },

        {
          header: "Subcategories",
          cell: ({ row }) => (
            <Button
              variant="secondary"
              onClick={() => {
                navigate(
                  `${path.to.accountingCategoryList(
                    row.original.id!
                  )}?${params?.toString()}`
                );
              }}
            >
              {row.original.subCategoriesCount ?? 0} Subcategories
            </Button>
          ),
        },
      ];
    }, [navigate, params]);

    const renderContextMenu = useCallback(
      (row: (typeof data)[number]) => {
        if (!row.id) return null;
        return (
          <>
            <MenuItem
              onClick={() => {
                navigate(
                  `${path.to.newAccountingSubcategory(
                    row.id!
                  )}${params?.toString()}`
                );
              }}
            >
              <MenuIcon icon={<BiAddToQueue />} />
              New Subcategory
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(
                  `${path.to.accountingCategoryList(
                    row.id!
                  )}?${params?.toString()}`
                );
              }}
            >
              <MenuIcon icon={<BsListUl />} />
              View Subcategories
            </MenuItem>
            <MenuItem
              onClick={() => {
                navigate(path.to.accountingCategory(row.id!));
              }}
            >
              <MenuIcon icon={<BsFillPenFill />} />
              Edit Account Category
            </MenuItem>
            <MenuItem
              disabled={!permissions.can("delete", "users")}
              onClick={() => onDelete(row)}
            >
              <MenuIcon icon={<IoMdTrash />} />
              Delete Account Category
            </MenuItem>
          </>
        );
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [navigate, params, permissions]
    );

    return (
      <>
        <Table<AccountCategory>
          data={data}
          columns={columns}
          count={count ?? 0}
          renderContextMenu={renderContextMenu}
        />

        {selectedCategory && selectedCategory.id && (
          <ConfirmDelete
            action={path.to.deleteAccountingCategory(selectedCategory.id)}
            name={selectedCategory?.category ?? ""}
            text={`Are you sure you want to deactivate the ${selectedCategory?.category} account category?`}
            isOpen={deleteModal.isOpen}
            onCancel={onDeleteCancel}
            onSubmit={onDeleteCancel}
          />
        )}
      </>
    );
  }
);

AccountCategoriesTable.displayName = "AccountCategoriesTable";
export default AccountCategoriesTable;
