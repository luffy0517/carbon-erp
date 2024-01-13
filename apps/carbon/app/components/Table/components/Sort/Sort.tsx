import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuIcon,
  DropdownMenuItem,
  DropdownMenuTrigger,
  HStack,
  IconButton,
  Popover,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Switch,
} from "@carbon/react";
import { Reorder } from "framer-motion";
import { BsChevronDown, BsListUl } from "react-icons/bs";
import { IoMdClose } from "react-icons/io";
import { MdOutlineDragIndicator } from "react-icons/md";
import { useSort } from "./useSort";

type SortProps = {
  columnAccessors: Record<string, string>;
};

const Sort = ({ columnAccessors }: SortProps) => {
  const {
    sorts,
    removeSortBy,
    reorderSorts,
    toggleSortBy,
    toggleSortByDirection,
  } = useSort();
  const hasNoSorts = sorts.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={hasNoSorts ? "ghost" : "primary"}
          leftIcon={<BsListUl />}
        >
          {hasNoSorts ? "Sort" : "Sorted"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px]">
        {hasNoSorts && (
          <PopoverHeader>
            <p className="text-sm">No sorts applied to this view</p>
            <p className="text-xs text-muted-foreground">
              Add a column below to sort the view
            </p>
          </PopoverHeader>
        )}

        {!hasNoSorts && (
          <Reorder.Group
            axis="y"
            values={sorts}
            onReorder={reorderSorts}
            className="space-y-2"
          >
            {sorts.map((sort) => {
              const [column, direction] = sort.split(":");
              return (
                <Reorder.Item key={sort} value={sort} className="rounded-lg">
                  <HStack>
                    <IconButton
                      aria-label="Drag handle"
                      icon={<MdOutlineDragIndicator />}
                      variant="ghost"
                    />
                    <span className="text-sm flex-grow">
                      <>{columnAccessors[column] ?? ""}</>
                    </span>
                    <Switch
                      checked={direction === "asc"}
                      onCheckedChange={() => toggleSortByDirection(column)}
                    />
                    <span className="text-sm text-muted-foreground">
                      Ascending
                    </span>
                    <IconButton
                      aria-label="Remove sort by column"
                      icon={<IoMdClose />}
                      onClick={() => removeSortBy(sort)}
                      variant="ghost"
                    />
                  </HStack>
                </Reorder.Item>
              );
            })}
          </Reorder.Group>
        )}

        <PopoverFooter>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button rightIcon={<BsChevronDown />} variant="secondary">
                Pick a column to sort by
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {Object.keys(columnAccessors)
                .filter((columnAccessor) => {
                  return !sorts
                    .map((sort) => sort.split(":")[0])
                    .includes(columnAccessor);
                })
                .map((columnAccessor) => {
                  return (
                    <DropdownMenuItem
                      key={columnAccessor}
                      onClick={() => toggleSortBy(columnAccessor)}
                    >
                      <DropdownMenuIcon icon={<BsListUl />} />
                      {columnAccessors[columnAccessor]}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Sort;
