import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) {
    return 'Not provided';
  }

  const date = new Date(dateInput);

  if (isNaN(date.getTime())) {
    return 'Invalid Date Format';
  }

  return date.toLocaleDateString();
}
