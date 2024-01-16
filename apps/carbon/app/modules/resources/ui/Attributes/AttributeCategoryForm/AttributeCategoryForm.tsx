import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  HStack,
  VStack,
} from "@carbon/react";
import { ValidatedForm } from "remix-validated-form";
import { Boolean, Hidden, Input, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { attributeCategoryValidator } from "~/modules/resources";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type AttributeCategoryFormProps = {
  initialValues: TypeOfValidator<typeof attributeCategoryValidator>;
  onClose: () => void;
};

const AttributeCategoryForm = ({
  initialValues,
  onClose,
}: AttributeCategoryFormProps) => {
  const permissions = usePermissions();
  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "resources")
    : !permissions.can("create", "resources");

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          validator={attributeCategoryValidator}
          method="post"
          action={
            isEditing
              ? path.to.attributeCategory(initialValues.id!)
              : path.to.newAttributeCategory
          }
          defaultValues={initialValues}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit" : "New"} Attribute Category
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Category Name" />
              <Boolean
                name="isPublic"
                label="Public"
                description="Visible on a user's public profile"
              />
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Submit isDisabled={isDisabled}>Save</Submit>
              <Button size="md" variant="solid" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </ValidatedForm>
      </DrawerContent>
    </Drawer>
  );
};

export default AttributeCategoryForm;
