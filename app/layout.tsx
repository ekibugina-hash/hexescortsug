import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Footer from "@/components/Footer";
import React, { Suspense } from "react";
import PostHogPageview from "./posthog-pageview";

export const metadata: Metadata = {
  title: "Escorts UG - #1 Verified Hookup Call Girls & Discreet Escorts in Uganda",
  description:
    "Best Uganda escorts & sexy girls in Kampala. Find discreet hookups, ebony call girls, and verified companions in Entebbe, Jinja, Mbarara and countrywide. Direct WhatsApp contacts for real sexy girls in Uganda. #1 Ugandan escort directory.",
  keywords: [
    "Escorts in Kampala Uganda",
    "Kampala call girls",
    "Uganda escorts directory",
    "Verified escorts Kampala",
    "Verified escortd Kampala",
    "Entebbe escorts",
    "Ntinda escorts",
    "Escorts in Ntinda",
    "Call girls Najjera",
    "Escorts near Makerere",
    "Kawempe escorts",
    "Affordable escorts in kampala",
    "Affordableescorts in kampala",
    "girls in uganda to fuck",
    "discreet escorts Uganda",
    "real photos escorts",
    "whatsapp escorts Uganda",
    "direct contacts escorts",
    "escorts Uganda",
    "escorts in Uganda",
    "Uganda escorts",
    "UG escorts",
    "escorts ug",
    "Kampala escorts",
    "escorts in Kampala",
    "Entebbe escorts",
    "Jinja escorts",
    "Mbarara escorts",
    "verified escorts Uganda",
    "Uganda escort directory",
    "girls in Uganda",
    "girls to fuck in Uganda",
    "sexy girls Uganda",
    "hot girls Uganda",
    "companions Uganda",
    "call girls Uganda",
    "call girls Kampala",
    "escort services Uganda",
    "escort services Kampala",
    "ladies in Uganda",
    "hookup Uganda",
    "hookup Kampala",
    "Uganda adult entertainment",
    "Kampala adult entertainment",
    "Uganda girls for hire",
    "best escorts in Uganda",
    "independent escorts Uganda",
  ].join(", "),
  verification: {
    google: [
      "CB2_zvrFVSNRXPIALZfpGR4eg2Gc8HQIgKh41BJd4OM",
      "37jbT2PcWcRwnnSmVcZxesfTuLLL5uyupKBsSed4pY4", 
      "JFY34OVLDSzS0ieEkEQAHauVc4__UBUFCT-8RYtIyuE",
      "-p0KFe2PgD4tXKEQ7tB5IS2OQ2bErUgDzWaq_W8JEO4"
    ],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: "Hex Escorts UG - #1 Verified Hookup Call Girls & Discreet Escorts in Uganda",
    description:
      "Find discreet, verified escorts in Uganda with real photos and direct WhatsApp contacts. Real profiles from Kampala, Entebbe, Jinja, Mbarara and countrywide.",
    url: "https://www.hexescortsug.com",
    siteName: "Hex Escorts UG",
    type: "website",
    locale: "en_UG",
  },
  twitter: {
    description: "Browse verified escorts from across Uganda. Real profiles, reviewed companions.",
  },
  alternates: {
    canonical: "/",
  },
  metadataBase: new URL("https://www.hexescortsug.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="robots" content="index, follow" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="geo.region" content="UG" />
        <meta name="geo.country" content="Uganda" />
        <meta name="language" content="English" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Hex Escorts UG",
                "alternateName": ["Escorts UG", "Hex Escorts"],
                "url": "https://www.hexescortsug.com"
              },
              {
                "@context": "https://schema.org",
                "@type": "LocalBusiness",
                "name": "Hex Escorts UG",
                "url": "https://www.hexescortsug.com",
                "description": "Uganda's #1 verified escort directory. Find sexy girls and escorts in Kampala, Entebbe, Jinja, Mbarara and all major Uganda cities.",
                "address": {
                  "@type": "PostalAddress",
                  "addressCountry": "UG",
                  "addressLocality": "Kampala"
                },
                "areaServed": {
                  "@type": "Country",
                  "name": "Uganda"
                },
                "sameAs": [
                  "https://x.com/vickywiz60",
                  "https://t.me/+yX6mljCz8to2ODE0"
                ]
              }
            ])
          }}
        />
      </head>
      <body suppressHydrationWarning className="overflow-x-hidden">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <main className="flex-grow overflow-x-hidden">{children}</main>
            <Footer />
          </div>
          <Suspense fallback={null}>
            <PostHogPageview />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}