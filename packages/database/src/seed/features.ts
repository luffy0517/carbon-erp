import { v4 as uuidv4 } from "uuid";

const possibleFeatures = [
  // "Accounting",
  "Documents",
  "Inventory",
  "Invoicing",
  // "Jobs",
  // "Messaging",
  "Parts",
  "Purchasing",
  "Resources",
  "Sales",
  // "Scheduling",
  "Settings",
  // "Timecards",
  "Users",
] as const;

export type Feature = (typeof possibleFeatures)[number];

const features = {} as Record<Feature, { id: string; name: string }>;

possibleFeatures.forEach((name) => {
  features[name] = {
    id: uuidv4(),
    name,
  };
});

export { features, possibleFeatures };
