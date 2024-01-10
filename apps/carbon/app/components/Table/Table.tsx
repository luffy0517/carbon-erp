import {
  ActionMenu,
  ContextMenu,
  VStack,
  useColor,
  useEscape,
  useMount,
} from "@carbon/react";
import { clip } from "@carbon/utils";
import type { ThemeTypings } from "@chakra-ui/react";
import {
  Table as ChakraTable,
  Grid,
  MenuList,
  Tbody,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import type {
  ColumnDef,
  ColumnOrderState,
  ColumnPinningState,
  RowSelectionState,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaSort, FaSortDown, FaSortUp } from "react-icons/fa";
import type {
  EditableTableCellComponent,
  Position,
} from "~/components/Editable";
import {
  IndeterminateCheckbox,
  Pagination,
  Row,
  TableHeader,
  usePagination,
  useSort,
} from "./components";
import type { TableAction } from "./types";
import { getAccessorKey, updateNestedProperty } from "./utils";

interface TableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  actions?: TableAction<T>[];
  count?: number;
  colorScheme?: ThemeTypings["colorSchemes"];
  defaultColumnOrder?: string[];
  defaultColumnPinning?: ColumnPinningState;
  defaultColumnVisibility?: Record<string, boolean>;
  editableComponents?: Record<string, EditableTableCellComponent<T>>;
  withColumnOrdering?: boolean;
  withInlineEditing?: boolean;
  withFilters?: boolean;
  withPagination?: boolean;
  withSelectableRows?: boolean;
  withSimpleSorting?: boolean;
  onRowClick?: (row: T) => void;
  onSelectedRowsChange?: (selectedRows: T[]) => void;
  renderContextMenu?: (row: T) => JSX.Element | null;
}

