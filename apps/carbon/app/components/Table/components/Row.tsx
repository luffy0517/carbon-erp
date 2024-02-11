import { Tr, cn } from "@carbon/react";
import type { Row as RowType } from "@tanstack/react-table";
import type { ComponentProps } from "react";
import { memo } from "react";
import type {
  EditableTableCellComponent,
  Position,
} from "~/components/Editable";
import Cell from "./Cell";

type RowProps<T> = ComponentProps<typeof Tr> & {
  editableComponents?: Record<string, EditableTableCellComponent<T> | object>;
  editedCells?: string[];
  isEditing: boolean;
  isEditMode: boolean;
  isFrozenColumn?: boolean;
  isRowSelected?: boolean;
  pinnedColumns?: number;
  selectedCell: Position;
  row: RowType<T>;
  rowIsSelected: boolean;
  withColumnOrdering: boolean;
  onCellClick: (row: number, column: number) => void;
  onCellUpdate: (row: number) => (updates: Record<string, unknown>) => void;
};

const Row = <T extends object>({
  editableComponents,
  editedCells,
  isEditing,
  isEditMode,
  isFrozenColumn = false,
  isRowSelected = false,
  pinnedColumns = 0,
  row,
  rowIsSelected,
  selectedCell,
  withColumnOrdering,
  onCellClick,
  onCellUpdate,
  ...props
}: RowProps<T>) => {
  const onUpdate = isEditMode ? onCellUpdate(row.index) : undefined;

  return (
    <Tr
      key={row.id}
      className={cn(
        "border-b border-border transition-colors",
        isFrozenColumn && "bg-background"
      )}
      {...props}
    >
      {(isFrozenColumn
        ? row.getLeftVisibleCells()
        : withColumnOrdering
        ? row.getCenterVisibleCells()
        : row.getVisibleCells()
      ).map((cell, columnIndex) => {
        const isSelected = isFrozenColumn
          ? selectedCell?.row === cell.row.index &&
            selectedCell?.column === columnIndex - 1
          : selectedCell?.row === cell.row.index &&
            selectedCell?.column === columnIndex + pinnedColumns;

        return (
          <Cell<T>
            key={cell.id}
            cell={cell}
            columnIndex={columnIndex}
            // @ts-ignore
            editableComponents={editableComponents}
            editedCells={editedCells}
            isRowSelected={isRowSelected}
            isSelected={isSelected}
            isEditing={isEditing}
            isEditMode={isEditMode}
            onClick={
              isEditMode
                ? () =>
                    onCellClick(
                      cell.row.index,
                      isFrozenColumn
                        ? columnIndex - 1
                        : columnIndex + pinnedColumns
                    )
                : undefined
            }
            onUpdate={onUpdate}
          />
        );
      })}
    </Tr>
  );
};

const MemoizedRow = memo(
  Row,
  (prev, next) =>
    next.rowIsSelected === false &&
    prev.rowIsSelected === false &&
    next.isRowSelected === prev.isRowSelected &&
    next.selectedCell?.row === prev.row.index &&
    next.row.index === prev.selectedCell?.row &&
    next.selectedCell?.column === prev.selectedCell?.column &&
    next.isEditing === prev.isEditing &&
    next.isEditMode === prev.isEditMode
) as typeof Row;

export default MemoizedRow;
