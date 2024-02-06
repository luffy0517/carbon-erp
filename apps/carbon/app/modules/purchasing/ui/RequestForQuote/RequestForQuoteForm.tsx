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
import { ValidatedForm } from "remix-validated-form";
import {
  DatePicker,
  Hidden,
  Input,
  Location,
  Select,
  Submit,
  TextArea,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import {
  requestForQuoteStatusType,
  requestForQuoteValidator,
} from "~/modules/purchasing";
import type { TypeOfValidator } from "~/types/validators";

type RequestForQuoteFormValues = TypeOfValidator<
  typeof requestForQuoteValidator
>;

type RequestForQuoteFormProps = {
  initialValues: RequestForQuoteFormValues;
};

const RequestForQuoteForm = ({ initialValues }: RequestForQuoteFormProps) => {
  const permissions = usePermissions();

  const isEditing = initialValues.id !== undefined;
  const isSupplier = permissions.is("supplier");

  const statusOptions = requestForQuoteStatusType.map((status) => ({
    label: status,
    value: status,
  }));

  return (
    <ValidatedForm
      method="post"
      validator={requestForQuoteValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>
            {isEditing ? "Request for Quote" : "New Request for Quote"}
          </CardTitle>
          {!isEditing && (
            <CardDescription>
              A request for quote is a document that asks suppliers to provide
              price quotes for the purchase of goods or services.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Hidden name="requestForQuoteId" />
          <VStack>
            <div
              className={cn(
                "grid w-full gap-x-8 gap-y-2",
                isEditing ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              )}
            >
              <VStack>
                <Input name="description" label="Description" />
                <DatePicker name="receiptDate" label="Receipt Date" />
                <DatePicker name="expirationDate" label="Expiration Date" />
              </VStack>
              <VStack>
                <Location name="locationId" label="Location" />
                {isEditing && (
                  <>
                    <Select
                      name="status"
                      label="Status"
                      value={initialValues.status}
                      options={statusOptions}
                      isReadOnly={
                        isSupplier || !permissions.can("delete", "purchasing")
                      }
                    />

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

export default RequestForQuoteForm;
