import { HStack, VStack } from "@carbon/react";
import {
  FormControl,
  FormLabel,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { useFetcher, useNavigate } from "@remix-run/react";
import { useRef, useState } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Customer, CustomerContact, Submit } from "~/components/Form";
import { useUrlParams } from "~/hooks";
import { createCustomerAccountValidator } from "~/modules/users";
import type { Result } from "~/types";
import { path } from "~/utils/path";

const CreateCustomerModal = () => {
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const formFetcher = useFetcher<Result>();
  const [customer, setCustomer] = useState<string | undefined>(
    (params.get("customer") as string) ?? undefined
  );
  const [contact, setContact] = useState<
    | {
        email: string;
        firstName: string;
        lastName: string;
      }
    | undefined
  >();

  return (
    <Modal
      initialFocusRef={initialFocusRef}
      isOpen={true}
      onClose={() => navigate(-1)}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create an account</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <ValidatedForm
            method="post"
            action={`${path.to.newCustomerAccount}${
              params.get("customer")
                ? `?customer=${params.get("customer")}`
                : ""
            }`}
            validator={createCustomerAccountValidator}
            defaultValues={{
              id: params.get("id") ?? "",
              customer: params.get("customer") ?? "",
            }}
            // @ts-ignore
            fetcher={formFetcher}
          >
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
                label="Customer Contact"
                customer={customer}
                onChange={(newValue) => {
                  // @ts-ignore
                  setContact(newValue?.contact);
                }}
              />
              {contact && (
                <>
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input
                      isReadOnly
                      value={contact?.email ?? ""}
                      variant="filled"
                    />
                  </FormControl>
                  <Grid templateColumns="1fr 1fr" gap={4}>
                    <FormControl>
                      <FormLabel>First Name</FormLabel>
                      <Input
                        isReadOnly
                        value={contact?.firstName ?? ""}
                        variant="filled"
                      />
                    </FormControl>
                    <FormControl>
                      <FormLabel>Last Name</FormLabel>
                      <Input
                        isReadOnly
                        value={contact?.lastName ?? ""}
                        variant="filled"
                      />
                    </FormControl>
                  </Grid>
                </>
              )}

              <HStack>
                <Submit>Create User</Submit>
              </HStack>
            </VStack>
          </ValidatedForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateCustomerModal;
