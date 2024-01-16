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
  Currency,
  DatePicker,
  Hidden,
  Input,
  Select,
  Submit,
  Supplier,
  SupplierContact,
  SupplierLocation,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  purchaseInvoiceStatusType,
  purchaseInvoiceValidator,
} from "~/modules/invoicing";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";

type PurchaseInvoiceFormValues = TypeOfValidator<
  typeof purchaseInvoiceValidator
>;

type PurchaseInvoiceFormProps = {
  initialValues: PurchaseInvoiceFormValues;
  paymentTerms: ListItem[];
};

const PurchaseInvoiceForm = ({
  initialValues,
  paymentTerms,
}: PurchaseInvoiceFormProps) => {
  const permissions = usePermissions();
  const [supplier, setSupplier] = useState<string | undefined>(
    initialValues.supplierId
  );

  const isEditing = initialValues.id !== undefined;

  const statusOptions = purchaseInvoiceStatusType.map((status) => ({
    label: status,
    value: status,
  }));

  const paymentTermOptions = paymentTerms.map((paymentTerm) => ({
    label: paymentTerm.name,
    value: paymentTerm.id,
  }));

  return (
    <ValidatedForm
      method="post"
      validator={purchaseInvoiceValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Purchase Invoice" : "New Purchase Invoice"}
          </CardTitle>
          {!isEditing && (
            <CardDescription>
              A purchase invoice is a document that specifies the products or
              services purchased by a customer and the corresponding cost.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Hidden name="id" />
          <Hidden name="invoiceId" />
          <VStack>
            <div
              className={cn(
                "grid w-full gap-x-8 gap-y-2",
                isEditing ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              )}
            >
              <VStack>
                <Supplier
                  name="supplierId"
                  label="Supplier"
                  isReadOnly={isEditing}
                />
                {isEditing && (
                  <>
                    <Supplier
                      name="invoiceSupplierId"
                      label="Invoice Supplier"
                      onChange={(newValue) =>
                        setSupplier(newValue?.value as string | undefined)
                      }
                    />
                    <SupplierLocation
                      name="invoiceSupplierLocationId"
                      label="Invoice Location"
                      supplier={supplier}
                    />
                    <SupplierContact
                      name="invoiceSupplierContactId"
                      label="Invoice Supplier Contact"
                      supplier={supplier}
                    />
                  </>
                )}
              </VStack>
              <VStack>
                <Input
                  name="supplierReference"
                  label="Supplier Invoice Number"
                />
                <DatePicker name="dateIssued" label="Date Issued" />
                <DatePicker name="dateDue" label="Due Date" />
                {isEditing && (
                  <Select
                    name="status"
                    label="Status"
                    value={initialValues.status}
                    options={statusOptions}
                    isReadOnly={permissions.can("delete", "invoicing")}
                  />
                )}
              </VStack>
              <VStack>
                {isEditing && (
                  <>
                    <Select
                      name="paymentTermId"
                      label="Payment Terms"
                      options={paymentTermOptions}
                    />
                    <Currency name="currencyCode" label="Currency" />
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
                ? !permissions.can("update", "invoicing")
                : !permissions.can("create", "invoicing")
            }
          >
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default PurchaseInvoiceForm;
