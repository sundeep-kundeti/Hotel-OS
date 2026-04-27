import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Srinivasa Residency by Srimuni Hotels | Budget Rooms in Tirupati",
  description: "Book affordable rooms near Tirupati Railway Station at Srinivasa Residency by Srimuni Hotels. AC, Non-AC, Deluxe rooms, Fresh Up & Short Stay options for pilgrims.",
  keywords: ["Tirupati Rooms", "Budget Hotels Tirupati", "Fresh Up Rooms", "Srinivasa Residency", "Srimuni Hotels", "Lodge Tirupati", "Tirumala Accommodation", "Pilgrim Stay Tirupati"],
  openGraph: {
    title: 'Srinivasa Residency by Srimuni Hotels | Budget Rooms in Tirupati',
    description: 'Book affordable rooms near Tirupati Railway Station. AC, Non-AC, Deluxe, Fresh Up & Short Stay options for pilgrims visiting Tirumala.',
    siteName: 'Srinivasa Residency by Srimuni Hotels',
    locale: 'en_IN',
    type: 'website',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Hotel",
              "name": "Srinivasa Residency by Srimuni",
              "description": "Premium hourly fresh up rooms in Tirupati. Ideal for wash & change purposes.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Tirupati",
                "addressRegion": "Andhra Pradesh",
                "addressCountry": "IN"
              },
              "image": "/logo.png",
              "telephone": "+91-9000000000",
              "offers": {
                "@type": "Offer",
                "description": "Hourly Fresh Up Rooms"
              }
            })
          }}
        />
        {/* Google Analytics gtag.js */}
        <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-KX9K6BN8VM" />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-KX9K6BN8VM');
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
