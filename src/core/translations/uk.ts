import { APP_NAME } from '@/core/constants';

// Auth

// (auth)/email/error
export const ERROR_PAGE_TITLE = `Помилка електронної пошти – ${APP_NAME}`;
export const ERROR_PAGE_DESCRIPTION = 'Підтвердження електронної пошти';
export const ERROR_TITLE = 'Ой!';

// (auth)/email/result
export const ERROR_UNEXPECTED_FORMAT = 'Непередбачуваний формат помилки';
export const ERROR_EMAIL_TOKEN =
  'Не вдалося підтвердити токен електронної пошти';
export const ERROR_INVALID_SEARCH_PARAMS = 'Недійсні параметри запиту';

// (auth)/email/verify
export const EMAIL_VERIFY_TITLE = 'Перевірте свою пошту';
export const EMAIL_VERIFY_SENT_INTRO = 'Ми надіслали посилання на'; // before email
export const EMAIL_VERIFY_SENT_OUTRO =
  'Будь ласка, дотримуйтеся інструкцій для завершення реєстрації.';
export const EMAIL_VERIFY_SPAM_WARNING =
  'Не бачите листа? Перевірте папку зі спамом.';
export const EMAIL_VERIFY_RESEND_BUTTON = 'Надіслати посилання ще раз';

// (auth)/invite
export const INVITE_PAGE_TITLE = `Код запрошення – ${APP_NAME}`;
export const INVITE_PAGE_DESCRIPTION = 'Створення облікового запису';
export const INVITE_CARD_TITLE = 'Код запрошення';
export const INVITE_CODE_INPUT_PLACEHOLDER = 'Введіть код';
export const INVITE_CONTINUE_BUTTON = 'Продовжити';
export const ALREADY_HAVE_ACCOUNT = 'Вже маєте обліковий запис?';
export const INVITE_TOAST_WAIT_SECONDS =
  'Будь ласка, почекайте {seconds} секунд і спробуйте ще раз';
export const INVITE_TOAST_WAIT_ONE_MINUTE =
  'Будь ласка, почекайте 1 хвилину і спробуйте ще раз';
export const INVITE_TOAST_INVALID_CODE = 'Недійсний код';
export const INVITE_TOAST_SERVER_ERROR = 'Помилка сервера';

// (auth)/onboarding
export const ONBOARDING_PAGE_TITLE = `Початок роботи – ${APP_NAME}`;
export const ONBOARDING_PAGE_DESCRIPTION = 'Створення акаунту';
export const ONBOARDING_CARD_TITLE = 'Початок роботи';
export const ONBOARDING_CARD_DESCRIPTION =
  'Електронну пошту успішно підтверджено';
export const ONBOARDING_LABEL_NAME = 'Ваше ім’я';
export const ONBOARDING_LABEL_PASSWORD = 'Пароль';
export const ONBOARDING_LABEL_CONFIRM_PASSWORD = 'Підтвердіть пароль';
export const ONBOARDING_BUTTON_CREATE_ACCOUNT = 'Створити акаунт';
export const ONBOARDING_TOAST_INVITE_MISSING =
  'Не вдалося отримати код запрошення';

// (auth)/signin
export const SIGNIN_PAGE_TITLE = `Вхід – ${APP_NAME}`;
export const SIGNIN_PAGE_DESCRIPTION = 'Автентифікація';
export const SIGNIN_CARD_TITLE = 'Вхід';
export const EMAIL_INPUT_LABEL = 'Email адреса';
export const PASSWORD_INPUT_LABEL = 'Пароль';
export const SIGNIN_BUTTON_LABEL = 'Увійти';
export const CREATE_ACCOUNT_LINK_LABEL = 'Створити обліковий запис';

// (auth)/signup
export const SIGNUP_PAGE_TITLE = `Реєстрація – ${APP_NAME}`;
export const SIGNUP_PAGE_DESCRIPTION = 'Створення облікового запису';
export const SIGNUP_CARD_TITLE = 'Реєстрація';

// Inputs
export const EMAIL_INPUT_PLACEHOLDER = 'Введіть вашу електронну пошту';

// Buttons
export const SIGNOUT_BUTTON_LABEL = 'Вийти';
export const CONTINUE_BUTTON_LABEL = 'Продовжити';

// Utils
export const UNKNOWN_ERROR = 'Невідома помилка';
export const INVALID_SEARCH_PARAMS = 'Недійсні параметри запиту';
export const INVALID_ERROR_CODE = 'Недійсний код помилки';

// Menu
export const THEME_LABEL_LIGHT = 'Світла';
export const THEME_LABEL_DARK = 'Темна';
export const THEME_LABEL_SUFFIX = ' тема';
export const SIGN_OUT_LABEL = 'Вийти';

// Scraper
export const DATA_FETCHING_MESSAGE = 'Отримуємо дані від DTEK';
export const DATA_ERROR = 'Помилка отримання даних';
export const UPDATE = 'Оновити';

export const WEEKDAYS = {
  MONDAY: 'ПН',
  TUESDAY: 'ВТ',
  WEDNESDAY: 'СР',
  THURSDAY: 'ЧТ',
  FRIDAY: 'ПТ',
  SATURDAY: 'СБ',
  SUNDAY: 'НД',
};
