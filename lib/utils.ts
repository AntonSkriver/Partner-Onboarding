import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const capitalize = (value: string): string =>
  value.charAt(0).toUpperCase() + value.slice(1)

export const friendlyLabel = (value: string): string =>
  value.split(/[_\s-]+/).filter(Boolean).map(capitalize).join(' ')

export const normalizeToLowerCase = (value: string | undefined | null): string =>
  value?.trim().toLowerCase() ?? ''

export const isBrowserEnvironment = (): boolean =>
  typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
