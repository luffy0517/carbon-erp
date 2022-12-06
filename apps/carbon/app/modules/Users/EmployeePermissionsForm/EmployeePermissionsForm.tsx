import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Hidden, Submit } from "~/components/Form";
import { employeeValidator } from "~/services/users";
import PermissionCheckboxes from "../Permission";
import type { Permission } from "../types";

type EmployeePermissionsFormProps = {
  name: string;
  initialValues: {
    id: string;
    permissions: Record<string, Permission>;
  };
};

const EmployeePermissionsForm = ({
  name,
  initialValues,
}: EmployeePermissionsFormProps) => {
  const navigate = useNavigate();
  const onClose = () => {
    navigate("/app/users/employees");
  };

  const [permissions, setPermissions] = useState(initialValues.permissions);
  const updatePermissions = (module: string, permission: Permission) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [module]: permission,
    }));
  };

  return (
    <Drawer onClose={onClose} isOpen={true} size="sm">
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader>{name}</DrawerHeader>
        <DrawerBody pb={8}>
          <ValidatedForm
            validator={employeeValidator}
            method="post"
            defaultValues={initialValues}
          >
            <VStack spacing={4} alignItems="start">
              <Text fontSize="md" fontWeight="medium">
                Permissions
              </Text>
              {Object.entries(permissions)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([module, data], index) => (
                  <Box key={index}>
                    <PermissionCheckboxes
                      module={module}
                      permissions={data}
                      updatePermissions={updatePermissions}
                    />
                  </Box>
                ))}
              <Hidden name="id" />
              <Hidden name="data" value={JSON.stringify(permissions)} />
            </VStack>
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
          </ValidatedForm>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};

export default EmployeePermissionsForm;
