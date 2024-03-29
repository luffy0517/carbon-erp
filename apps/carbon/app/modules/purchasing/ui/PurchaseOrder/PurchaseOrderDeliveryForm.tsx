import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  VStack,
} from "@carbon/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  Boolean,
  Customer,
  CustomerLocation,
  DatePicker,
  Hidden,
  Input,
  Location,
  Select,
  Submit,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import { purchaseOrderDeliveryValidator } from "~/modules/purchasing";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";

type PurchaseOrderDeliveryFormProps = {
  initialValues: TypeOfValidator<typeof purchaseOrderDeliveryValidator>;
  shippingMethods: ListItem[];
  shippingTerms: ListItem[];
};

const PurchaseOrderDeliveryForm = ({
  initialValues,
  shippingMethods,
  shippingTerms,
}: PurchaseOrderDeliveryFormProps) => {
  const permissions = usePermissions();
  const [dropShip, setDropShip] = useState<boolean>(
    initialValues.dropShipment ?? false
  );
  const [customer, setCustomer] = useState<string | undefined>(
    initialValues.customerId
  );

  const shippingMethodOptions = shippingMethods.map((method) => ({
    label: method.name,
    value: method.id,
  }));

  const shippingTermOptions = shippingTerms.map((term) => ({
    label: term.name,
    value: term.id,
  }));

  const isSupplier = permissions.is("supplier");

  return (
    <ValidatedForm
      method="post"
      validator={purchaseOrderDeliveryValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>Delivery</CardTitle>
        </CardHeader>
        <CardContent>
          <Hidden name="id" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 w-full">
            <VStack>
              <Location
                name="locationId"
                label="Delivery Location"
                isReadOnly={isSupplier}
                isClearable
              />
              <Select
                name="shippingMethodId"
                label="Shipping Method"
                options={shippingMethodOptions}
              />
              <Select
                name="shippingTermId"
                label="Shipping Terms"
                isReadOnly={isSupplier}
                options={shippingTermOptions}
              />
            </VStack>
            <VStack>
              <DatePicker name="receiptRequestedDate" label="Requested Date" />
              <DatePicker name="receiptPromisedDate" label="Promised Date" />
              <DatePicker name="deliveryDate" label="Delivery Date" />
            </VStack>
            <VStack>
              <Input name="trackingNumber" label="Tracking Number" />
              {/* <TextArea name="notes" label="Shipping Notes" /> */}
              <Boolean
                name="dropShipment"
                label="Drop Shipment"
                onChange={setDropShip}
              />
              {dropShip && (
                <>
                  <Customer
                    name="customerId"
                    label="Customer"
                    onChange={(value) => setCustomer(value?.value as string)}
                  />
                  <CustomerLocation
                    name="customerLocationId"
                    label="Location"
                    customer={customer}
                  />
                </>
              )}
            </VStack>
          </div>
        </CardContent>
        <CardFooter>
          <Submit isDisabled={!permissions.can("update", "purchasing")}>
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default PurchaseOrderDeliveryForm;
