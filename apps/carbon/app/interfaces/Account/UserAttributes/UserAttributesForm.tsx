import { useColor } from "@carbon/react";
import {
  Box,
  Button,
  Grid,
  HStack,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { parseDate } from "@internationalized/date";
import { useFetcher } from "@remix-run/react";
import { useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import {
  Boolean as BooleanInput,
  DatePicker,
  Input,
  Hidden,
  Number as NumberInput,
  Submit,
  User,
  Select,
} from "~/components/Form";
import { SectionTitle } from "~/components/Layout";
import { UserSelect } from "~/components/Selectors";
import { useUser } from "~/hooks";
import type { PublicAttributes } from "~/interfaces/Account/types";
import { DataType } from "~/interfaces/Users/types";
import {
  attributeBooleanValidator,
  attributeNumericValidator,
  attributeTextValidator,
  attributeUserValidator,
  deleteUserAttributeValueValidator,
} from "~/services/account";

type UserAttributesFormProps = {
  attributeCategory?: PublicAttributes;
};

const UserAttributesForm = ({ attributeCategory }: UserAttributesFormProps) => {
  const user = useUser();
  const updateFetcher = useFetcher<{}>();
  const [optimisticUpdates, setOptimisticUpdates] = useState<
    Record<string, boolean | string | number>
  >({});

  if (
    !attributeCategory ||
    !attributeCategory.userAttribute ||
    !Array.isArray(attributeCategory.userAttribute) ||
    attributeCategory.userAttribute.length === 0
  )
    return null;

  return (
    <Box w="full">
      <SectionTitle title={attributeCategory.name} mt={8} />
      <VStack alignItems="start" my={4} w="full" spacing={4}>
        {attributeCategory.userAttribute.map((attribute) => {
          const genericProps = getGenericProps(
            attribute,
            optimisticUpdates[attribute.id]
          );

          return (
            <GenericAttributeRow
              key={attribute.id}
              attribute={attribute}
              setOptimisticUpdate={(value: boolean | string | number) =>
                setOptimisticUpdates((prev) => ({
                  ...prev,
                  [attribute.id]: value,
                }))
              }
              // @ts-ignore
              updateFetcher={updateFetcher}
              userId={user.id}
              {...genericProps}
            />
          );
        })}
      </VStack>
    </Box>
  );
};

type GenericAttributeRowProps = {
  attribute: {
    id: string | null;
    name: string | null;
    canSelfManage: boolean | null;
    listOptions: string[] | null;
  };
  displayValue: string | number | boolean;
  type: DataType;
  updateFetcher: ReturnType<typeof useFetcher>;
  userAttributeId: string;
  userAttributeValueId?: string;
  userId: string;
  value: Date | string | number | boolean | null;
  setOptimisticUpdate: (value: boolean | string | number) => void;
};

const GenericAttributeRow = (props: GenericAttributeRowProps) => {
  const editing = useDisclosure();
  const onSubmit = (value: string | boolean | number) => {
    props.setOptimisticUpdate(value);
    editing.onClose();
  };

  return (
    <Box key={props.attribute.id} w="full">
      {editing.isOpen
        ? TypedForm({ ...props, onSubmit, onClose: editing.onClose })
        : TypedDisplay({ ...props, onOpen: editing.onOpen })}
    </Box>
  );
};

function renderTypedForm({
  attribute,
  borderColor,
  type,
  value,
  updateFetcher,
  userAttributeId,
  userAttributeValueId,
  userId,
  onSubmit,
  onClose,
}: GenericAttributeRowProps & {
  borderColor: string;
  userId: string;
  onSubmit: (value: string | boolean | number) => void;
  onClose: () => void;
}) {
  switch (type) {
    case DataType.Boolean:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeBooleanValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value === true,
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="boolean" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <BooleanInput name="value" />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    case DataType.Date:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeTextValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value?.toString(),
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="date" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <DatePicker name="value" />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    case DataType.List:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeTextValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value?.toString(),
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="list" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <Select
                name="value"
                options={
                  attribute.listOptions?.map((option) => ({
                    label: option,
                    value: option,
                  })) ?? []
                }
              />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    case DataType.Numeric:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeNumericValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value ? Number(value) : undefined,
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="numeric" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <NumberInput name="value" />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    case DataType.Text:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeTextValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value?.toString(),
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="text" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <Input name="value" />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    case DataType.User:
      return (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/attribute`}
          validator={attributeUserValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
            value: value?.toString(),
          }}
          fetcher={updateFetcher}
          onSubmit={(data) => onSubmit(data.value)}
        >
          <Grid
            gridTemplateColumns="1fr 2fr 1fr"
            borderTopColor={borderColor}
            borderTopStyle="solid"
            borderTopWidth={1}
            pt={3}
            w="full"
          >
            <Text color="gray.500" alignSelf="center">
              {attribute.name}
            </Text>
            <Box>
              <Hidden name="type" value="user" />
              <Hidden name="userAttributeId" />
              <Hidden name="userAttributeValueId" />
              <User name="value" />
            </Box>
            <HStack justifyContent="end" w="full" alignSelf="center">
              <Submit size="sm" type="submit">
                Save
              </Submit>
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </Grid>
        </ValidatedForm>
      );
    default:
      return (
        <Box bg="red.100" color="red.800" p={4} w="full">
          Unknown data type
        </Box>
      );
  }
}

function TypedForm(
  props: GenericAttributeRowProps & {
    onSubmit: (value: string | boolean | number) => void;
    onClose: () => void;
  }
) {
  const borderColor = useColor("gray.100");
  return renderTypedForm({ ...props, borderColor });
}

function renderTypedDisplay({
  borderColor,
  ...props
}: GenericAttributeRowProps & { borderColor: string; onOpen: () => void }) {
  const { attribute, displayValue, type, userAttributeValueId, value, onOpen } =
    props;
  switch (type) {
    case DataType.Boolean:
      return (
        <Grid
          gridTemplateColumns="1fr 2fr 1fr"
          borderTopColor={borderColor}
          borderTopStyle="solid"
          borderTopWidth={1}
          pt={3}
          w="full"
        >
          <Text color="gray.500" alignSelf="center">
            {attribute.name}
          </Text>
          {displayValue === "N/A" ? (
            <Text alignSelf="center">{displayValue}</Text>
          ) : (
            <Switch isReadOnly isChecked={displayValue === true} />
          )}
          <HStack justifyContent="end" w="full" alignSelf="center">
            <Button
              isDisabled={!attribute.canSelfManage ?? true}
              variant="ghost"
              onClick={onOpen}
            >
              Update
            </Button>
          </HStack>
        </Grid>
      );
    case DataType.Date:
    case DataType.List:
    case DataType.Text:
      return (
        <Grid
          gridTemplateColumns="1fr 2fr 1fr"
          borderTopColor={borderColor}
          borderTopStyle="solid"
          borderTopWidth={1}
          pt={3}
          w="full"
        >
          <Text color="gray.500" alignSelf="center">
            {attribute.name}
          </Text>
          <Text alignSelf="center">{displayValue}</Text>
          <UpdateRemoveButtons
            canRemove={
              attribute.canSelfManage === true &&
              !!value &&
              !!userAttributeValueId
            }
            canUpdate={attribute.canSelfManage ?? false}
            {...props}
          />
        </Grid>
      );
    case DataType.Numeric:
      return (
        <Grid
          gridTemplateColumns="1fr 2fr 1fr"
          borderTopColor={borderColor}
          borderTopStyle="solid"
          borderTopWidth={1}
          pt={3}
          w="full"
        >
          <Text color="gray.500" alignSelf="center">
            {attribute.name}
          </Text>
          <Text alignSelf="center">{displayValue.toLocaleString("en-US")}</Text>
          <UpdateRemoveButtons
            canRemove={attribute.canSelfManage === true && !!value}
            canUpdate={attribute.canSelfManage ?? false}
            {...props}
          />
        </Grid>
      );
    case DataType.User:
      return (
        <Grid
          gridTemplateColumns="1fr 2fr 1fr"
          borderTopColor={borderColor}
          borderTopStyle="solid"
          borderTopWidth={1}
          pt={3}
          w="full"
        >
          <Text color="gray.500" alignSelf="center">
            {attribute.name}
          </Text>
          {value ? (
            <UserSelect disabled value={value.toString()} />
          ) : (
            <Text alignSelf="center">{displayValue}</Text>
          )}

          <UpdateRemoveButtons
            canRemove={attribute.canSelfManage === true && !!value}
            canUpdate={attribute.canSelfManage ?? false}
            {...props}
          />
        </Grid>
      );
  }
}

function TypedDisplay(
  props: GenericAttributeRowProps & {
    onOpen: () => void;
  }
) {
  const borderColor = useColor("gray.100");
  return renderTypedDisplay({ ...props, borderColor });
}

function getGenericProps(
  attribute: NonNullable<PublicAttributes["userAttribute"]>,
  optimisticUpdate: string | boolean | number | undefined
) {
  if (
    !("attributeDataType" in attribute) ||
    !attribute.attributeDataType ||
    Array.isArray(attribute.attributeDataType)
  )
    throw new Error("Missing attributeDataType");

  const type = attribute.attributeDataType.id;
  const userAttributeId = attribute.id;
  let userAttributeValueId = undefined;

  let displayValue: string | number | boolean = "N/A";
  let value: string | number | boolean | Date | null = null;

  if (
    attribute.userAttributeValue &&
    Array.isArray(attribute.userAttributeValue) &&
    attribute.userAttributeValue.length === 1
  ) {
    const userAttributeValue = attribute.userAttributeValue[0];
    userAttributeValueId = userAttributeValue.id;

    switch (type) {
      case DataType.Boolean:
        value = userAttributeValue.valueBoolean;
        displayValue = userAttributeValue.valueBoolean ?? false;
        break;
      case DataType.Date:
        value = userAttributeValue.valueDate;
        if (userAttributeValue.valueDate)
          displayValue = parseDate(userAttributeValue.valueDate).toString();
        break;
      case DataType.List:
        value = userAttributeValue.valueText;
        if (userAttributeValue.valueText)
          displayValue = userAttributeValue.valueText;
        break;
      case DataType.Numeric:
        value = userAttributeValue.valueNumeric;
        if (userAttributeValue.valueNumeric)
          displayValue = Number(userAttributeValue.valueNumeric);
        break;
      case DataType.Text:
        value = userAttributeValue.valueText;
        if (userAttributeValue.valueText)
          displayValue = userAttributeValue.valueText;
        break;
      case DataType.User:
        value = userAttributeValue.valueUser;
        if (userAttributeValue.valueUser)
          displayValue = userAttributeValue.valueUser;
    }
  }

  if (optimisticUpdate !== undefined) {
    displayValue = optimisticUpdate;
    value = optimisticUpdate;
  }

  return {
    displayValue,
    type,
    userAttributeId,
    userAttributeValueId,
    value,
  };
}

function UpdateRemoveButtons({
  canRemove,
  canUpdate,
  updateFetcher,
  userId,
  userAttributeId,
  userAttributeValueId,
  onOpen,
}: {
  canRemove: boolean;
  canUpdate: boolean;
  updateFetcher: ReturnType<typeof useFetcher>;
  userId: string;
  userAttributeId: string;
  userAttributeValueId?: string;
  onOpen: () => void;
}) {
  return (
    <HStack justifyContent="end" w="full" alignSelf="center">
      {userAttributeValueId && (
        <ValidatedForm
          method="post"
          action={`/x/account/${userId}/delete/attribute`}
          validator={deleteUserAttributeValueValidator}
          defaultValues={{
            userAttributeId,
            userAttributeValueId,
          }}
          fetcher={updateFetcher}
        >
          <Hidden name="userAttributeId" />
          <Hidden name="userAttributeValueId" />
          <Button isDisabled={!canRemove} variant="ghost" type="submit">
            Remove
          </Button>
        </ValidatedForm>
      )}

      <Button isDisabled={!canUpdate} variant="ghost" onClick={onOpen}>
        Update
      </Button>
    </HStack>
  );
}

export default UserAttributesForm;
