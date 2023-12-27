import { HStack, Select } from "@carbon/react";
import { Button } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { IoMdAdd } from "react-icons/io";
import { DebouncedInput } from "~/components/Search";
import { usePermissions, useUrlParams } from "~/hooks";
import type { CustomerStatus, CustomerType } from "~/modules/sales";
import { path } from "~/utils/path";

type CustomersTableFiltersProps = {
  customerTypes: Partial<CustomerType>[];
  customerStatuses: CustomerStatus[];
};

const CustomersTableFilters = ({
  customerTypes,
  customerStatuses,
}: CustomersTableFiltersProps) => {
  const [params, setParams] = useUrlParams();
  const permissions = usePermissions();
  const customerTypeOptions =
    customerTypes?.map((type) => ({
      value: type.id,
      label: type.name,
    })) ?? [];

  const customerStatusOptions =
    customerStatuses?.map((status) => ({
      value: status.id,
      label: status.name,
    })) ?? [];

  return (
    <HStack
      className="px-4 py-3 justify-between border-b border-border w-full"
      spacing={4}
    >
      <HStack>
        <DebouncedInput
          param="name"
          size="sm"
          minW={180}
          placeholder="Search"
        />
        {customerTypeOptions.length > 0 && (
          <Select
            size="sm"
            value={customerTypeOptions.find(
              (type) => type.value === params.get("type")
            )}
            isClearable
            options={customerTypeOptions}
            onChange={(selected) => {
              setParams({ type: selected?.value });
            }}
            aria-label="Customer Type"
            placeholder="Customer Type"
          />
        )}
        {customerStatusOptions && (
          <Select
            size="sm"
            isClearable
            value={customerStatusOptions.find(
              (type) => type.value === params.get("status")
            )}
            options={customerStatusOptions}
            onChange={(selected) => {
              setParams({ status: selected?.value });
            }}
            aria-label="Status"
            placeholder="Customer Status"
          />
        )}
      </HStack>
      <HStack>
        {permissions.can("create", "sales") && (
          <Button
            as={Link}
            to={`${path.to.newCustomer}?${params.toString()}`}
            colorScheme="brand"
            leftIcon={<IoMdAdd />}
          >
            New Customer
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default CustomersTableFilters;
