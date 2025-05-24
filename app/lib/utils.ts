import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// TODO: move, better name
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
