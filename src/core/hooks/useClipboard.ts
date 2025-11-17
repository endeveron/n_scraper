'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export const useClipboard = (timeout: number = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      if (typeof window === 'undefined' || !navigator?.clipboard) {
        toast('Clipboard API is not available');
        return false;
      }

      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), timeout);
        return true;
      } catch (error) {
        console.error('Failed to copy:', error);
        toast('Failed to copy to clipboard');
        setCopied(false);
        return false;
      }
    },
    [timeout]
  );

  const paste = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator?.clipboard) {
      toast('Clipboard API is not available');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      return text;
    } catch (error) {
      console.error('Failed to paste:', error);
      toast('Failed to read from clipboard');
      return null;
    }
  }, []);

  return { copy, copied, paste };
};
