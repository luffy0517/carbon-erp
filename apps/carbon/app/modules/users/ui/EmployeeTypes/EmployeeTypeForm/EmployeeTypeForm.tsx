import { Button, HStack, VStack } from "@carbon/react";
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  FormLabel,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Color, Hidden, Input, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import type { Permission } from "~/modules/users";
import { employeeTypeValidator } from "~/modules/users";
import PermissionCheckboxes from "~/modules/users/ui/components/Permission";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type EmployeeTypeFormProps = {
  initialValues: TypeOfValidator<typeof employeeTypeValidator> & {
    permissions: Record<
      string,
      {
        id: string;
        permission: Permission;
      }
    >;
  };
};

const EmployeeTypeForm = ({ initialValues }: EmployeeTypeFormProps) => {
  const userPermissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const [permissions, setPermissions] = useState(initialValues.permissions);
  const updatePermissions = (module: string, permission: Permission) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [module]: {
        id: prevPermissions[module].id,
        permission,
      },
    }));
  };

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !userPermissions.can("update", "users")
    : !userPermissions.can("create", "users");

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <ValidatedForm
        validator={employeeTypeValidator}
        method="post"
        action={
          isEditing
            ? path.to.employeeType(initialValues.id!)
            : path.to.newEmployeeType
        }
        defaultValues={initialValues}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {isEditing ? "Edit" : "New"} Employee Type
          </DrawerHeader>
          <DrawerBody pb={8}>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Employee Type" />
              <Color name="color" label="Color" />
              <Hidden
                name="data"
                value={JSON.stringify(Object.values(permissions))}
              />
            </VStack>
            <VStack>
              <FormLabel>Default Permissions</FormLabel>
              {Object.entries(permissions)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([module, data], index) => (
                  <div key={index}>
                    <PermissionCheckboxes
                      module={module}
                      permissions={data.permission}
                      updatePermissions={updatePermissions}
                    />
                  </div>
                ))}
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

export default EmployeeTypeForm;
