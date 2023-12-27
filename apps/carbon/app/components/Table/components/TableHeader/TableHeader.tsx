import { HStack } from "@carbon/react";
import { Button } from "@chakra-ui/react";
import type { Column, ColumnOrderState } from "@tanstack/react-table";
import { BsFillCheckCircleFill } from "react-icons/bs";
import { MdOutlineEditNote } from "react-icons/md";
import type { TableAction } from "../../types";
import Actions from "../Actions";
import Columns from "../Columns";
import Filter from "../Filter";
import type { PaginationProps } from "../Pagination";
import { PaginationButtons } from "../Pagination";
import Sort from "../Sort";

type HeaderProps<T> = {
  actions: TableAction<T>[];
  columnAccessors: Record<string, string>;
  columnOrder: ColumnOrderState;
  columns: Column<T, unknown>[];
  editMode: boolean;
  pagination: PaginationProps;
  selectedRows: T[];
  setColumnOrder: (newOrder: ColumnOrderState) => void;
  setEditMode: (editMode: boolean) => void;
  withColumnOrdering: boolean;
  withFilters: boolean;
  withInlineEditing: boolean;
  withPagination: boolean;
  withSelectableRows: boolean;
};

const TableHeader = <T extends object>({
  actions,
  columnAccessors,
  columnOrder,
  columns,
  editMode,
  pagination,
  selectedRows,
  setColumnOrder,
  setEditMode,
  withColumnOrdering,
  withFilters,
  withInlineEditing,
  withPagination,
  withSelectableRows,
}: HeaderProps<T>) => {
  return (
    <HStack className="px-4 py-3 justify-between bg-background border-b border-border w-full">
      <HStack>
        {withSelectableRows && actions.length > 0 && (
          <Actions actions={actions} selectedRows={selectedRows} />
        )}
        {withInlineEditing &&
          (editMode ? (
            <Button
              colorScheme="brand"
              leftIcon={<BsFillCheckCircleFill />}
              variant="solid"
              onClick={() => setEditMode(false)}
            >
              Finish Editing
            </Button>
          ) : (
            <Button
              leftIcon={<MdOutlineEditNote />}
              variant="ghost"
              onClick={() => setEditMode(true)}
            >
              Edit
            </Button>
          ))}
      </HStack>
      <HStack>
        {withFilters && (
          <>
            <Filter columnAccessors={columnAccessors} />
            <Sort columnAccessors={columnAccessors} />
          </>
        )}

        {withColumnOrdering && (
          <Columns
            columnOrder={columnOrder}
            columns={columns}
            setColumnOrder={setColumnOrder}
            withSelectableRows={withSelectableRows}
          />
        )}
        {withPagination && <PaginationButtons {...pagination} condensed />}
      </HStack>
    </HStack>
  );
};

export default TableHeader;
