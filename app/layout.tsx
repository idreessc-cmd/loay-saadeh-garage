import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.2,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://loay-saadeh-garage-mllw.vercel.app"),
  title: "مركز لؤي سعادة لصيانة وفحص السيارات",
  description: "مركز لؤي سعادة في ماركا الشمالية خلف مخابز جواد يقدم خدمات تشخيص الأعطال، نظام التكييف، نظام الفرامل، المحرك والجير، الزيوت والفلاتر، بطاريات HV وقطع الغيار لجميع السيارات.",
  keywords: [
    "مركز لؤي سعادة",
    "صيانة سيارات عمان",
    "نظام التكييف سيارات",
    "نظام الفرامل سيارات",
    "المحرك والجير",
    "الزيوت والفلاتر",
    "بطاريات HV",
    "تشخيص أعطال السيارات",
    "قطع غيار سيارات",
    "ماركا الشمالية",
    "كراج سيارات في عمان"
  ],
  authors: [{ name: "مركز لؤي سعادة" }],
  robots: "index, follow",
  alternates: {
    canonical: "https://loay-saadeh-garage-mllw.vercel.app/",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: "https://loay-saadeh-garage-mllw.vercel.app/",
    title: "مركز لؤي سعادة لصيانة وفحص السيارات",
    description: "مركز لؤي سعادة في ماركا الشمالية خلف مخابز جواد يقدم خدمات تشخيص الأعطال، نظام التكييف، نظام الفرامل، المحرك والجير، الزيوت والفلاتر، بطاريات HV وقطع الغيار لجميع السيارات.",
    siteName: "مركز لؤي سعادة",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "مركز لؤي سعادة لصيانة وفحص السيارات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "مركز لؤي سعادة لصيانة وفحص السيارات",
    description: "مركز لؤي سعادة في ماركا الشمالية خلف مخابز جواد يقدم خدمات تشخيص الأعطال، نظام التكييف، نظام الفرامل، المحرك والجير، الزيوت والفلاتر، بطاريات HV وقطع الغيار لجميع السيارات.",
    images: ["/og-image.png"],
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
        "@id": "https://loay-saadeh-garage-mllw.vercel.app/#localbusiness",
        "name": "مركز لؤي سعادة",
        "image": "https://loay-saadeh-garage-mllw.vercel.app/og-image.png",
        "url": "https://loay-saadeh-garage-mllw.vercel.app/",
        "telephone": "+962788526696",
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "ماركا الشمالية، خلف مخابز جواد",
          "addressLocality": "عمان",
          "addressRegion": "عمان",
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
          "https://wa.me/962788526696"
        ],
        "description": "مركز لؤي سعادة في ماركا الشمالية خلف مخابز جواد يقدم خدمات تشخيص الأعطال، نظام التكييف، نظام الفرامل، المحرك والجير، الزيوت والفلاتر، بطاريات HV وقطع الغيار لجميع السيارات."
      },
      {
        "@type": "FAQPage",
        "@id": "https://loay-saadeh-garage-mllw.vercel.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "ما أوقات دوام مركز لؤي سعادة؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "دوام مركز لؤي سعادة من السبت إلى الأربعاء من الساعة 8:00 صباحاً حتى 5:00 عصراً، ويوم الخميس من الساعة 8:00 صباحاً حتى 1:00 ظهراً، والجمعة عطلة رسمية."
            }
          },
          {
            "@type": "Question",
            "name": "أين يقع مركز لؤي سعادة؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "يقع مركز لؤي سعادة في ماركا الشمالية، خلف مخابز جواد. يمكنك فتح الموقع من زر الخريطة لتحديد الاتجاهات مباشرة."
            }
          },
          {
            "@type": "Question",
            "name": "هل يقدم المركز تشخيص أعطال؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، يقدم المركز فحص كمبيوتر وتحديد وتشخيص الأعطال لجميع أنظمة وحساسات السيارة قبل تغيير أي قطعة."
            }
          },
          {
            "@type": "Question",
            "name": "هل يخدم المركز جميع أنواع السيارات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، يقدم مركز لؤي سعادة خدمات الصيانة والتشخيص لجميع أنواع السيارات (بنزين، ديزل، هايبرد، وكهرباء)."
            }
          },
          {
            "@type": "Question",
            "name": "هل يتعامل المركز مع سيارات الكهرباء وبطاريات HV؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نتميز بالتخصص في فحص وصيانة سيارات الكهرباء وبطاريات الجهد العالي (HV) وأنظمة الشحن."
            }
          },
          {
            "@type": "Question",
            "name": "هل تتوفر قطع غيار؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نقوم بتوفير وتأمين قطع الغيار الأصلية والبديلة ذات الجودة العالية والمكفولة التي تناسب موديل مركبتك."
            }
          }
        ]
      }
    ]
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