const Table = <T extends object>({
  data,
  columns,
  actions = [],
  count = 0,
  colorScheme = "blackAlpha",
  editableComponents,
  defaultColumnOrder,
  defaultColumnPinning = {
    left: ["Select"],
  },
  defaultColumnVisibility,
  withFilters = false,
  withInlineEditing = false,
  withColumnOrdering = false,
  withPagination = true,
  withSelectableRows = false,
  withSimpleSorting = true,
  onRowClick,
  onSelectedRowsChange,
  renderContextMenu,
}: TableProps<T>) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);

  /* Data for Optimistic Updates */
  const [internalData, setInternalData] = useState<T[]>(data);
  useEffect(() => {
    setInternalData(data);
  }, [data]);

  /* Seletable Rows */
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  /* Pagination */
  const pagination = usePagination(count, setRowSelection);

  /* Column Visibility */
  const [columnVisibility, setColumnVisibility] = useState(
    defaultColumnVisibility ?? {}
  );

  /* Column Ordering */
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(
    defaultColumnOrder ?? []
  );
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>(
    withColumnOrdering ? defaultColumnPinning : {}
  );

  /* Sorting */
  const { isSorted, toggleSortBy } = useSort();

  const columnAccessors = useMemo(
    () =>
      columns.reduce<Record<string, string>>((acc, column) => {
        const accessorKey: string | undefined = getAccessorKey(column);
        if (accessorKey?.includes("_"))
          throw new Error(
            `Invalid accessorKey ${accessorKey}. Cannot contain '_'`
          );
        if (accessorKey && column.header && typeof column.header === "string") {
          return {
            ...acc,
            [accessorKey]: column.header,
          };
        }
        return acc;
      }, {}),
    [columns]
  );

  const internalColumns = useMemo(() => {
    let result: ColumnDef<T>[] = [];
    if (withSelectableRows) {
      result.push(...getRowSelectionColumn<T>());
    }
    result.push(...columns);
    if (renderContextMenu) {
      result.push(...getActionColumn<T>(renderContextMenu));
    }
    return result;
  }, [columns, renderContextMenu, withSelectableRows]);

  const table = useReactTable({
    data: internalData,
    columns: internalColumns,
    state: {
      columnVisibility,
      columnOrder,
      columnPinning,
      rowSelection,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onColumnPinningChange: setColumnPinning,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      // These are not part of the standard API, but are accessible via table.options.meta
      editableComponents,
      updateData: (rowIndex, columnId, value) => {
        setInternalData((previousData) =>
          previousData.map((row, index) => {
            if (index === rowIndex) {
              if (columnId.includes("_") && !(columnId in row)) {
                updateNestedProperty(row, columnId, value);
                return row;
              } else {
                return {
                  ...row,
                  [columnId]: value,
                };
              }
            }
            return row;
          })
        );
      },
    },
  });

  const selectedRows = withSelectableRows
    ? table.getSelectedRowModel().flatRows.map((row) => row.original)
    : [];

  useEffect(() => {
    if (typeof onSelectedRowsChange === "function") {
      onSelectedRowsChange(selectedRows);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection, onSelectedRowsChange]);

  const [editMode, setEditMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCell, setSelectedCell] = useState<Position>(null);

  const focusOnSelectedCell = useCallback(() => {
    if (selectedCell == null) return;
    const cell = tableContainerRef.current?.querySelector(
      `[data-row="${selectedCell.row}"][data-column="${selectedCell.column}"]`
    ) as HTMLDivElement;
    if (cell) cell.focus();
  }, [selectedCell, tableContainerRef]);

  useEscape(() => {
    setIsEditing(false);
    focusOnSelectedCell();
  });

  const onSelectedCellChange = useCallback(
    (position: Position) => {
      if (
        selectedCell == null ||
        position == null ||
        selectedCell.row !== position?.row ||
        selectedCell.column !== position.column
      )
        setSelectedCell(position);
    },
    [selectedCell]
  );

  const isColumnEditable = useCallback(
    (selectedColumn: number) => {
      if (!withInlineEditing) return false;

      const tableColumns = [
        ...table.getLeftVisibleLeafColumns(),
        ...table.getCenterVisibleLeafColumns(),
      ];

      const column =
        tableColumns[withSelectableRows ? selectedColumn + 1 : selectedColumn];
      if (!column) return false;

      const accessorKey = getAccessorKey(column.columnDef);
      return (
        accessorKey && editableComponents && accessorKey in editableComponents
      );
    },
    [table, editableComponents, withInlineEditing, withSelectableRows]
  );

  const onCellClick = useCallback(
    (row: number, column: number) => {
      // ignore row select checkbox column
      if (
        selectedCell?.row === row &&
        selectedCell?.column === column &&
        isColumnEditable(column)
      ) {
        setIsEditing(true);
        return;
      }
      // ignore row select checkbox column
      if (column === -1) return;
      setIsEditing(false);
      onSelectedCellChange({ row, column });
    },
    [selectedCell, isColumnEditable, onSelectedCellChange]
  );

  const onCellUpdate = useCallback(
    (rowIndex: number) => (columnId: string, value: unknown) => {
      return table.options.meta?.updateData
        ? table.options.meta?.updateData(rowIndex, columnId, value)
        : undefined;
    },
    [table]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (!selectedCell) return;

      const { code, shiftKey } = event;

      const commandCodes: {
        [key: string]: [number, number];
      } = {
        Tab: [0, 1],
        Enter: [1, 0],
      };

      const navigationCodes: {
        [key: string]: [number, number];
      } = {
        ArrowRight: [0, 1],
        ArrowLeft: [0, -1],
        ArrowDown: [1, 0],
        ArrowUp: [-1, 0],
      };

      const lastRow = table.getRowModel().rows.length - 1;
      const lastColumn =
        table.getVisibleLeafColumns().length - 1 - (withSelectableRows ? 1 : 0);

      const navigate = (
        delta: [number, number],
        tabWrap = false
      ): [number, number] => {
        const x0 = selectedCell?.column || 0;
        const y0 = selectedCell?.row || 0;

        let x1 = x0 + delta[1];
        let y1 = y0 + delta[0];

        if (tabWrap) {
          if (delta[1] > 0) {
            // wrap to the next row if we're on the last column
            if (x1 > lastColumn) {
              x1 = 0;
              y1 += 1;
            }
            // don't wrap to the next row if we're on the last row
            if (y1 > lastRow) {
              x1 = x0;
              y1 = y0;
            }
          } else {
            // reverse tab wrap
            if (x1 < 0) {
              x1 = lastColumn;
              y1 -= 1;
            }

            if (y1 < 0) {
              x1 = x0;
              y1 = y0;
            }
          }
        } else {
          x1 = clip(x1, 0, lastColumn);
        }

        y1 = clip(y1, 0, lastRow);

        return [x1, y1];
      };

      if (code in commandCodes) {
        event.preventDefault();

        if (
          !isEditing &&
          code === "Enter" &&
          !shiftKey &&
          isColumnEditable(selectedCell.column)
        ) {
          setIsEditing(true);
          return;
        }

        let direction = commandCodes[code];
        if (shiftKey) direction = [-direction[0], -direction[1]];
        const [x1, y1] = navigate(direction, code === "Tab");
        setSelectedCell({
          row: y1,
          column: x1,
        });
        if (isEditing) {
          setIsEditing(false);
        }
      } else if (code in navigationCodes) {
        // arrow key navigation should't work if we're editing
        if (isEditing) return;
        event.preventDefault();
        const [x1, y1] = navigate(navigationCodes[code], code === "Tab");
        setIsEditing(false);
        setSelectedCell({
          row: y1,
          column: x1,
        });
        // any other key (besides shift) activates editing
        // if the column is editable and a cell is selected
      } else if (
        !["ShiftLeft", "ShiftRight"].includes(code) &&
        !isEditing &&
        selectedCell &&
        isColumnEditable(selectedCell.column)
      ) {
        setIsEditing(true);
      }
    },
    [
      isColumnEditable,
      isEditing,
      selectedCell,
      setSelectedCell,
      table,
      withSelectableRows,
    ]
  );

  // reset the selected cell when the table data changes
  useEffect(() => {
    setSelectedCell(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    editMode,
    pagination.pageIndex,
    pagination.pageSize,
    columnOrder,
    columnVisibility,
  ]);

  useMount(() => {
    setColumnOrder(table.getAllLeafColumns().map((column) => column.id));
  });

  const rows = table.getRowModel().rows;
  const rowsAreClickable = !editMode && typeof onRowClick === "function";

  const defaultBackground = useColor("white");
  const borderColor = useColor("gray.200");
  const rowBackground = useColor("gray.50");

  return (
    <VStack spacing={0} className="h-full">
      {(withColumnOrdering ||
        withFilters ||
        withSelectableRows ||
        withInlineEditing) && (
        <TableHeader
          actions={actions}
          columnAccessors={columnAccessors}
          columnOrder={columnOrder}
          columns={table.getAllLeafColumns()}
          editMode={editMode}
          selectedRows={selectedRows}
          setColumnOrder={setColumnOrder}
          setEditMode={setEditMode}
          pagination={pagination}
          withInlineEditing={withInlineEditing}
          withColumnOrdering={withColumnOrdering}
          withFilters={withFilters}
          withPagination={withPagination}
          withSelectableRows={withSelectableRows}
        />
      )}
      <div
        className="w-full h-full bg-background overflow-scroll"
        style={{ contain: "strict" }}
        ref={tableContainerRef}
        onKeyDown={editMode ? onKeyDown : undefined}
      >
        <Grid
          w="full"
          gridTemplateColumns={withColumnOrdering ? "auto 1fr" : "1fr"}
        >
          {/* Pinned left columns */}
          {withColumnOrdering ? (
            <ChakraTable
              bg={defaultBackground}
              borderRightColor={borderColor}
              borderRightStyle="solid"
              borderRightWidth={4}
              position="sticky"
              left={0}
              zIndex={50}
            >
              <Thead>
                {table.getLeftHeaderGroups().map((headerGroup) => (
                  <Tr key={headerGroup.id} h={10}>
                    {headerGroup.headers.map((header) => {
                      const accessorKey = getAccessorKey(
                        header.column.columnDef
                      );
                      const sortable =
                        withSimpleSorting &&
                        accessorKey &&
                        !accessorKey.endsWith(".id") &&
                        header.column.columnDef.enableSorting !== false;

                      const sorted = isSorted(accessorKey ?? "");

                      return (
                        <Th
                          key={header.id}
                          // layout
                          onClick={
                            sortable && !editMode
                              ? () => toggleSortBy(accessorKey ?? "")
                              : undefined
                          }
                          cursor={sortable ? "pointer" : undefined}
                          colSpan={header.colSpan}
                          px={4}
                          py={2}
                          whiteSpace="nowrap"
                        >
                          {header.isPlaceholder ? null : (
                            <div className="flex justify-start items-center text-xs text-muted-foreground">
                              {flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                              <span className="pl-4">
                                {sorted ? (
                                  sorted === -1 ? (
                                    <FaSortDown aria-label="sorted descending" />
                                  ) : (
                                    <FaSortUp aria-label="sorted ascending" />
                                  )
                                ) : sortable ? (
                                  <FaSort aria-label="sort" />
                                ) : null}
                              </span>
                            </div>
                          )}
                        </Th>
                      );
                    })}
                  </Tr>
                ))}
              </Thead>
              <Tbody>
                {rows.map((row) => {
                  return renderContextMenu ? (
                    <ContextMenu<HTMLTableRowElement>
                      key={row.id}
                      renderMenu={() => (
                        <MenuList>{renderContextMenu(row.original)}</MenuList>
                      )}
                    >
                      {(ref) => (
                        <Row
                          borderColor={borderColor}
                          backgroundColor={rowBackground}
                          editableComponents={editableComponents}
                          isEditing={isEditing}
                          isEditMode={editMode}
                          isFrozenColumn
                          isRowSelected={
                            row.index in rowSelection &&
                            !!rowSelection[row.index]
                          }
                          selectedCell={selectedCell}
                          // @ts-ignore
                          row={row}
                          rowRef={ref}
                          rowIsSelected={selectedCell?.row === row.index}
                          withColumnOrdering={withColumnOrdering}
                          onCellClick={onCellClick}
                          onCellUpdate={onCellUpdate}
                          onRowClick={
                            rowsAreClickable
                              ? () => onRowClick(row.original)
                              : undefined
                          }
                        />
                      )}
                    </ContextMenu>
                  ) : (
                    <Row
                      key={row.id}
                      borderColor={borderColor}
                      backgroundColor={rowBackground}
                      editableComponents={editableComponents}
                      isEditing={isEditing}
                      isEditMode={editMode}
                      isFrozenColumn
                      isRowSelected={
                        row.index in rowSelection && !!rowSelection[row.index]
                      }
                      selectedCell={selectedCell}
                      // @ts-ignore
                      row={row}
                      rowIsSelected={selectedCell?.row === row.index}
                      withColumnOrdering={withColumnOrdering}
                      onCellClick={onCellClick}
                      onCellUpdate={onCellUpdate}
                      onRowClick={
                        rowsAreClickable
                          ? () => onRowClick(row.original)
                          : undefined
                      }
                    />
                  );
                })}
              </Tbody>
            </ChakraTable>
          ) : null}

          {/* Unpinned columns */}
          <ChakraTable>
            <Thead>
              {(withColumnOrdering
                ? table.getCenterHeaderGroups()
                : table.getHeaderGroups()
              ).map((headerGroup) => (
                <Tr key={headerGroup.id} h={10}>
                  {headerGroup.headers.map((header) => {
                    const accessorKey = getAccessorKey(header.column.columnDef);

                    const sortable =
                      withSimpleSorting &&
                      accessorKey &&
                      !accessorKey.endsWith(".id") &&
                      header.column.columnDef.enableSorting !== false;
                    const sorted = isSorted(accessorKey ?? "");

                    return (
                      <Th
                        key={header.id}
                        colSpan={header.colSpan}
                        onClick={
                          sortable
                            ? () => toggleSortBy(accessorKey ?? "")
                            : undefined
                        }
                        borderRightColor={borderColor}
                        borderRightStyle="solid"
                        borderRightWidth={editMode ? 1 : undefined}
                        cursor={sortable ? "pointer" : undefined}
                        px={4}
                        py={3}
                        w={header.getSize()}
                        whiteSpace="nowrap"
                      >
                        {header.isPlaceholder ? null : (
                          <div className="flex justify-start items-center text-xs text-muted-foreground">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            <span className="pl-4">
                              {sorted ? (
                                sorted === -1 ? (
                                  <FaSortDown aria-label="sorted descending" />
                                ) : (
                                  <FaSortUp aria-label="sorted ascending" />
                                )
                              ) : sortable ? (
                                <FaSort
                                  aria-label="sort"
                                  style={{ opacity: 0.4 }}
                                />
                              ) : null}
                            </span>
                          </div>
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {rows.map((row) => {
                return renderContextMenu ? (
                  <ContextMenu<HTMLTableRowElement>
                    key={row.id}
                    renderMenu={() => (
                      <MenuList>{renderContextMenu(row.original)}</MenuList>
                    )}
                  >
                    {(ref) => (
                      <Row
                        borderColor={borderColor}
                        backgroundColor={rowBackground}
                        // @ts-ignore
                        editableComponents={editableComponents}
                        isEditing={isEditing}
                        isEditMode={editMode}
                        isRowSelected={
                          row.index in rowSelection && !!rowSelection[row.index]
                        }
                        pinnedColumns={
                          columnPinning?.left
                            ? columnPinning.left?.length -
                              (withSelectableRows ? 1 : 0)
                            : 0
                        }
                        selectedCell={selectedCell}
                        // @ts-ignore
                        row={row}
                        rowIsClickable={rowsAreClickable}
                        rowIsSelected={selectedCell?.row === row.index}
                        rowRef={ref}
                        withColumnOrdering={withColumnOrdering}
                        onCellClick={onCellClick}
                        onCellUpdate={onCellUpdate}
                        onRowClick={
                          rowsAreClickable
                            ? () => onRowClick(row.original)
                            : undefined
                        }
                      />
                    )}
                  </ContextMenu>
                ) : (
                  <Row
                    key={row.id}
                    borderColor={borderColor}
                    backgroundColor={rowBackground}
                    // @ts-ignore
                    editableComponents={editableComponents}
                    isEditing={isEditing}
                    isEditMode={editMode}
                    isRowSelected={
                      row.index in rowSelection && !!rowSelection[row.index]
                    }
                    pinnedColumns={
                      columnPinning?.left
                        ? columnPinning.left?.length -
                          (withSelectableRows ? 1 : 0)
                        : 0
                    }
                    selectedCell={selectedCell}
                    // @ts-ignore
                    row={row}
                    rowIsClickable={rowsAreClickable}
                    rowIsSelected={selectedCell?.row === row.index}
                    withColumnOrdering={withColumnOrdering}
                    onCellClick={onCellClick}
                    onCellUpdate={onCellUpdate}
                    onRowClick={
                      rowsAreClickable
                        ? () => onRowClick(row.original)
                        : undefined
                    }
                  />
                );
              })}
            </Tbody>
          </ChakraTable>
        </Grid>
      </div>
      {withPagination && (
        <Pagination {...pagination} colorScheme={colorScheme} />
      )}
    </VStack>
  );
};

function getRowSelectionColumn<T>(): ColumnDef<T>[] {
  return [
    {
      id: "Select",
      size: 40,
      header: ({ table }) => (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      ),
      cell: ({ row }) => (
        <IndeterminateCheckbox
          {...{
            checked: row.getIsSelected(),
            indeterminate: row.getIsSomeSelected(),
            onChange: row.getToggleSelectedHandler(),
          }}
        />
      ),
    },
  ];
}

function getActionColumn<T>(
  renderContextMenu: (item: T) => JSX.Element | null
): ColumnDef<T>[] {
  return [
    {
      id: "Actions",
      header: () => <span className="sr-only">Actions</span>,
      cell: (item) => (
        <div className="flex justify-end">
          <ActionMenu>{renderContextMenu(item.row.original)}</ActionMenu>
        </div>
      ),
    },
  ];
}

export default Table;
