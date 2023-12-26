import { HStack, Select } from "@carbon/react";
import { Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { IoMdAdd } from "react-icons/io";
import { DebouncedInput } from "~/components/Search";
import { usePermissions, useUrlParams } from "~/hooks";
import type { ShiftLocation } from "~/modules/resources";

type ShiftsTableFiltersProps = {
  locations: Partial<ShiftLocation>[];
};

const ShiftsTableFilters = ({ locations }: ShiftsTableFiltersProps) => {
  const [params, setParams] = useUrlParams();
  const permissions = usePermissions();

  const locationOptions =
    locations?.map((location) => ({
      value: location.id,
      label: location.name,
    })) ?? [];

  return (
    <HStack className="px-4 py-3 justify-between border-b w-full" spacing={4}>
      <HStack>
        <DebouncedInput
          param="name"
          size="sm"
          minW={180}
          placeholder="Search"
        />
        <Select
          size="sm"
          value={locationOptions.find(
            (type) => type.value === params.get("location")
          )}
          isClearable
          options={locationOptions}
          onChange={(selected) => {
            setParams({ location: selected?.value });
          }}
          aria-label="Location"
          placeholder="Location"
        />
      </HStack>
      <HStack>
        {permissions.can("create", "resources") && (
          <Button
            as={Link}
            to={`new?${params.toString()}`}
            colorScheme="brand"
            leftIcon={<IoMdAdd />}
          >
            New Shift
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default ShiftsTableFilters;
