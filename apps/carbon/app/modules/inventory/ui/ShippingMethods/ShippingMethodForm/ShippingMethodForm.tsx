import { HStack, VStack } from "@carbon/react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { Account, Hidden, Input, Select, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { shippingMethodValidator } from "~/modules/inventory";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type ShippingMethodFormProps = {
  initialValues: TypeOfValidator<typeof shippingMethodValidator>;
};

const ShippingMethodForm = ({ initialValues }: ShippingMethodFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "inventory")
    : !permissions.can("create", "inventory");

  const shippingCarrierOptions = ["UPS", "FedEx", "USPS", "DHL", "Other"].map(
    (v) => ({
      label: v,
      value: v,
    })
  );

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <ValidatedForm
        validator={shippingMethodValidator}
        method="post"
        action={
          isEditing
            ? path.to.shippingMethod(initialValues.id!)
            : path.to.newShippingMethod
        }
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {isEditing ? "Edit" : "New"} Shipping Method
          </DrawerHeader>
          <DrawerBody pb={8}>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Name" />
              <Select
                name="carrier"
                label="Carrier"
                options={shippingCarrierOptions}
              />
              <Account
                classes={["Expense"]}
                name="carrierAccountId"
                label="Carrier Account"
              />
              <Input
                name="trackingUrl"
                label="Tracking URL"
                prefix="https://"
              />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Submit isDisabled={isDisabled}>Save</Submit>
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

export default ShippingMethodForm;
