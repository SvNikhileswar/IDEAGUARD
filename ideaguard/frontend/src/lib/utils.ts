import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Standard shadcn `cn` helper (the Card Stack source imports it from "@/lib/utils"). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
