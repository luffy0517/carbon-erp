import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

const customTwMerge = extendTailwindMerge({});

export function cn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}
