import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
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
  title: "Srinivasa Residency by Srimuni | Fresh Up Rooms in Tirupati",
  description: "Book hourly fresh up rooms in Tirupati natively at Srinivasa Residency by Srimuni. Ideal for wash & change purposes.",
  keywords: ["Tirupati Rooms", "Hourly Rooms Tirupati", "Fresh Up Rooms", "Srinivasa Residency", "Srimuni", "Wash and Change Tirupati"],
  openGraph: {
    title: 'Srinivasa Residency by Srimuni | Fresh Up Rooms',
    description: 'Book hourly fresh up rooms natively at Srinivasa Residency by Srimuni.',
    siteName: 'Srinivasa Residency by Srimuni',
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
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
