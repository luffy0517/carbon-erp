import { usePermissions } from "~/hooks";
import type { Role } from "~/types";

type Props = {
  contacts: number;
  locations: number;
};

export function useSupplierSidebar({ contacts, locations }: Props) {
  const permissions = usePermissions();
  return [
    {
      name: "Overview",
      to: "",
    },
    {
      name: "Contacts",
      to: "contacts",
      role: ["employee"],
      count: contacts,
    },
    {
      name: "Locations",
      to: "locations",
      role: ["employee", "supplier"],
      count: locations,
    },
    {
      name: "Payments",
      to: "payments",
      role: ["employee"],
    },
    {
      name: "Shipping",
      to: "shipping",
      role: ["employee"],
    },
  ].filter(
    (item) =>
      item.role === undefined ||
      item.role.some((role) => permissions.is(role as Role))
  );
}
