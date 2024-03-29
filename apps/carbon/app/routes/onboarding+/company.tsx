import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  VStack,
} from "@carbon/react";
import { getLocalTimeZone } from "@internationalized/date";
import { json, redirect, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { ValidatedForm, validationError } from "remix-validated-form";
import { Hidden, Input, Submit } from "~/components/Form";
import { useOnboarding } from "~/hooks";
import {
  getLocationsList,
  insertEmployeeJob,
  upsertLocation,
} from "~/modules/resources";
import {
  getCompany,
  insertCompany,
  onboardingCompanyValidator,
  updateCompany,
} from "~/modules/settings";
import { requirePermissions } from "~/services/auth";
import { assertIsPost } from "~/utils/http";

export async function loader({ request }: ActionFunctionArgs) {
  const { client } = await requirePermissions(request, {
    update: "settings",
  });

  const company = await getCompany(client);
  if (company.error || !company.data) {
    return json({
      company: null,
    });
  }

  return { company: company.data };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "settings",
  });

  const validation = await onboardingCompanyValidator.validate(
    await request.formData()
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { next, ...data } = validation.data;

  const [company, locations] = await Promise.all([
    getCompany(client),
    getLocationsList(client),
  ]);

  const location = locations?.data?.[0];

  if (company.data && location) {
    const [companyUpdate, locationUpdate] = await Promise.all([
      updateCompany(client, { ...data, updatedBy: userId }),
      upsertLocation(client, {
        ...location,
        ...data,
        timezone: getLocalTimeZone(),
        updatedBy: userId,
      }),
    ]);
    if (companyUpdate.error) {
      console.error(companyUpdate.error);
      throw new Error("Fatal: failed to update company");
    }
    if (locationUpdate.error) {
      console.error(locationUpdate.error);
      throw new Error("Fatal: failed to update location");
    }
  } else {
    const [companyInsert, locationInsert] = await Promise.all([
      insertCompany(client, data),
      upsertLocation(client, {
        ...data,
        name: "Headquarters",
        timezone: getLocalTimeZone(),
        createdBy: userId,
      }),
    ]);
    if (companyInsert.error) {
      console.error(companyInsert.error);
      throw new Error("Fatal: failed to insert company");
    }
    if (locationInsert.error) {
      console.error(locationInsert.error);
      throw new Error("Fatal: failed to insert location");
    }

    const locationId = locationInsert.data?.id;
    if (!locationId) {
      throw new Error("Fatal: failed to get location ID");
    }

    await insertEmployeeJob(client, {
      id: userId,
      locationId,
    });
  }

  return redirect(next);
}

export default function OnboardingUser() {
  const { company } = useLoaderData<typeof loader>();
  const { next, previous, onPrevious } = useOnboarding();

  const initialValues = {
    name: company?.name ?? "",
    addressLine1: company?.addressLine1 ?? "",
    city: company?.city ?? "",
    state: company?.state ?? "",
    postalCode: company?.postalCode ?? "",
  };

  return (
    <Modal open>
      <ModalContent>
        <ValidatedForm
          validator={onboardingCompanyValidator}
          defaultValues={initialValues}
          method="post"
        >
          <ModalHeader>
            <ModalTitle>Now let's setup your company</ModalTitle>
            <ModalDescription>
              You can always change this later
            </ModalDescription>
          </ModalHeader>
          <ModalBody>
            <Hidden name="next" value={next} />
            <VStack spacing={4}>
              <Input name="name" label="Company Name" />
              <Input name="addressLine1" label="Address" />
              <Input name="city" label="City" />
              <Input name="state" label="State" />
              <Input name="postalCode" label="Zip Code" />
            </VStack>
          </ModalBody>

          <ModalFooter>
            <HStack>
              <Button
                variant="solid"
                isDisabled={!previous}
                size="md"
                onClick={() => {
                  onPrevious?.();
                }}
                tabIndex={-1}
              >
                Previous
              </Button>
              <Submit>Next</Submit>
            </HStack>
          </ModalFooter>
        </ValidatedForm>
      </ModalContent>
    </Modal>
  );
}
