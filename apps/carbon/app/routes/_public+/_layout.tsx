import { VStack } from "@carbon/react";
import { Outlet } from "@remix-run/react";
import { Background } from "~/components/Layout";

export default function PublicRoute() {
  return (
    <div className="flex min-h-screen min-w-screen">
      <VStack
        spacing={8}
        className="items-center mx-auto max-w-lg pt-24 px-6 z-[3]"
      >
        <Outlet />
      </VStack>
      <Background />
    </div>
  );
}
