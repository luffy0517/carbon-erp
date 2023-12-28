import { VStack } from "@carbon/react";
import { Grid } from "@chakra-ui/react";
import { useParams } from "@remix-run/react";
import { ValidatedForm } from "remix-validated-form";
import { Hidden, Input, Submit, TextArea } from "~/components/Form";
import { SectionTitle } from "~/components/Layout";
import { accountProfileValidator } from "~/modules/account";
import type { User } from "~/modules/users";
import { path } from "~/utils/path";

type ProfileFormProps = {
  user: User;
};

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { personId } = useParams();
  const isSelf = !personId;

  return (
    <div className="w-full">
      <SectionTitle>Basic Information</SectionTitle>
      <ValidatedForm
        method="post"
        action={isSelf ? path.to.profile : path.to.person(personId)}
        validator={accountProfileValidator}
        defaultValues={user}
      >
        <VStack spacing={4} className="my-4">
          <Grid gridTemplateColumns="1fr 1fr" gridColumnGap={4} w="full">
            <Input name="firstName" label="First Name" />
            <Input name="lastName" label="Last Name" />
          </Grid>
          <TextArea name="about" label="About" characterLimit={160} my={2} />
          <Hidden name="intent" value="about" />
          <Submit>Save</Submit>
        </VStack>
      </ValidatedForm>
    </div>
  );
};

export default ProfileForm;
