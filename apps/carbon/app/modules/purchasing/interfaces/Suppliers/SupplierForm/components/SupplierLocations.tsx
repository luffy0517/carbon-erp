import {
  Button,
  Heading,
  HStack,
  IconButton,
  List,
  ListItem,
  Text,
  VStack,
  useDisclosure,
} from "@chakra-ui/react";
import { useParams } from "@remix-run/react";
import { useState } from "react";
import { IoMdAdd } from "react-icons/io";
import { Address } from "~/components";
import { ConfirmDelete } from "~/components/Modals";
import { usePermissions } from "~/hooks";
import type { SupplierLocation } from "~/modules/purchasing";
import SupplierLocationForm from "./SupplierLocationForm";

type SupplierLocationProps = {
  locations?: SupplierLocation[];
  isEditing?: boolean;
};

const SupplierLocations = ({
  locations = [],
  isEditing = false,
}: SupplierLocationProps) => {
  const permissions = usePermissions();
  const locationDrawer = useDisclosure();
  const deleteContactModal = useDisclosure();

  const { supplierId } = useParams();

  const [location, setLocation] = useState<SupplierLocation | undefined>(
    undefined
  );

  const isEmpty = locations === undefined || locations?.length === 0;

  return (
    <>
      <VStack alignItems="start" w="full" spacing={4} mb={4}>
        <HStack w="full" justifyContent="space-between">
          <Heading size="md">Locations</Heading>
          {permissions.can("create", "purchasing") && (
            <IconButton
              icon={<IoMdAdd />}
              aria-label="Add location"
              variant="outline"
              onClick={() => {
                setLocation(undefined);
                locationDrawer.onOpen();
              }}
            />
          )}
        </HStack>
        {isEmpty && (
          <Text color="gray.500" fontSize="sm">
            You haven’t created any locations yet.
          </Text>
        )}
        {!isEmpty && (
          <List w="full" spacing={4}>
            {locations?.map((location) => (
              <ListItem key={location.id}>
                {location.address && !Array.isArray(location.address) ? (
                  <Address
                    address={location.address}
                    onDelete={
                      permissions.can("delete", "purchasing")
                        ? () => {
                            setLocation(location);
                            deleteContactModal.onOpen();
                          }
                        : undefined
                    }
                    onEdit={
                      permissions.can("update", "purchasing")
                        ? () => {
                            setLocation(location);
                            locationDrawer.onOpen();
                          }
                        : undefined
                    }
                  />
                ) : null}
              </ListItem>
            ))}
          </List>
        )}
        {isEmpty && permissions.can("create", "purchasing") && (
          <Button
            leftIcon={<IoMdAdd />}
            colorScheme="brand"
            onClick={() => {
              setLocation(undefined);
              locationDrawer.onOpen();
            }}
            isDisabled={!isEditing}
          >
            New Location
          </Button>
        )}
      </VStack>
      {locationDrawer.isOpen && (
        <SupplierLocationForm
          onClose={locationDrawer.onClose}
          location={location}
        />
      )}
      {deleteContactModal.isOpen && (
        <ConfirmDelete
          action={`/x/purchasing/suppliers/${supplierId}/location/delete/${location?.id}`}
          // @ts-ignore
          name={location?.address?.city ?? ""}
          text="Are you sure you want to delete this location?"
          onCancel={deleteContactModal.onClose}
          onSubmit={deleteContactModal.onClose}
        />
      )}
    </>
  );
};

export default SupplierLocations;
