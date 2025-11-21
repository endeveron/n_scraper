import { Browser, chromium as chromiumCore, Page } from 'playwright-core';
import chromium from '@sparticuz/chromium';

export interface PageWithBrowser extends Page {
  _browser?: Browser;
}

const globalWithBrowser = global as typeof global & {
  _playwrightBrowser?: {
    browser: Browser | null;
    lastUsed: number;
  };
};

const browserCache =
  globalWithBrowser._playwrightBrowser ??
  (globalWithBrowser._playwrightBrowser = { browser: null, lastUsed: 0 });

const BROWSER_TIMEOUT = 5 * 60 * 1000; // 5 minutes idle timeout

async function launchBrowser(): Promise<Browser> {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v138.0.2/chromium-v138.0.2-pack.x64.tar'
    );

    return await chromiumCore.launch({
      args: chromium.args,
      executablePath,
      headless: true,
    });
  } else {
    const playwright = await import('playwright');
    return await playwright.chromium.launch({ headless: true });
  }
}

async function getBrowser(): Promise<Browser> {
  const now = Date.now();

  // Check if browser exists and is still connected
  if (browserCache.browser && browserCache.browser.isConnected()) {
    // Check if browser has been idle too long
    if (now - browserCache.lastUsed > BROWSER_TIMEOUT) {
      await browserCache.browser.close();
      browserCache.browser = null;
    } else {
      browserCache.lastUsed = now;
      return browserCache.browser;
    }
  }

  // Launch new browser
  browserCache.browser = await launchBrowser();
  browserCache.lastUsed = now;
  return browserCache.browser;
}

async function closeBrowser(): Promise<void> {
  if (browserCache.browser) {
    await browserCache.browser.close();
    browserCache.browser = null;
  }
}

async function getNewPage(): Promise<PageWithBrowser> {
  const browser = await getBrowser();
  const page = (await browser.newPage()) as PageWithBrowser;

  // In serverless, attach the browser to the page for cleanup
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    page._browser = browser;
  }

  return page;
}

export const playwrightBrowser = {
  getBrowser,
  closeBrowser,
  getNewPage,
  isConnected: (): boolean => {
    return browserCache.browser?.isConnected() ?? false;
  },
};
