import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  HStack,
  VStack,
} from "@carbon/react";
import { Grid } from "@chakra-ui/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  Customer,
  CustomerContact,
  CustomerLocation,
  Hidden,
  Select,
  Submit,
} from "~/components/Form";
import { usePermissions, useRouteData } from "~/hooks";
import { customerShippingValidator } from "~/modules/sales";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type CustomerShippingFormProps = {
  initialValues: TypeOfValidator<typeof customerShippingValidator>;
};

const CustomerShippingForm = ({ initialValues }: CustomerShippingFormProps) => {
  const permissions = usePermissions();
  const [customer, setCustomer] = useState<string | undefined>(
    initialValues.shippingCustomerId
  );

  const routeData = useRouteData<{
    shippingMethods: ListItem[];
    shippingTerms: ListItem[];
  }>(path.to.customerRoot);

  const shippingMethodOptions =
    routeData?.shippingMethods?.map((method) => ({
      value: method.id,
      label: method.name,
    })) ?? [];

  const shippingTermOptions =
    routeData?.shippingTerms?.map((term) => ({
      value: term.id,
      label: term.name,
    })) ?? [];

  const isDisabled = !permissions.can("update", "sales");

  return (
    <ValidatedForm
      method="post"
      validator={customerShippingValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>Customer Shipping</CardTitle>
        </CardHeader>
        <CardContent>
          <Hidden name="customerId" />
          <Grid
            gridTemplateColumns={["1fr", "1fr", "1fr 1fr 1fr"]}
            gridColumnGap={8}
            gridRowGap={2}
            w="full"
          >
            <VStack>
              <Customer
                name="shippingCustomerId"
                label="Shipping Customer"
                onChange={(value) => setCustomer(value?.value as string)}
              />
              <CustomerLocation
                name="shippingCustomerLocationId"
                label="Shipping Location"
                customer={customer}
              />
              <CustomerContact
                name="shippingCustomerContactId"
                label="Shipping Contact"
                customer={customer}
              />
            </VStack>
            <VStack>
              <Select
                name="shippingMethodId"
                label="Shipping Method"
                options={shippingMethodOptions}
              />
              <Select
                name="shippingTermId"
                label="Shipping Term"
                options={shippingTermOptions}
              />
            </VStack>
          </Grid>
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

export default CustomerShippingForm;
