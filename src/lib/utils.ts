import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '/placeholder.svg';
  
  // If it's already a local path (transformed by allProfiles.ts), return it
  if (url.startsWith('/storage/')) return url;
  if (url.startsWith('http')) return url;
  if (url.startsWith('/')) return url;

  return url;
}
