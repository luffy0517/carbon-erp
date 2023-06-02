import { VStack } from "@chakra-ui/react";
import type { LoaderArgs, MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import {
  getPurchaseOrderApprovalStatuses,
  getPurchaseOrderTypes,
} from "~/modules/purchasing";
import { requirePermissions } from "~/services/auth";

export const meta: MetaFunction = () => ({
  title: "Carbon | Purchasing",
});

export async function loader({ request }: LoaderArgs) {
  await requirePermissions(request, {
    view: "purchasing",
  });

  // const [] = await Promise.all([]);

  return {
    purchaseOrderApprovalStatuses: getPurchaseOrderApprovalStatuses(),
    purchaseOrderTypes: getPurchaseOrderTypes(),
  };
}

export default function PurchaseOrderRoute() {
  return (
    <VStack w="full" h="full" spacing={4} p={4}>
      <Outlet />
    </VStack>
  );
}
