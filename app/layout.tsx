import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.2,
};

export const metadata: Metadata = {
  title: "مركز لؤي سعادة لصيانة وفحص السيارات | كهرباء وميكانيك وفحص كمبيوتر",
  description: "مركز لؤي سعادة لصيانة وفحص السيارات يقدم خدمات كهرباء وميكانيك سيارات، فحص كمبيوتر، إصلاح جير، قطع غيار وتشخيص أعطال السيارات. تواصل الآن على 0788526696.",
  keywords: [
    "مركز لؤي سعادة",
    "صيانة سيارات عمان",
    "كهرباء سيارات",
    "ميكانيك سيارات",
    "فحص كمبيوتر سيارات",
    "إصلاح جير",
    "قطع غيار سيارات",
    "تشخيص أعطال السيارات",
    "برمجة سيارات",
    "فحص سيارات عمان",
    "كراج سيارات في عمان"
  ],
  authors: [{ name: "مركز لؤي سعادة" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://smartscan-garage.com",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: "https://smartscan-garage.com",
    title: "مركز لؤي سعادة لصيانة وفحص السيارات | كهرباء وميكانيك وفحص كمبيوتر",
    description: "مركز لؤي سعادة لصيانة وفحص السيارات يقدم خدمات كهرباء وميكانيك سيارات، فحص كمبيوتر، إصلاح جير، قطع غيار وتشخيص أعطال السيارات. تواصل الآن على 0788526696.",
    siteName: "مركز لؤي سعادة",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Structured Data JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "name": "مركز لؤي سعادة",
    "image": "https://smartscan-garage.com/images/cover.jpg",
    "@id": "https://smartscan-garage.com/#localbusiness",
    "url": "https://smartscan-garage.com",
    "telephone": "0788526696",
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "عمّان - الأردن",
      "addressLocality": "عمّان",
      "addressRegion": "عمّان",
      "addressCountry": "JO"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 31.9522,
      "longitude": 35.8439
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Saturday",
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday"
      ],
      "opens": "09:00",
      "closes": "19:00"
    },
    "sameAs": [
      "https://wa.me/962788526696"
    ],
    "description": "مركز صيانة سيارات متخصص في الكهرباء، الميكانيك، فحص الكمبيوتر، قطع الغيار، وإصلاح الجير."
  };

  return (
    <html lang="ar" dir="rtl" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-[#080a0f] text-gray-100 antialiased font-cairo">
        {children}
      </body>
    </html>
  );
}
