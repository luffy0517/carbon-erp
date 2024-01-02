import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalTitle,
  Select,
  VStack,
} from "@carbon/react";
import { Grid } from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ValidatedForm, useControlField, useField } from "remix-validated-form";
import { Customer, Submit } from "~/components/Form";
import { useUrlParams } from "~/hooks";
import type {
  CustomerContact as CustomerContactType,
  getCustomerContacts,
} from "~/modules/sales";
import { createCustomerAccountValidator } from "~/modules/users";
import type { Result } from "~/types";
import { path } from "~/utils/path";

const CreateCustomerModal = () => {
  const navigate = useNavigate();
  const [params] = useUrlParams();

  const formFetcher = useFetcher<Result>();
  const [customer, setCustomer] = useState<string | undefined>(
    (params.get("customer") as string) ?? undefined
  );
  const [contact, setContact] = useState<CustomerContactType["contact"] | null>(
    null
  );

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) navigate(path.to.customerAccounts);
      }}
    >
      <ModalOverlay />
      <ModalContent>
        <ValidatedForm
          method="post"
          action={`${path.to.newCustomerAccount}${
            params.get("customer") ? `?customer=${params.get("customer")}` : ""
          }`}
          validator={createCustomerAccountValidator}
          defaultValues={{
            id: params.get("id") ?? "",
            customer: params.get("customer") ?? "",
          }}
          // @ts-ignore
          fetcher={formFetcher}
          className="flex flex-col h-full"
        >
          <ModalHeader>
            <ModalTitle>Create an account</ModalTitle>
          </ModalHeader>

          <ModalBody>
            <VStack spacing={4}>
              <Customer
                name="customer"
                label="Customer"
                onChange={(newValue) =>
                  setCustomer(newValue?.value as string | undefined)
                }
              />
              <CustomerContact
                name="id"
                customer={customer}
                onChange={setContact}
              />
              {contact && (
                <>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input isReadOnly value={contact?.email ?? ""} />
                  </FormControl>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormControl>
                      <FormLabel>First Name</FormLabel>
                      <Input isReadOnly value={contact?.firstName ?? ""} />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Last Name</FormLabel>
                      <Input isReadOnly value={contact?.lastName ?? ""} />
                    </FormControl>
                  </Grid>
                </>
              )}
            </VStack>
            <ModalFooter>
              <HStack>
                <Submit>Create User</Submit>
              </HStack>
            </ModalFooter>
          </ModalBody>
        </ValidatedForm>
      </ModalContent>
    </Modal>
  );
};

const CustomerContact = ({
  name,
  customer,
  onChange,
}: {
  name: string;
  customer?: string;
  onChange?: (newValue: CustomerContactType["contact"] | null) => void;
}) => {
  const initialLoad = useRef(true);
  const { error, defaultValue } = useField(name);
  const [value, setValue] = useControlField<string | null>(name);

  const customerContactFetcher =
    useFetcher<Awaited<ReturnType<typeof getCustomerContacts>>>();

  useEffect(() => {
    if (customer) {
      customerContactFetcher.load(path.to.api.customerContacts(customer));
    }

    if (initialLoad.current) {
      initialLoad.current = false;
    } else {
      setValue(null);
      if (onChange) {
        onChange(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer]);

  const options = useMemo(
    () =>
      customerContactFetcher.data?.data
        ? customerContactFetcher.data?.data.map((c) => ({
            value: c.id,
            // @ts-ignore
            label: `${c.contact?.firstName} ${c.contact?.lastName}`,
          }))
        : [],
    [customerContactFetcher.data]
  );

  const handleChange = (
    selection: {
      value: string | number;
      label: string;
    } | null
  ) => {
    const newValue = selection === null ? null : (selection.value as string);
    setValue(newValue);
    if (onChange && typeof onChange === "function") {
      if (newValue === null) onChange(newValue);
      const contact = customerContactFetcher.data?.data?.find(
        (c) => c.id === newValue
      );

      onChange(contact?.contact ?? null);
    }
  };

  const controlledValue = useMemo(
    // @ts-ignore
    () => options.find((option) => option.value === value),
    [value, options]
  );

  // so that we can call onChange on load
  useEffect(() => {
    if (controlledValue && controlledValue.value === defaultValue) {
      handleChange(controlledValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [controlledValue?.value]);

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={name}>Customer Contact</FormLabel>
      <input type="hidden" name={name} id={name} value={value ?? ""} />
      <Select
        id={name}
        value={controlledValue}
        options={options}
        onChange={handleChange}
        isClearable
        w="full"
      />
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export default CreateCustomerModal;
