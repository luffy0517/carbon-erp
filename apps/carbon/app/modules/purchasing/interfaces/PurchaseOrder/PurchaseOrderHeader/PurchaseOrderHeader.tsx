import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  HStack,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useParams } from "@remix-run/react";
import { FaHistory } from "react-icons/fa";
import { useRouteData } from "~/hooks";
import type { PurchaseOrder } from "~/modules/purchasing";

const PartPreview = () => {
  const { orderId } = useParams();
  if (!orderId) throw new Error("Could not find orderId");
  const routeData = useRouteData<{ purchaseOrder: PurchaseOrder }>(
    `/x/purchase-order/${orderId}`
  );

  return (
    <Card w="full">
      <CardHeader>
        <HStack justifyContent="space-between" alignItems="start">
          <Stack direction="column" spacing={2}>
            <Heading size="md">
              {routeData?.purchaseOrder?.purchaseOrderId}
            </Heading>
            <Text color="gray.500">
              {routeData?.purchaseOrder?.supplierName}
            </Text>
          </Stack>
          <Button onClick={() => alert("TODO")} leftIcon={<FaHistory />}>
            Supplier Details
          </Button>
        </HStack>
      </CardHeader>
      <CardBody>
        <Stack direction={["column", "column", "row"]} spacing={8}>
          <Stack
            direction={["row", "row", "column"]}
            alignItems="start"
            justifyContent="space-between"
          >
            <Text color="gray.500">Order Date</Text>
            <Text fontWeight="bold">{routeData?.purchaseOrder?.orderDate}</Text>
          </Stack>
          <Stack
            direction={["row", "row", "column"]}
            alignItems="start"
            justifyContent="space-between"
          >
            <Text color="gray.500">Delivery Location</Text>
            <Text fontWeight="bold">
              {routeData?.purchaseOrder?.dropShipment
                ? "Drop Ship"
                : routeData?.purchaseOrder?.locationName}
            </Text>
          </Stack>
          <Stack
            direction={["row", "row", "column"]}
            alignItems="start"
            justifyContent="space-between"
          >
            <Text color="gray.500">Promised Date</Text>
            <Text fontWeight="bold">
              {routeData?.purchaseOrder?.receiptPromisedDate}
            </Text>
          </Stack>
          <Stack
            direction={["row", "row", "column"]}
            alignItems="start"
            justifyContent="space-between"
          >
            <Text color="gray.500">Order Type</Text>
            <Text fontWeight="bold">{routeData?.purchaseOrder?.type}</Text>
          </Stack>
          <Stack
            direction={["row", "row", "column"]}
            alignItems="start"
            justifyContent="space-between"
          >
            <Text color="gray.500">Order Status</Text>
            <Text fontWeight="bold">{routeData?.purchaseOrder?.status}</Text>
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
};

export default PartPreview;
