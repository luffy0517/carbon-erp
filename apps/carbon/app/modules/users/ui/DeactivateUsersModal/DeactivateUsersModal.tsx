import { HStack } from "@carbon/react";
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from "@chakra-ui/react";
import { ValidatedForm } from "remix-validated-form";
import { UserSelect } from "~/components/Selectors";
import { deactivateUsersValidator } from "~/modules/users";
import { path } from "~/utils/path";

type DeactivateUsersModalProps = {
  userIds: string[];
  isOpen: boolean;
  redirectTo?: string;
  onClose: () => void;
};

const DeactivateUsersModal = ({
  userIds,
  isOpen,
  redirectTo = path.to.employeeAccounts,
  onClose,
}: DeactivateUsersModalProps) => {
  const isSingleUser = userIds.length === 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isSingleUser ? "Deactivate Employee" : "Deactivate Employees"}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <p className="mb-2">
            Are you sure you want to deactive
            {isSingleUser ? " this user" : " these users"}?
          </p>
          <UserSelect value={userIds} readOnly isMulti />
        </ModalBody>
        <ModalFooter>
          <HStack>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <ValidatedForm
              method="post"
              action={path.to.deactivateUsers}
              validator={deactivateUsersValidator}
              onSubmit={onClose}
            >
              {userIds.map((id, index) => (
                <input
                  key={id}
                  type="hidden"
                  name={`users[${index}]`}
                  value={id}
                />
              ))}
              <input type="hidden" name="redirectTo" value={redirectTo} />
              <Button colorScheme="red" type="submit">
                Deactivate
              </Button>
            </ValidatedForm>
          </HStack>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DeactivateUsersModal;
