import { Heading } from "@carbon/react";
import { Button, HStack, Text, VStack } from "@chakra-ui/react";
import { BsEnvelopeFill } from "react-icons/bs";
import { Avatar } from "~/components";
import { usePermissions } from "~/hooks";
import type { Account } from "~/modules/account";

const PersonHeader = ({ user }: { user: Account }) => {
  const permissions = usePermissions();
  return (
    <HStack py={4} justifyContent="space-between" spacing={4} w="full">
      <HStack spacing={4}>
        <Avatar size="lg" path={user.avatarUrl} />
        <VStack align="start" spacing={1}>
          <Heading size="h3">{user.fullName}</Heading>
          <Text color="gray.500" fontSize="sm">
            {user.about}
          </Text>
        </VStack>
      </HStack>
      <HStack spacing={2}>
        {permissions.can("create", "messaging") && (
          <Button
            size="md"
            leftIcon={<BsEnvelopeFill />}
            onClick={() => alert("TODO")}
          >
            Message
          </Button>
        )}
      </HStack>
    </HStack>
  );
};

export default PersonHeader;
