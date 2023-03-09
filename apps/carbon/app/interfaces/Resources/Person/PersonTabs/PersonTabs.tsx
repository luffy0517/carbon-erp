import {
  Card,
  CardBody,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
  Box,
  Icon,
} from "@chakra-ui/react";
import { BiLockAlt } from "react-icons/bi";
import { SectionTitle } from "~/components/Layout";
import { ProfileForm } from "~/interfaces/Account/Profile";
import type {
  PublicAttributes,
  PrivateAttributes,
} from "~/interfaces/Account/types";
import { UserAttributesForm } from "~/interfaces/Account/UserAttributes";
import type { User } from "~/interfaces/Users/types";
import { PersonJob, PersonNotes } from "~/interfaces/Resources/Person";
import type { EmployeeJob, Note } from "~/interfaces/Resources/types";

type PersonTabsProps = {
  user: User;
  job: EmployeeJob;
  publicAttributes: PublicAttributes[];
  privateAttributes: PrivateAttributes[];
  notes: Note[];
};

const PersonsTabs = ({
  user,
  job,
  publicAttributes,
  privateAttributes,
  notes,
}: PersonTabsProps) => {
  return (
    <Card w="full">
      <CardBody>
        <Tabs colorScheme="gray">
          <TabList>
            <Tab>Profile</Tab>
            <Tab>Job</Tab>
            <Tab>Public</Tab>
            <Tab>
              <Icon as={BiLockAlt} h={4} w={4} mr={2} /> Private
            </Tab>
            <Tab>
              <Icon as={BiLockAlt} h={4} w={4} mr={2} /> Notes
            </Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <ProfileForm user={user} />
            </TabPanel>
            <TabPanel>
              <PersonJob job={job} />
            </TabPanel>
            <TabPanel>
              {publicAttributes.length ? (
                publicAttributes.map((category: PublicAttributes) => (
                  <Box key={category.id} mb={8} w="full">
                    <SectionTitle title={category.name} />
                    <UserAttributesForm attributeCategory={category} />
                  </Box>
                ))
              ) : (
                <Box color="gray.500" p={4} w="full" textAlign="center">
                  No public attributes
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              {privateAttributes.length ? (
                privateAttributes.map((category: PrivateAttributes) => (
                  <Box key={category.id} mb={8} w="full">
                    <SectionTitle title={category.name} />
                    <UserAttributesForm attributeCategory={category} />
                  </Box>
                ))
              ) : (
                <Box color="gray.500" p={4} w="full" textAlign="center">
                  No private attributes
                </Box>
              )}
            </TabPanel>
            <TabPanel>
              <PersonNotes notes={notes} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  );
};

export default PersonsTabs;
