import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e40af" }
  ],
};

export const metadata: Metadata = {
  // Default for pages without their own title or description.
  title: "Tom Tranmer | Tranmer Web Services",
  description:
    "Tom Tranmer builds and looks after websites, online stores and apps for small businesses through Tranmer Web Services.",
  keywords: ["Tranmer Web Services", "web development", "website hosting", "small business apps", "Tom Tranmer"],
  authors: [{ name: "Tom Tranmer" }],
  creator: "Tom Tranmer",
  publisher: "Tom Tranmer",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tranmer.ca"),
  // No site-wide canonical: each page sets its own, or every page would point at "/".
  // No title, description or url here: pages inherit this object whole, so set
  // values would label every shared link as the homepage. Sharing previews fall
  // back to each page's own <title> and description. Image: app/opengraph-image.png.
  openGraph: {
    siteName: "tranmer.ca",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "tranmer.ca",
  },
  other: {
    "application-name": "tranmer.ca",
    "msapplication-TileColor": "#3b82f6",
    "msapplication-config": "none",
  },
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icons/pwa/apple-touch-icon.png" />
        <link rel="icon" type="image/svg+xml" href="/icons/pwa/icon-192.svg" />
        <link rel="icon" type="image/png" href="/icons/pwa/icon-192-maskable.png" />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    }, function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
