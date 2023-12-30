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
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { Hidden, Input, Submit, TextArea, Users } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { documentValidator } from "~/modules/documents";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type DocumentFormProps = {
  initialValues: TypeOfValidator<typeof documentValidator>;
  ownerId: string;
};

const DocumentForm = ({ initialValues, ownerId }: DocumentFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isDisabled = !permissions.can("update", "documents");

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          validator={documentValidator}
          method="post"
          action={path.to.document(initialValues.id)}
          defaultValues={initialValues}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>{`Edit ${initialValues.name}.${initialValues.type}`}</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <Hidden name="type" />
            <Hidden name="size" />
            <VStack spacing={4}>
              <Input
                name="name"
                label="Name"
                suffix={`.${initialValues.type}`}
              />
              <TextArea name="description" label="Description" />
              <Users
                alwaysSelected={[ownerId]}
                name="readGroups"
                label="View Permissions"
              />
              <Users
                alwaysSelected={[ownerId]}
                name="writeGroups"
                label="Edit Permissions"
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

export default DocumentForm;
