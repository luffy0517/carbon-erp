import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  VStack,
  cn,
} from "@carbon/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  DatePicker,
  Hidden,
  Input,
  Select,
  Submit,
  Supplier,
  SupplierContact,
  SupplierLocation,
  TextArea,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  purchaseOrderStatusType,
  purchaseOrderTypeType,
  purchaseOrderValidator,
} from "~/modules/purchasing";
import type { TypeOfValidator } from "~/types/validators";

type PurchaseOrderFormValues = TypeOfValidator<typeof purchaseOrderValidator>;

type PurchaseOrderFormProps = {
  initialValues: PurchaseOrderFormValues;
};

const PurchaseOrderForm = ({ initialValues }: PurchaseOrderFormProps) => {
  const permissions = usePermissions();
  const [supplier, setSupplier] = useState<string | undefined>(
    initialValues.supplierId
  );
  const isEditing = initialValues.id !== undefined;
  const isSupplier = permissions.is("supplier");

  const statusOptions = purchaseOrderStatusType.map((status) => ({
    label: status,
    value: status,
  }));

  const typeOptions = purchaseOrderTypeType.map((type) => ({
    label: type,
    value: type,
  }));

  return (
    <ValidatedForm
      method="post"
      validator={purchaseOrderValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Purchase Order" : "New Purchase Order"}
          </CardTitle>
          {!isEditing && (
            <CardDescription>
              A purchase order contains information about the agreement between
              the company and a specific supplier for parts and services.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Hidden name="purchaseOrderId" />
          <VStack>
            <div
              className={cn(
                "grid w-full gap-x-8 gap-y-2",
                isEditing ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              )}
            >
              <VStack>
                <Supplier
                  autoFocus={!isEditing}
                  name="supplierId"
                  label="Supplier"
                  onChange={(newValue) =>
                    setSupplier(newValue?.value as string | undefined)
                  }
                />
                {isEditing && (
                  <>
                    <SupplierLocation
                      name="supplierLocationId"
                      label="Supplier Location"
                      supplier={supplier}
                    />
                    <SupplierContact
                      name="supplierContactId"
                      label="Supplier Contact"
                      supplier={supplier}
                    />
                  </>
                )}
              </VStack>
              <VStack>
                <Input name="supplierReference" label="Supplier Order Number" />
                <DatePicker
                  name="orderDate"
                  label="Order Date"
                  isDisabled={isSupplier}
                />
                <Select
                  name="type"
                  label="Type"
                  options={typeOptions}
                  isReadOnly={true} // {isSupplier}
                />
              </VStack>
              <VStack>
                {isEditing && (
                  <>
                    {permissions.can("delete", "purchasing") && (
                      <Select
                        name="status"
                        label="Status"
                        value={initialValues.status}
                        options={statusOptions}
                        isReadOnly={isSupplier}
                      />
                    )}
                    <TextArea
                      name="notes"
                      label="Notes"
                      readOnly={isSupplier}
                    />
                  </>
                )}
              </VStack>
            </div>
          </VStack>
        </CardContent>
        <CardFooter>
          <Submit
            isDisabled={
              isEditing
                ? !permissions.can("update", "purchasing")
                : !permissions.can("create", "purchasing")
            }
          >
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default PurchaseOrderForm;
