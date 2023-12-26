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
import { Submit, Supplier, SupplierContact } from "~/components/Form";
import { useUrlParams } from "~/hooks";
import { createSupplierAccountValidator } from "~/modules/users";
import type { Result } from "~/types";
import { path } from "~/utils/path";

const CreateSupplierModal = () => {
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  const formFetcher = useFetcher<Result>();
  const [supplier, setSupplier] = useState<string | undefined>(
    (params.get("supplier") as string) ?? undefined
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
            action={`${path.to.newSupplierAccount}${
              params.get("supplier")
                ? `?supplier=${params.get("supplier")}`
                : ""
            }`}
            validator={createSupplierAccountValidator}
            defaultValues={{
              id: params.get("id") ?? "",
              supplier: params.get("supplier") ?? "",
            }}
            // @ts-ignore
            fetcher={formFetcher}
          >
            <VStack spacing={4}>
              <Supplier
                name="supplier"
                label="Supplier"
                onChange={(newValue) =>
                  setSupplier(newValue?.value as string | undefined)
                }
              />
              <SupplierContact
                name="id"
                label="Supplier Contact"
                supplier={supplier}
                onChange={setContact}
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

              <HStack spacing={4}>
                <Submit>Create User</Submit>
              </HStack>
            </VStack>
          </ValidatedForm>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default CreateSupplierModal;
