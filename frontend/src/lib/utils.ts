import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const isDebugEnabled =
  process.env.NEXT_PUBLIC_DEBUG === "true" || process.env.NODE_ENV !== "production"

export function debugLog(...args: unknown[]) {
  if (!isDebugEnabled || typeof console === "undefined") {
    return
  }
  console.debug(...args)
}
