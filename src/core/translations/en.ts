import { APP_NAME } from '@/core/constants';

// Auth

// (auth)/email/error
export const ERROR_PAGE_TITLE = `Email error – ${APP_NAME}`;
export const ERROR_PAGE_DESCRIPTION = 'Email confirmation';
export const ERROR_TITLE = 'Oops!';

// (auth)/email/result
export const ERROR_UNEXPECTED_FORMAT = 'Unexpected error format';
export const ERROR_EMAIL_TOKEN = 'Unable to verify email token';
export const ERROR_INVALID_SEARCH_PARAMS = 'Invalid search params';

// (auth)/email/verify
export const EMAIL_VERIFY_TITLE = 'Check your inbox';
export const EMAIL_VERIFY_SENT_INTRO = "We've sent a link to"; // before the email address
export const EMAIL_VERIFY_SENT_OUTRO =
  'Please follow the instructions to complete your registration.';
export const EMAIL_VERIFY_SPAM_WARNING =
  "Don't see an email? Check spam folder.";
export const EMAIL_VERIFY_RESEND_BUTTON = 'Resend verification link';

// (auth)/invite
export const INVITE_PAGE_TITLE = `Invite code – ${APP_NAME}`;
export const INVITE_PAGE_DESCRIPTION = 'Account creation';
export const INVITE_CARD_TITLE = 'Invite code';
export const INVITE_CODE_INPUT_PLACEHOLDER = 'Enter the code';
export const INVITE_CONTINUE_BUTTON = 'Continue';
export const ALREADY_HAVE_ACCOUNT = 'Already have an account ?';
export const INVITE_TOAST_WAIT_SECONDS =
  'Please wait for {seconds} seconds and try again';
export const INVITE_TOAST_WAIT_ONE_MINUTE =
  'Please wait for 1 minute and try again';
export const INVITE_TOAST_INVALID_CODE = 'Invalid code';
export const INVITE_TOAST_SERVER_ERROR = 'Server error';

// (auth)/onboarding
export const ONBOARDING_PAGE_TITLE = `Onboarding – ${APP_NAME}`;
export const ONBOARDING_PAGE_DESCRIPTION = 'Account creation';
export const ONBOARDING_CARD_TITLE = 'Onboarding';
export const ONBOARDING_CARD_DESCRIPTION = 'Email successfully verified';
export const ONBOARDING_LABEL_NAME = 'Your name';
export const ONBOARDING_LABEL_PASSWORD = 'Password';
export const ONBOARDING_LABEL_CONFIRM_PASSWORD = 'Confirm password';
export const ONBOARDING_BUTTON_CREATE_ACCOUNT = 'Create an account';
export const ONBOARDING_TOAST_INVITE_MISSING = 'Could not retrieve invite code';

// (auth)/signin
export const SIGNIN_PAGE_TITLE = `Sign In – ${APP_NAME}`;
export const SIGNIN_PAGE_DESCRIPTION = 'Authentication';
export const SIGNIN_CARD_TITLE = 'Sign In';
export const EMAIL_INPUT_LABEL = 'Email';
export const PASSWORD_INPUT_LABEL = 'Password';
export const SIGNIN_BUTTON_LABEL = 'Sign in';
export const CREATE_ACCOUNT_LINK_LABEL = 'Create an account';

// (auth)/signup
export const SIGNUP_PAGE_TITLE = `Sign Up – ${APP_NAME}`;
export const SIGNUP_PAGE_DESCRIPTION = 'Account creation';
export const SIGNUP_CARD_TITLE = 'Sign Up';

// Inputs
export const EMAIL_INPUT_PLACEHOLDER = 'Enter your email';

// Buttons
export const SIGNOUT_BUTTON_LABEL = 'Sign out';
export const CONTINUE_BUTTON_LABEL = 'Continue';

// Utils
export const UNKNOWN_ERROR = 'Unknown error';
export const INVALID_SEARCH_PARAMS = 'Invalid search params';
export const INVALID_ERROR_CODE = 'Invalid error code';

// Menu
export const THEME_LABEL_LIGHT = 'Light';
export const THEME_LABEL_DARK = 'Dark';
export const THEME_LABEL_SUFFIX = ' theme';
export const SIGN_OUT_LABEL = 'Sign out';
