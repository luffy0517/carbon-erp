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
import { ProfileForm, UserAttributesForm } from "~/modules/account";
import type { PublicAttributes, PrivateAttributes } from "~/modules/account";
import { PersonJob, PersonNotes } from "~/modules/resources";
import type { EmployeeJob, Note } from "~/modules/resources";
import type { User } from "~/modules/users";

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
