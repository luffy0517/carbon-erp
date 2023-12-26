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
import { ValidatedForm } from "remix-validated-form";
import {
  Ability,
  Color,
  Hidden,
  Input,
  Submit,
  TextArea,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import { equipmentTypeValidator } from "~/modules/resources";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type EquipmentTypeFormProps = {
  initialValues: TypeOfValidator<typeof equipmentTypeValidator>;
  onClose: () => void;
};

const EquipmentTypeForm = ({
  initialValues,
  onClose,
}: EquipmentTypeFormProps) => {
  const permissions = usePermissions();
  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "resources")
    : !permissions.can("create", "resources");

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <ValidatedForm
        validator={equipmentTypeValidator}
        method="post"
        action={
          isEditing
            ? path.to.equipmentType(initialValues.id!)
            : path.to.newEquipmentType
        }
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {isEditing ? "Edit" : "New"} Equipment Type
          </DrawerHeader>
          <DrawerBody pb={8}>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Name" />
              <TextArea name="description" label="Description" />
              <Color name="color" label="Color" />
              <Ability name="requiredAbility" label="Required Ability" />
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

export default EquipmentTypeForm;
