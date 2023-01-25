import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  HStack,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import {
  Input,
  Select,
  Submit,
  User,
  TextArea,
  Hidden,
} from "~/components/Form";
import { customerValidator } from "~/services/sales";
import type {
  CustomerContact,
  CustomerLocation,
  CustomerStatus,
  CustomerType,
} from "~/interfaces/Sales/types";
import { mapRowsToOptions } from "~/utils/form";
import { useRouteData } from "~/hooks";
import { CustomerContacts, CustomerLocations } from "./components";

type CustomerFormProps = {
  initialValues: {
    id?: string;
    name: string;
    description?: string;
    accountManagerId?: string;
    customerTypeId?: string;
    customerStatusId?: number;
    taxId?: string;
  };
  contacts?: CustomerContact[];
  locations?: CustomerLocation[];
};

const CustomerForm = ({
  initialValues,
  contacts,
  locations,
}: CustomerFormProps) => {
  const navigate = useNavigate();
  const onClose = () => navigate("/app/sales/customers");

  const routeData = useRouteData<{
    customerTypes: { data: CustomerType[] };
    customerStatuses: { data: CustomerStatus[] };
  }>("/app/sales/customers");

  const customerTypeOptions = routeData?.customerTypes
    ? mapRowsToOptions({
        data: routeData.customerTypes.data ?? [],
        value: "id",
        label: "name",
      })
    : [];

  const customerStatusOptions = routeData?.customerStatuses
    ? mapRowsToOptions({
        data: routeData.customerStatuses.data ?? [],
        value: "id",
        label: "name",
      })
    : [];

  const isEditing = initialValues.id !== undefined;

  return (
    <Drawer onClose={onClose} isOpen size="full">
      <ValidatedForm
        method="post"
        action={
          isEditing
            ? `/app/sales/customers/${initialValues.id}`
            : "/app/sales/customers/new"
        }
        validator={customerValidator}
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {isEditing ? initialValues.name : "New Customer"}
          </DrawerHeader>
          <DrawerBody>
            <Grid
              gridTemplateColumns={["1fr", "1fr", "5fr 2fr"]}
              gridColumnGap={8}
              w="full"
            >
              <Box w="full">
                <Hidden name="id" />
                <VStack spacing={4} w="full" alignItems="start">
                  <Grid
                    gridTemplateColumns={["1fr", "1fr", "1fr 1fr"]}
                    gridColumnGap={8}
                    gridRowGap={4}
                    w="full"
                  >
                    <Input name="name" label="Name" />
                    <Input name="taxId" label="Tax ID" />
                    <Select
                      name="customerTypeId"
                      label="Customer Type"
                      options={customerTypeOptions}
                      placeholder="Select Customer Type"
                    />
                    <User name="accountManagerId" label="Account Manager" />
                    <Select
                      name="customerStatusId"
                      label="Customer Status"
                      options={customerStatusOptions}
                      placeholder="Select Customer Status"
                    />
                  </Grid>

                  <TextArea
                    name="description"
                    label="Description"
                    characterLimit={500}
                    my={2}
                  />
                </VStack>
              </Box>
              <VStack spacing={8} w="full" alignItems="start" py={[8, 8, 0]}>
                <CustomerLocations
                  locations={locations}
                  isEditing={isEditing}
                />
                <CustomerContacts
                  contacts={contacts}
                  locations={locations}
                  isEditing={isEditing}
                />
              </VStack>
            </Grid>
          </DrawerBody>
          <DrawerFooter>
            <HStack spacing={2}>
              <Submit>Save</Submit>
              <Button
                size="md"
                colorScheme="gray"
                variant="solid"
                onClick={onClose}
              >
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </DrawerContent>
      </ValidatedForm>
    </Drawer>
  );
};

export default CustomerForm;
