export type PageParams = { id: string };

export type SearchParams = Promise<{
  [key: string]: string | string[] | undefined;
}>;

export type WithChildren<T = object> = T & { children?: React.ReactNode };

export type ErrorWithCode = { code?: number; message: string };

export type ServerActionError = {
  success: false;
  error: Error | ErrorWithCode;
};

export type ServerActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | ServerActionError;

export type APIResult<T> = {
  data: T | null;
  error?: string;
};

export enum EmailType {
  'CONFIRMATION' = 'CONFIRMATION',
  'PROMOTION' = 'PROMOTION',
}

export type ActionResult<T = unknown> =
  | {
      success: true;
      data?: T;
    }
  | {
      success: false;
      error?: string;
    };

export type Theme = 'light' | 'dark';

export type ColorGroup = {
  light: string;
  dark: string;
};
