import { VStack } from "@carbon/react";
import { Grid } from "@chakra-ui/react";
import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { GroupedContentSidebar } from "~/components/Layout";
import { useUsersSidebar } from "~/modules/users";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Users" }];
};

export const handle: Handle = {
  breadcrumb: "Users",
  to: path.to.users,
  module: "users",
};

export default function UsersRoute() {
  const { groups } = useUsersSidebar();

  return (
    <Grid w="full" h="full" templateColumns="auto 1fr">
      <GroupedContentSidebar groups={groups} />
      <VStack spacing={0} className="h-full">
        <Outlet />
      </VStack>
    </Grid>
  );
}
