import React from "react";
import { BsLightningCharge } from "react-icons/bs";
import { GiSpeedometer } from "react-icons/gi";
import { GoSync } from "react-icons/go";
import { HiCode, HiFingerPrint } from "react-icons/hi";
import { TbBuildingFactory2 } from "react-icons/tb";

const features = [
  {
    name: "High-Performance",
    icon: GiSpeedometer,
    description:
      "Built on best open-source technologies for incredible performance and security.",
  },
  {
    name: "Open Source",
    icon: HiCode,
    description:
      "Unlike other open-source ERPs, you can use Carbon to build your own proprietary systems.",
  },
  {
    name: "Serverless Architecture",
    icon: GoSync,
    description:
      "So you can focus on your business systems, not your infrastructure.",
  },
  {
    name: "Realtime",
    icon: BsLightningCharge,
    description: "All data can be updated in realtime across applications.",
  },
  {
    name: "Manufacturing",
    icon: TbBuildingFactory2,
    description: "Carbon has first-class support for American manufacturing.",
  },
  {
    name: "Single Tenant",
    icon: HiFingerPrint,
    description:
      "You're not sharing databases with other companies. Your data is yours.",
  },
] as const;

function Features({ showIcons = false }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-6 my-12 sm:grid-cols-2 md:grid-cols-3 ">
        {features.map(({ icon: Icon, ...feature }, i) => (
          <div
            className="flex items-start p-8 space-x-4 backdrop-blur-sm  bg-black/[0.03] hover:bg-black/[0.05] dark:bg-zinc-900 dark:hover:bg-zinc-800/50 sm:-inset-x-6 rounded-md shadow-sm hover:scale-105 hover:translate hover:shadow-xl transition-all duration-300 ease-in-out"
            key={feature.name.split(" ").join("-")}
          >
            {showIcons && (
              <Icon
                className="mt-0.5 block w-8 h-8"
                style={{ height: 24, width: 24 }}
                aria-hidden="true"
              />
            )}

            <div className="flex flex-col space-y-2">
              <h2 className="font-semibold dark:text-white">{feature.name}</h2>
              <p className="font-medium dark:text-white text-sm">
                {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Features;
