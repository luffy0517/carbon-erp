import { useColor } from "@carbon/react";
import { Button, GridItem, HStack } from "@chakra-ui/react";
import { BiHelpCircle } from "react-icons/bi";
import { BsChatSquare } from "react-icons/bs";
import { SearchButton } from "~/components/Search";
import AvatarMenu from "./AvatarMenu";
import Breadcrumbs from "./Breadcrumbs";
import useBreadcrumbs from "./useBreadcrumbs";

const Topbar = () => {
  const breadcrumbLinks = useBreadcrumbs();
  const borderColor = useColor("gray.200");

  return (
    <GridItem
      display="grid"
      gap={4}
      gridTemplateColumns="1fr auto 1fr"
      // backdropFilter="auto"
      // backdropBlur="8px"
      bg={useColor("white")}
      borderBottom={1}
      borderBottomColor={borderColor}
      borderBottomStyle="solid"
      position="sticky"
      px={4}
      top={0}
      zIndex={1}
    >
      <Breadcrumbs links={breadcrumbLinks} />
      <SearchButton />
      <HStack py={2} justifyContent="end">
        <Button
          colorScheme="gray"
          leftIcon={<BiHelpCircle />}
          variant="solid"
          border={1}
          borderColor={borderColor}
          borderStyle="solid"
        >
          Help
        </Button>
        <Button
          colorScheme="gray"
          leftIcon={<BsChatSquare />}
          variant="solid"
          border={1}
          borderColor={borderColor}
          borderStyle="solid"
        >
          Feedback
        </Button>
        <AvatarMenu />
      </HStack>
    </GridItem>
  );
};

export default Topbar;
