import type { Metadata, Viewport } from 'next';
import { Mulish, PT_Serif } from 'next/font/google';

import { Toaster } from '@/core/components/ui/Sonner';
import { APP_DESCRIPTION, APP_NAME, BASE_URL } from '@/core/constants';
import { Providers } from '@/core/context/providers';

import '@/core/globals.css';

export const viewport: Viewport = {
  interactiveWidget: 'resizes-content',
  viewportFit: 'cover',
};

const mulishSans = Mulish({
  variable: '--font-mulish-sans',
  subsets: ['latin'],
});

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: APP_NAME,
  applicationName: APP_NAME,
  description: APP_DESCRIPTION,
  creator: 'Endeveron',
  metadataBase: new URL(BASE_URL),
  openGraph: {
    title: APP_NAME,
    description: APP_DESCRIPTION,
    siteName: APP_NAME,
    type: 'website',
    url: '/',
    locale: 'en_US',
    images: [
      {
        url: `${BASE_URL}/images/open-graph/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: `OG Image`,
        type: 'image/jpg',
      },
      {
        url: `${BASE_URL}/images/open-graph/og-image-square.jpg`,
        width: 1200,
        height: 1200,
        alt: `OG Image`,
        type: 'image/jpg',
      },
    ],
  },
  icons: {
    icon: {
      url: `${BASE_URL}/images/icons/favicon.ico`,
      type: 'image/image/ico',
    },
  },
  // Additional meta tags for messaging apps and social platforms
  other: {
    // WhatsApp and general mobile
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'apple-mobile-web-app-title': APP_NAME,

    // Pinterest
    'pinterest-rich-pin': 'true',

    // Generic social media
    robots: 'index, follow',
    googlebot: 'index, follow',

    // For better link previews in messaging apps
    'format-detection': 'telephone=no',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try { const stored = localStorage.getItem('theme'); const theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'); if (theme === 'dark') document.documentElement.classList.add('dark'); } catch (e) {}`,
          }}
        />
      </head>
      <body
        className={`${mulishSans.variable} ${ptSerif.variable} antialiased`}
      >
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
