import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  FormControl,
  FormLabel,
  HStack,
  VStack,
} from "@carbon/react";
import { useNavigate } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import {
  Boolean,
  Hidden,
  Input,
  Location,
  Submit,
  TimePicker,
} from "~/components/Form";
import { usePermissions } from "~/hooks";
import { shiftValidator } from "~/modules/resources";
import type { TypeOfValidator } from "~/types/validators";
import { path } from "~/utils/path";

type ShiftFormProps = {
  initialValues: TypeOfValidator<typeof shiftValidator>;
};

const ShiftForm = ({ initialValues }: ShiftFormProps) => {
  const permissions = usePermissions();
  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const isEditing = initialValues.id !== undefined;
  const isDisabled = isEditing
    ? !permissions.can("update", "resources")
    : !permissions.can("create", "resources");

  return (
    <Drawer
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DrawerContent>
        <ValidatedForm
          validator={shiftValidator}
          method="post"
          action={
            isEditing ? path.to.shift(initialValues.id!) : path.to.newShift
          }
          defaultValues={initialValues}
          className="flex flex-col h-full"
        >
          <DrawerHeader>
            <DrawerTitle>{isEditing ? "Edit" : "New"} Shift</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>
            <Hidden name="id" />
            <VStack spacing={4}>
              <Input name="name" label="Shift Name" />
              <Location name="locationId" label="Location" />
              <TimePicker name="startTime" label="Start Time" />
              <TimePicker name="endTime" label="End Time" />

              <FormControl>
                <FormLabel>Days</FormLabel>
                <VStack>
                  <Boolean name="monday" description="Monday" />
                  <Boolean name="tuesday" description="Tuesday" />
                  <Boolean name="wednesday" description="Wednesday" />
                  <Boolean name="thursday" description="Thursday" />
                  <Boolean name="friday" description="Friday" />
                  <Boolean name="saturday" description="Saturday" />
                  <Boolean name="sunday" description="Sunday" />
                </VStack>
              </FormControl>
            </VStack>
          </DrawerBody>
          <DrawerFooter>
            <HStack>
              <Submit isDisabled={isDisabled}>Save</Submit>
              <Button size="md" variant="solid" onClick={onClose}>
                Cancel
              </Button>
            </HStack>
          </DrawerFooter>
        </ValidatedForm>
      </DrawerContent>
    </Drawer>
  );
};

export default ShiftForm;
