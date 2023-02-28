import { useColor } from "@carbon/react";
import { formatTimeAgo } from "@carbon/utils";
import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Form, useParams } from "@remix-run/react";
import { Fragment } from "react";
import { ValidatedForm } from "remix-validated-form";
import { Avatar } from "~/components";
import { Submit, TextArea } from "~/components/Form";
import { SectionTitle } from "~/components/Layout";
import { usePermissions, useUser } from "~/hooks";
import type { Note } from "~/interfaces/Resources/types";
import { noteValidator } from "~/services/resources";

type PersonNoteProps = {
  notes: Note[];
};

const PersonNotes = ({ notes }: PersonNoteProps) => {
  const user = useUser();
  const permissions = usePermissions();

  const { personId } = useParams();
  if (!personId) throw new Error("Missing personId");

  const canCreate = permissions.can("create", "resources");
  const canUpdate = permissions.can("update", "resources");
  const canDelete = permissions.can("delete", "resources");

  const borderColor = useColor("gray.200");

  return (
    <Box w="full">
      <SectionTitle title="Notes" />
      {notes.length > 0 ? (
        <Grid
          gridTemplateColumns="auto 1fr"
          gridColumnGap={4}
          gridRowGap={8}
          w="full"
        >
          {notes.map((note) => {
            if (Array.isArray(note.user)) throw new Error("Invalid user");
            return (
              <Fragment key={note.id}>
                <Avatar path={user.avatarUrl} />
                <VStack spacing={1} w="full" alignItems="start">
                  <Text fontWeight="bold">{note.user?.fullName}</Text>
                  <Text>{note.note}</Text>
                  <HStack spacing={4}>
                    <Text color="gray.500">
                      {formatTimeAgo(note.createdAt)}
                    </Text>
                    {(canDelete || canUpdate) && user.id === note.user?.id && (
                      <Form
                        method="post"
                        action={`/x/resources/person/${personId}/notes/delete/${note.id}`}
                      >
                        <Button
                          type="submit"
                          variant="link"
                          fontWeight="normal"
                          size="md"
                        >
                          Delete
                        </Button>
                      </Form>
                    )}
                  </HStack>
                </VStack>
              </Fragment>
            );
          })}
        </Grid>
      ) : (
        <Box color="gray.500" p={4} w="full" textAlign="center">
          No notes
        </Box>
      )}
      {canCreate && (
        <Box
          borderTopColor={borderColor}
          borderTopStyle="solid"
          borderTopWidth={1}
          mt={8}
          pt={8}
          w="full"
        >
          <ValidatedForm
            method="post"
            action={`/x/resources/person/${personId}/notes/new`}
            resetAfterSubmit
            validator={noteValidator}
          >
            <VStack spacing={3} w="full">
              <Grid gridTemplateColumns="auto 1fr" gridColumnGap={4} w="full">
                <Avatar path={user.avatarUrl} />
                <TextArea name="note" />
              </Grid>
              <Flex justifyContent="flex-end" w="full">
                <Submit>Comment</Submit>
              </Flex>
            </VStack>
          </ValidatedForm>
        </Box>
      )}
    </Box>
  );
};

export default PersonNotes;
