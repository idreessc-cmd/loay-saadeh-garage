import type { Metadata } from "next";
import { Cairo, Geist } from "next/font/google";
import "./globals.css";
import { CENTER_DATA } from "../data/site-data";
import { serializeJsonForHtmlScript } from "../lib/security";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-geist",
  display: "swap",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(CENTER_DATA.metadata.metadataBase),
  title: CENTER_DATA.metadata.title,
  description: CENTER_DATA.metadata.description,
  keywords: CENTER_DATA.metadata.keywords,
  authors: [{ name: CENTER_DATA.name }],
  robots: "index, follow",
  icons: {
    icon: `${CENTER_DATA.images.favicon || "/favicon.ico"}?v=${CENTER_DATA.updatedAt || "1"}`,
    shortcut: `${CENTER_DATA.images.favicon || "/favicon.ico"}?v=${CENTER_DATA.updatedAt || "1"}`,
    apple: `${CENTER_DATA.images.favicon || "/favicon.ico"}?v=${CENTER_DATA.updatedAt || "1"}`,
  },
  alternates: {
    canonical: CENTER_DATA.metadata.canonical,
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: CENTER_DATA.metadata.canonical,
    title: CENTER_DATA.metadata.title,
    description: CENTER_DATA.metadata.description,
    siteName: CENTER_DATA.name,
    images: [
      {
        url: `${CENTER_DATA.images.ogImage || "/og-image.png"}?v=${CENTER_DATA.updatedAt || "1"}`,
        width: 1200,
        height: 630,
        alt: CENTER_DATA.metadata.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: CENTER_DATA.metadata.title,
    description: CENTER_DATA.metadata.description,
    images: [`${CENTER_DATA.images.ogImage || "/og-image.png"}?v=${CENTER_DATA.updatedAt || "1"}`],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data JSON-LD for Local Business & FAQ (GEO/SEO Optimization)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AutoRepair",
        "@id": `${CENTER_DATA.metadata.canonical}#localbusiness`,
        "name": CENTER_DATA.name,
        "image": `${CENTER_DATA.metadata.canonical}${CENTER_DATA.images.ogImage.replace(/^\//, "")}`,
        "url": CENTER_DATA.metadata.canonical,
        "telephone": `+${CENTER_DATA.whatsapp}`,
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": CENTER_DATA.locationDetail,
          "addressLocality": CENTER_DATA.location.split("،")[0] || "عمان",
          "addressRegion": CENTER_DATA.location.split("،")[0] || "عمان",
          "addressCountry": "JO"
        },
        "openingHoursSpecification": [
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": [
              "Saturday",
              "Sunday",
              "Monday",
              "Tuesday",
              "Wednesday"
            ],
            "opens": "08:00",
            "closes": "17:00"
          },
          {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": "Thursday",
            "opens": "08:00",
            "closes": "13:00"
          }
        ],
        "sameAs": [
          `https://wa.me/${CENTER_DATA.whatsapp}`
        ],
        "description": CENTER_DATA.metadata.description
      },
      {
        "@type": "FAQPage",
        "@id": `${CENTER_DATA.metadata.canonical}#faq`,
        "mainEntity": CENTER_DATA.faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.a
          }
        }))
      }
    ]
  };
  const safeJsonLd = serializeJsonForHtmlScript(jsonLd);

  return (
    <html lang="ar" dir="rtl" className={`scroll-smooth ${cairo.variable} ${geist.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: safeJsonLd }}
        />
      </head>
      <body className="min-h-screen bg-[#080a0f] text-gray-100 antialiased font-cairo">
        {children}
      </body>
    </html>
  );
}
