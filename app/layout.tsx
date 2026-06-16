import type { Metadata } from "next";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1.2,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://loay-saadeh-garage.vercel.app"),
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
    canonical: "https://loay-saadeh-garage.vercel.app",
  },
  openGraph: {
    type: "website",
    locale: "ar_JO",
    url: "https://loay-saadeh-garage.vercel.app",
    title: "مركز لؤي سعادة لصيانة وفحص السيارات | كهرباء وميكانيك وفحص كمبيوتر",
    description: "مركز لؤي سعادة لصيانة وفحص السيارات يقدم خدمات كهرباء وميكانيك سيارات، فحص كمبيوتر، إصلاح جير، قطع غيار وتشخيص أعطال السيارات. تواصل الآن على 0788526696.",
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
    title: "مركز لؤي سعادة لصيانة وفحص السيارات | كهرباء وميكانيك وفحص كمبيوتر",
    description: "مركز لؤي سعادة لصيانة وفحص السيارات يقدم خدمات كهرباء وميكانيك سيارات، فحص كمبيوتر، إصلاح جير، قطع غيار وتشخيص أعطال السيارات. تواصل الآن على 0788526696.",
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
        "@id": "https://loay-saadeh-garage.vercel.app/#localbusiness",
        "name": "مركز لؤي سعادة لصيانة وفحص السيارات",
        "image": "https://loay-saadeh-garage.vercel.app/og-image.png",
        "url": "https://loay-saadeh-garage.vercel.app",
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
        "description": "مركز صيانة سيارات متخصص في الكهرباء، الميكانيك، فحص الكمبيوتر، قطع الغيار، وإصلاح الجير في عمّان الأردن."
      },
      {
        "@type": "FAQPage",
        "@id": "https://loay-saadeh-garage.vercel.app/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "هل تفحصون سيارات الهايبرد؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نحن متخصصون في فحص سيارات الهايبرد. نقوم بفحص بطارية الهايبرد وقراءة كفاءة الخلايا الفردية، فحص نظام الشحن، الإنفرتر (العاكس)، وتحديد أي عطل كهربائي بدقة بالغة."
            }
          },
          {
            "@type": "Question",
            "name": "هل تفحصون السيارات الكهربائية؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم بالتأكيد، نقدم فحصاً شاملاً للسيارات الكهربائية بالكامل (EV) يشمل فحص صحة البطارية (SOH)، تشخيص نظام الشحن والمداخل، قراءة الحساسات، واختبار كفاءة المحركات الكهربائية والأنظمة المساعدة."
            }
          },
          {
            "@type": "Question",
            "name": "هل يمكن فحص السيارة قبل الشراء؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نوفر خدمة الفحص الفني والتقني المتكامل للسيارات قبل الشراء. نقوم بفحص كمبيوتر شامل لجميع الأنظمة وقراءة تاريخ الأعطال المخفية لمساعدتك في معرفة الحالة الحقيقية للسيارة قبل اتخاذ قرار الشراء."
            }
          },
          {
            "@type": "Question",
            "name": "هل فحص الكمبيوتر يحدد سبب العطل؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "فحص الكمبيوتر يقرأ رموز الأعطال (DTCs)، ولكن الأهم هو تحليل هذا الرمز وربطه بالحالة الميكانيكية والكهربائية الفعلية لمعرفة السبب الحقيقي للعطل وليس مجرد تبديل الحساس التالف. وهذا ما نتميز به في مركزنا."
            }
          },
          {
            "@type": "Question",
            "name": "هل تقدمون برمجة سيارات؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "نعم، نوفر خدمات برمجة وتعريف قطع السيارات الجديدة، إعادة تهيئة الأنظمة (Reset)، وتحديث برمجيات كمبيوتر السيارة، وحل مشاكل لمبات التحذير بعد الصيانة."
            }
          },
          {
            "@type": "Question",
            "name": "كم يستغرق فحص السيارة؟",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "يستغرق الفحص العادي وقراءة الكمبيوتر من 15 إلى 30 دقيقة. وفي الحالات المعقدة التي تتطلب فحص الأسلاك والظفيرة أو فحص خلايا البطارية قد يستغرق التشخيص وقتاً أطول لضمان الدقة وتجنب الخطأ."
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
