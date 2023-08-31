import {
  Button,
  HStack,
  Heading,
  IconButton,
  List,
  ListItem,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "@remix-run/react";
import { useCallback, useState } from "react";
import { IoMdAdd, IoMdTrash } from "react-icons/io";
import { Contact } from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import type { CustomerContact, CustomerLocation } from "~/modules/sales";
import { usePermissions } from "~/hooks";
import CustomerContactForm from "./CustomerContactsForm";
import { BsPencilSquare } from "react-icons/bs";

type CustomerContactProps = {
  contacts?: CustomerContact[];
  locations?: CustomerLocation[];
  isEditing?: boolean;
};

const CustomerContacts = ({
  contacts = [],
  locations = [],
  isEditing = false,
}: CustomerContactProps) => {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const permissions = usePermissions();

  const [contact, setContact] = useState<CustomerContact | undefined>(
    undefined
  );

  const contactDrawer = useDisclosure();
  const deleteContactModal = useDisclosure();

  const isEmpty = contacts === undefined || contacts?.length === 0;

  const getActions = useCallback(
    (contact: CustomerContact) => {
      const actions = [];
      if (permissions.can("update", "sales")) {
        actions.push({
          label: "Edit Contact",
          icon: <BsPencilSquare />,
          onClick: () => {
            setContact(contact);
            contactDrawer.onOpen();
          },
        });
      }
      if (permissions.can("delete", "sales")) {
        actions.push({
          label: "Delete Contact",
          icon: <IoMdTrash />,
          onClick: () => {
            setContact(contact);
            deleteContactModal.onOpen();
          },
        });
      }

      if (permissions.can("create", "users") && contact.user === null) {
        actions.push({
          label: "Create Account",
          icon: <IoMdAdd />,
          onClick: () => {
            navigate(
              `/x/users/customers/new?id=${contact.id}&customer=${customerId}`
            );
          },
        });
      }

      return actions;
    },
    [permissions, customerId, contactDrawer, deleteContactModal, navigate]
  );

  return (
    <>
      <VStack alignItems="start" w="full" spacing={4} mb={4}>
        <HStack w="full" justifyContent="space-between">
          <Heading size="md">Contacts</Heading>
          {permissions.can("create", "sales") && (
            <IconButton
              icon={<IoMdAdd />}
              aria-label="Add contact"
              variant="outline"
              onClick={() => {
                setContact(undefined);
                contactDrawer.onOpen();
              }}
            />
          )}
        </HStack>
        {isEmpty && (
          <Text color="gray.500" fontSize="sm">
            You haven’t created any contacts yet.
          </Text>
        )}
        {!isEmpty && (
          <List w="full" spacing={4}>
            {contacts?.map((contact) => (
              <ListItem key={contact.id}>
                {contact.contact &&
                !Array.isArray(contact.contact) &&
                !Array.isArray(contact.user) ? (
                  <Contact
                    contact={contact.contact}
                    user={contact.user}
                    actions={getActions(contact)}
                  />
                ) : null}
              </ListItem>
            ))}
          </List>
        )}
        {isEmpty && permissions.can("create", "sales") && (
          <Button
            leftIcon={<IoMdAdd />}
            colorScheme="brand"
            onClick={() => {
              setContact(undefined);
              contactDrawer.onOpen();
            }}
            isDisabled={!isEditing}
          >
            New Contact
          </Button>
        )}
      </VStack>
      {contactDrawer.isOpen && (
        <CustomerContactForm
          onClose={contactDrawer.onClose}
          contact={contact}
          locations={locations}
        />
      )}
      {deleteContactModal.isOpen && (
        <ConfirmDelete
          action={`/x/sales/customers/${customerId}/contact/delete/${contact?.id}`}
          // @ts-ignore
          name={`${contact?.contact.firstName} ${contact?.contact.lastName}`}
          text="Are you sure you want to delete this contact?"
          onCancel={deleteContactModal.onClose}
          onSubmit={deleteContactModal.onClose}
        />
      )}
    </>
  );
};

export default CustomerContacts;
