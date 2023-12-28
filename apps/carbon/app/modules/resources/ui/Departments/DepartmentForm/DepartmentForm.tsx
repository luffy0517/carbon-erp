import { Button, HStack, VStack } from "@carbon/react";
import {
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
import { Color, Department, Hidden, Input, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import { departmentValidator } from "~/modules/resources";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type DepartmentFormProps = {
  initialValues: TypeOfValidator<typeof departmentValidator>;
};

const DepartmentForm = ({ initialValues }: DepartmentFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "resources")
    : !permissions.can("create", "resources");

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <ValidatedForm
        validator={departmentValidator}
        method="post"
        action={
          isEditing
            ? path.to.department(initialValues.id!)
            : path.to.newDepartment
        }
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>{isEditing ? "Edit" : "New"} Department</DrawerHeader>
          <DrawerBody pb={8}>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Department Name" />
              <Color name="color" label="Color" />
              <Department name="parentDepartmentId" label="Parent Department" />
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
        </DrawerContent>
      </ValidatedForm>
    </Drawer>
  );
};

export default DepartmentForm;
