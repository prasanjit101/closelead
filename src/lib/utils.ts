import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name?: string | null): string {
  if (!name) return "";
  // Ensure name is treated as a string before splitting
  const nameStr = String(name);
  return nameStr
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("");
}
