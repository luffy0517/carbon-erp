import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  VStack,
} from "@carbon/react";
import { Grid } from "@chakra-ui/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  Boolean,
  Combobox,
  Input,
  InputControlled,
  Select,
  Submit,
  TextArea,
} from "~/components/Form";
import { usePermissions, useRouteData } from "~/hooks";
import { useSupabase } from "~/lib/supabase";
import { serviceType, serviceValidator } from "~/modules/parts";
import type { ListItem } from "~/types";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type ServiceFormProps = {
  initialValues: TypeOfValidator<typeof serviceValidator>;
};

const useNextServiceIdShortcut = () => {
  const { supabase } = useSupabase();
  const [loading, setLoading] = useState<boolean>(false);
  const [serviceId, setServiceId] = useState<string>("");

  const onServiceIdChange = async (newServiceId: string) => {
    if (newServiceId.endsWith("...") && supabase) {
      setLoading(true);

      const prefix = newServiceId.slice(0, -3);
      try {
        const { data } = await supabase
          ?.from("service")
          .select("id")
          .ilike("id", `${prefix}%`)
          .order("id", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (data?.id) {
          const sequence = data.id.slice(prefix.length);
          const currentSequence = parseInt(sequence);
          const nextSequence = currentSequence + 1;
          const nextId = `${prefix}${nextSequence
            .toString()
            .padStart(
              sequence.length -
                (data.id.split(`${currentSequence}`)?.[1].length ?? 0),
              "0"
            )}`;
          setServiceId(nextId);
        } else {
          setServiceId(`${prefix}${(1).toString().padStart(9, "0")}`);
        }
      } catch {
      } finally {
        setLoading(false);
      }
    } else {
      setServiceId(newServiceId);
    }
  };

  return { serviceId, onServiceIdChange, loading };
};

const ServiceForm = ({ initialValues }: ServiceFormProps) => {
  const { serviceId, onServiceIdChange, loading } = useNextServiceIdShortcut();
  const sharedData = useRouteData<{
    partGroups: ListItem[];
  }>(path.to.serviceRoot);

  const permissions = usePermissions();
  const isEditing = initialValues.id !== undefined;

  const partGroupOptions =
    sharedData?.partGroups.map((partGroup) => ({
      label: partGroup.name,
      value: partGroup.id,
    })) ?? [];

  const serviceTypeOptions =
    serviceType.map((type) => ({
      label: type,
      value: type,
    })) ?? [];

  return (
    <ValidatedForm
      method="post"
      validator={serviceValidator}
      defaultValues={initialValues}
    >
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Service Details" : "New Service"}</CardTitle>
          {!isEditing && (
            <CardDescription>
              A service is an intangible activity that can be purchased or sold.
              When a service is purchased, it is accounted for as overhead.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <Grid
            gridTemplateColumns={
              isEditing ? ["1fr", "1fr", "1fr 1fr 1fr"] : "1fr"
            }
            gridColumnGap={8}
            gridRowGap={2}
            w="full"
          >
            <VStack>
              {isEditing ? (
                <Input name="id" label="Service ID" isReadOnly />
              ) : (
                <InputControlled
                  name="id"
                  label="Service ID"
                  helperText="Use ... to get the next service ID"
                  value={serviceId}
                  onChange={onServiceIdChange}
                  isDisabled={loading}
                />
              )}
              <Input name="name" label="Name" />
              <TextArea name="description" label="Description" />
            </VStack>
            <VStack>
              <Select
                name="serviceType"
                label="Service Type"
                options={serviceTypeOptions}
              />
              <Combobox
                name="partGroupId"
                label="Part Group"
                options={partGroupOptions}
              />
            </VStack>
            <VStack>
              <Boolean name="blocked" label="Blocked" />
              {isEditing && <Boolean name="active" label="Active" />}
            </VStack>
          </Grid>
        </CardContent>
        <CardFooter>
          <Submit
            isDisabled={
              isEditing
                ? !permissions.can("update", "parts")
                : !permissions.can("create", "parts")
            }
          >
            Save
          </Submit>
        </CardFooter>
      </Card>
    </ValidatedForm>
  );
};

export default ServiceForm;
