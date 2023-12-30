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
import { Hidden, Input, Select, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  accountCategoryValidator,
  accountClassTypes,
  incomeBalanceTypes,
} from "~/modules/accounting";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type AccountCategoryFormProps = {
  initialValues: TypeOfValidator<typeof accountCategoryValidator>;
  onClose: () => void;
};

const AccountCategoryForm = ({
  initialValues,
  onClose,
}: AccountCategoryFormProps) => {
  const permissions = usePermissions();

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "accounting")
    : !permissions.can("create", "accounting");

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          validator={accountCategoryValidator}
          method="post"
          action={
            isEditing
              ? path.to.accountingCategory(initialValues.id!)
              : path.to.newAccountingCategory
          }
          defaultValues={initialValues}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>
              {isEditing ? "Edit" : "New"} Account Category
            </DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <VStack>
              <Input name="category" label="Category" />
              <Select
                name="incomeBalance"
                label="Income Balance"
                options={incomeBalanceTypes.map((incomeBalance) => ({
                  value: incomeBalance,
                  label: incomeBalance,
                }))}
              />
              <Select
                name="class"
                label="Class"
                options={accountClassTypes.map((accountClass) => ({
                  value: accountClass,
                  label: accountClass,
                }))}
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

export default AccountCategoryForm;
