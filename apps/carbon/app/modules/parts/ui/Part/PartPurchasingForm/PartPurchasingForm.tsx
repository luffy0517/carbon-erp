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
import {
  Boolean,
  Hidden,
  Number,
  Select,
  Submit,
  Supplier,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import type { UnitOfMeasureListItem } from "~/modules/parts";
import { partPurchasingValidator } from "~/modules/parts";
import type { TypeOfValidator } from "~/types/validators";

type PartPurchasingFormProps = {
  initialValues: TypeOfValidator<typeof partPurchasingValidator>;
  unitOfMeasures: UnitOfMeasureListItem[];
};

const PartPurchasingForm = ({
  initialValues,
  unitOfMeasures,
}: PartPurchasingFormProps) => {
  const permissions = usePermissions();

  const unitOfMeasureOptions = unitOfMeasures.map((unitOfMeasure) => ({
    label: unitOfMeasure.name,
    value: unitOfMeasure.code,
  }));

  return (
    <ValidatedForm
      method="post"
      validator={partPurchasingValidator}
      defaultValues={initialValues}
    >
      <Card w="full">
        <CardHeader>
          <Heading size="h3">Purchasing</Heading>
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
              <Supplier name="preferredSupplierId" label="Preferred Supplier" />
              <Number name="purchasingLeadTime" label="Lead Time (Days)" />
            </VStack>
            <VStack alignItems="start" spacing={2} w="full">
              <Select
                name="purchasingUnitOfMeasureCode"
                label="Purchasing Unit of Measure"
                options={unitOfMeasureOptions}
              />
              <Number
                name="conversionFactor"
                label="Conversion Factor"
                min={0}
              />
            </VStack>
            <VStack alignItems="start" spacing={2} w="full">
              <Boolean name="purchasingBlocked" label="Purchasing Blocked" />
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

export default PartPurchasingForm;
