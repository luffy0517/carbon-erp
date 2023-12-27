import { HStack, Select } from "@carbon/react";
import { Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { IoMdAdd } from "react-icons/io";
import { DebouncedInput } from "~/components/Search";
import { usePermissions, useUrlParams } from "~/hooks";
import { partTypes } from "~/modules/parts";
import type { ListItem } from "~/types";
import { path } from "~/utils/path";

type PartsTableFiltersProps = {
  partGroups: ListItem[];
};

const PartsTableFilters = ({ partGroups }: PartsTableFiltersProps) => {
  const [params, setParams] = useUrlParams();
  const permissions = usePermissions();
  const partTypeOptions = partTypes.map((type) => ({
    value: type,
    label: type,
  }));

  const partGroupsOptions = partGroups.map((group) => ({
    value: group.id,
    label: group.name,
  }));

  return (
    <HStack
      className="px-4 py-3 justify-between border-b border-border w-full"
      spacing={4}
    >
      <HStack>
        <DebouncedInput
          param="search"
          size="sm"
          minW={180}
          placeholder="Search Parts"
        />
        {partGroupsOptions.length > 0 && (
          <Select
            size="sm"
            isClearable
            value={partGroupsOptions.find(
              (type) => type.value === params.get("group")
            )}
            options={partGroupsOptions}
            onChange={(selected) => {
              setParams({ group: selected?.value });
            }}
            aria-label="Groups"
            placeholder="Part Groups"
          />
        )}
        {partTypeOptions.length > 0 && (
          <Select
            size="sm"
            value={partTypeOptions.find(
              (type) => type.value === params.get("type")
            )}
            isClearable
            options={partTypeOptions}
            onChange={(selected) => {
              setParams({ type: selected?.value });
            }}
            aria-label="Part Type"
            placeholder="Part Type"
          />
        )}
      </HStack>
      <HStack>
        {permissions.can("create", "parts") && (
          <Button
            as={Link}
            to={path.to.newPart}
            colorScheme="brand"
            leftIcon={<IoMdAdd />}
          >
            New Part
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default PartsTableFilters;
