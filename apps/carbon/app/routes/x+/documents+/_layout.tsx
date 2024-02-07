import { VStack } from "@carbon/react";
import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { ContentSidebar } from "~/components/Layout/Navigation";
import { useDocumentsSubmodules } from "~/modules/documents";
import type { Handle } from "~/utils/handle";
import { path } from "~/utils/path";

export const meta: MetaFunction = () => {
  return [{ title: "Carbon | Documents" }];
};

export const handle: Handle = {
  breadcrumb: "Documents",
  to: path.to.documents,
  module: "documents",
};

export default function DocumentsRoute() {
  const { links } = useDocumentsSubmodules();

  return (
    <div className="grid grid-cols-[auto_1fr] w-full h-full">
      <ContentSidebar links={links} />
      <VStack spacing={0} className="h-full">
        <Outlet />
      </VStack>
    </div>
  );
}
