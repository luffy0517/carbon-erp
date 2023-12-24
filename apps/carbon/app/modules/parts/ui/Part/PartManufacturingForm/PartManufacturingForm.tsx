import { Heading } from "@carbon/react";
import {
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Grid,
  VStack,
} from "@chakra-ui/react";
import { ValidatedForm } from "remix-validated-form";
import { Boolean, Hidden, Number, Select, Submit } from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  partManufacturingPolicies,
  partManufacturingValidator,
} from "~/modules/parts";
import type { TypeOfValidator } from "~/types/validators";

type PartManufacturingFormProps = {
  initialValues: TypeOfValidator<typeof partManufacturingValidator>;
};

const PartManufacturingForm = ({
  initialValues,
}: PartManufacturingFormProps) => {
  const permissions = usePermissions();

  const partManufacturingPolicyOptions =
    partManufacturingPolicies?.map((policy) => ({
      label: policy,
      value: policy,
    })) ?? [];

  return (
    <ValidatedForm
      method="post"
      validator={partManufacturingValidator}
      defaultValues={initialValues}
    >
      <Card w="full">
        <CardHeader>
          <Heading size="h3">Manufacturing</Heading>
        </CardHeader>
        <CardBody>
          <Hidden name="partId" />
          <Grid
            gridTemplateColumns={["1fr", "1fr", "1fr 1fr 1fr"]}
            gridColumnGap={8}
            gridRowGap={2}
            w="full"
          >
            <VStack alignItems="start" spacing={2} w="full">
              <Select
                name="manufacturingPolicy"
                label="Manufacturing Policy"
                options={partManufacturingPolicyOptions}
              />
              <Select
                name="routingId"
                label="Routing ID"
                options={[{ label: "", value: "" }]}
              />
            </VStack>
            <VStack alignItems="start" spacing={2} w="full">
              <Number name="manufacturingLeadTime" label="Lead Time (Days)" />
              <Number name="scrapPercentage" label="Scrap Percentage" />
              <Number name="lotSize" label="Lot Size" />
            </VStack>
            <VStack alignItems="start" spacing={2} w="full">
              <Boolean
                name="manufacturingBlocked"
                label="Manufacturing Blocked"
              />
              <Boolean
                name="requiresConfiguration"
                label="Requires Configuration"
              />
            </VStack>
          </Grid>
        </CardBody>
        <CardFooter>
          <Submit isDisabled={!permissions.can("update", "parts")}>Save</Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default PartManufacturingForm;
