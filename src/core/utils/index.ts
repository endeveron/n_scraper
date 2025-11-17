import { FolderColorKey, folderColorMap } from '@/core/features/note/maps';
import { Theme } from '@/core/types';
import { type ClassValue, clsx } from 'clsx';
import crypto from 'crypto';
import { twMerge } from 'tailwind-merge';

const alphanumCharset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a cryptographically secure random code of a specified length using alphanumeric characters.
 * @param [length=8] - The code length. Default is 8 characters.
 * @returns A randomly generated code.
 */
export function generateCode(length = 8) {
  const bytes = crypto.randomBytes(length);
  let code = '';

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % alphanumCharset.length;
    code += alphanumCharset[index];
  }
  return code;
}

export function createTypedMap<K extends string, V>(
  entries: readonly (readonly [K, V])[]
): Map<K, V> {
  return new Map(entries);
}

export function defineEntries<const K extends string>(
  entries: readonly (readonly [K, { light: string; dark: string }])[]
) {
  return entries;
}

export function getColorByKey(key: FolderColorKey, theme: Theme) {
  const colorGroup = folderColorMap.get(key);
  return colorGroup ? colorGroup[theme] : undefined;
}

/**
 * Converts Markdown content into plain text and limits its length.
 * Truncates first, then removes Markdown for performance.
 * @param markdown - The Markdown string to clean up.
 * @param maxLength - The maximum allowed length (default: 60).
 * @returns A cleaned, truncated plain text string.
 */
export function markdownToPlainText(markdown: string, maxLength = 100): string {
  if (!markdown) return '';

  // Slice the input
  let text = markdown.slice(0, maxLength);

  // Remove Markdown syntax
  text = text
    .replace(/(\*\*|__|\*|_)(.*?)\1/g, '$2') // bold/italic
    .replace(/^#+\s*/gm, '') // headers
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
    .replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // code / inline code
    .replace(/\s+/g, ' ') // collapse spaces/newlines
    .trim();

  return text.trimEnd();
}
