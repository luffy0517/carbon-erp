import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  HStack,
  VStack,
} from "@carbon/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  Currency,
  Hidden,
  Select,
  Submit,
  Supplier,
  SupplierContact,
  SupplierLocation,
} from "~/components/Form";
import { usePermissions, useRouteData } from "~/hooks";
import { supplierPaymentValidator } from "~/modules/purchasing";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type SupplierPaymentFormProps = {
  initialValues: TypeOfValidator<typeof supplierPaymentValidator>;
};

const SupplierPaymentForm = ({ initialValues }: SupplierPaymentFormProps) => {
  const permissions = usePermissions();
  const [supplier, setSupplier] = useState<string | undefined>(
    initialValues.invoiceSupplierId
  );

  const routeData = useRouteData<{
    paymentTerms: ListItem[];
  }>(path.to.supplierRoot);

  const paymentTermOptions =
    routeData?.paymentTerms?.map((term) => ({
      value: term.id,
      label: term.name,
    })) ?? [];

  const isDisabled = !permissions.can("update", "purchasing");

  return (
    <ValidatedForm
      method="post"
      validator={supplierPaymentValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>Supplier Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <Hidden name="supplierId" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 w-full">
            <VStack>
              <Supplier
                name="invoiceSupplierId"
                label="Invoice Supplier"
                onChange={(value) => setSupplier(value?.value as string)}
              />
              <SupplierLocation
                name="invoiceSupplierLocationId"
                label="Invoice Location"
                supplier={supplier}
              />
              <SupplierContact
                name="invoiceSupplierContactId"
                label="Invoice Contact"
                supplier={supplier}
              />
            </VStack>
            <VStack>
              <Select
                name="paymentTermId"
                label="Payment Term"
                options={paymentTermOptions}
              />
              <Currency name="currencyCode" label="Currency" />
            </VStack>
          </div>
        </CardContent>
        <CardFooter>
          <HStack>
            <Submit isDisabled={isDisabled}>Save</Submit>
          </HStack>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default SupplierPaymentForm;
