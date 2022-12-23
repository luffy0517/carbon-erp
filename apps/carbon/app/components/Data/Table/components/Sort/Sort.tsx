import {
  Button,
  IconButton,
  HStack,
  List,
  ListItem,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverContent,
  PopoverFooter,
  PopoverHeader,
  PopoverTrigger,
  Switch,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
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

  return (
    <Popover placement="bottom">
      <PopoverTrigger>
        <Button
          colorScheme={sorts.length === 0 ? undefined : "brand"}
          variant={sorts.length === 0 ? "ghost" : "solid"}
          leftIcon={<BsListUl />}
        >
          {sorts.length === 0 ? "Sort" : "Sorted"}
        </Button>
      </PopoverTrigger>
      <PopoverContent w={420} boxShadow="xl">
        {sorts.length === 0 && (
          <PopoverHeader>
            <Text fontSize="sm">No sorts applied to this view</Text>
            <Text fontSize="xs" color="gray.500">
              Add a column below to sort the view
            </Text>
          </PopoverHeader>
        )}
        <PopoverArrow />
        {sorts.length > 0 && (
          <PopoverBody>
            <List
              as={Reorder.Group}
              axis="y"
              values={sorts}
              onReorder={reorderSorts}
              spacing={2}
            >
              {sorts.map((sort) => {
                const [column, direction] = sort.split(":");
                return (
                  <ListItem
                    key={sort}
                    as={Reorder.Item}
                    value={sort}
                    rounded="lg"
                  >
                    <HStack>
                      <IconButton
                        aria-label="Drag handle"
                        icon={<MdOutlineDragIndicator />}
                        variant="ghost"
                      />
                      <Text fontSize="small" flexGrow={1}>
                        <>{columnAccessors[column] ?? ""}</>
                      </Text>
                      <Switch
                        colorScheme="blackAlpha"
                        isChecked={direction === "asc"}
                        onChange={() => toggleSortByDirection(column)}
                      />
                      <Text fontSize="xs" color="gray.500">
                        Ascending
                      </Text>
                      <IconButton
                        aria-label="Remove sort by column"
                        icon={<IoMdClose />}
                        onClick={() => removeSortBy(sort)}
                        variant="ghost"
                      />
                    </HStack>
                  </ListItem>
                );
              })}
            </List>
          </PopoverBody>
        )}

        <PopoverFooter>
          <Menu isLazy>
            <MenuButton
              as={Button}
              rightIcon={<BsChevronDown />}
              colorScheme="gray"
              variant="outline"
            >
              Pick a column to sort by
            </MenuButton>
            <MenuList fontSize="sm" boxShadow="xl">
              {Object.keys(columnAccessors)
                .filter((columnAccessor) => {
                  return !sorts
                    .map((sort) => sort.split(":")[0])
                    .includes(columnAccessor);
                })
                .map((columnAccessor) => {
                  return (
                    <MenuItem
                      key={columnAccessor}
                      onClick={() => toggleSortBy(columnAccessor)}
                      icon={<BsListUl />}
                    >
                      {columnAccessors[columnAccessor]}
                    </MenuItem>
                  );
                })}
            </MenuList>
          </Menu>
        </PopoverFooter>
      </PopoverContent>
    </Popover>
  );
};

export default Sort;
