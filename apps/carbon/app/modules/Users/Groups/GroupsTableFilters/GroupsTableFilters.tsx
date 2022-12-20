import { useColor } from "@carbon/react";
import { Button, HStack } from "@chakra-ui/react";
import { Link } from "@remix-run/react";
import { IoMdAdd } from "react-icons/io";
import { DebouncedInput } from "~/components/Search";
import { usePermissions } from "~/hooks";

const GroupsTableFilters = () => {
  const permissions = usePermissions();
  const borderColor = useColor("gray.200");
  return (
    <HStack
      px={4}
      py={3}
      justifyContent="space-between"
      borderBottomColor={borderColor}
      borderBottomStyle="solid"
      borderBottomWidth={1}
    >
      <HStack spacing={2}>
        <DebouncedInput
          param="name"
          size="sm"
          minW={180}
          placeholder="Search by name"
        />
      </HStack>
      <HStack spacing={2}>
        {permissions.can("create", "users") && (
          <Button as={Link} to="new" colorScheme="brand" leftIcon={<IoMdAdd />}>
            New Group
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default GroupsTableFilters;
