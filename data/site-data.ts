import siteData from "./site-data.json";

export interface CenterData {
  name: string;
  slogan: string;
  phone: string;
  phoneDisplay: string;
  whatsapp: string;
  location: string;
  locationDetail: string;
  googleMapsLink: string;
  workingHoursDisplay: string;
  workingHoursShort: string;
  email: string;
  hero: {
    badge: string;
    title: string;
    desc: string;
    btn1Text: string;
    btn2Text: string;
  };
  metadata: {
    title: string;
    description: string;
    keywords: string[];
    canonical: string;
    metadataBase: string;
    ogImage: string;
  };
  sectionsVisibility: {
    hero: boolean;
    carTypes: boolean;
    services: boolean;
    problems: boolean;
    whyUs: boolean;
    faq: boolean;
    contact: boolean;
    cta: boolean;
    chatbot: boolean;
  };
  chatbot: {
    welcomeMessage: string;
    defaultReply: string;
    rules: {
      keywords: string[];
      reply: string;
      active: boolean;
    }[];
  };
  services: {
    id: string;
    title: string;
    desc: string;
    icon: string;
    active: boolean;
    image?: string;
  }[];
  problems: {
    title: string;
    code: string;
  }[];
  whyUs: {
    title: string;
    desc: string;
    icon: string;
  }[];
  faqs: {
    q: string;
    a: string;
  }[];
  images: {
    electric: string;
    hybrid: string;
    defaultCar: string;
    ogImage: string;
    favicon: string;
    logo: string;
    hero: string;
    whyUs: string;
  };
  mediaHistory: {
    timestamp: string;
    key: string;
    oldPath: string;
    newPath: string;
  }[];
  carTypes: {
    title: string;
    desc: string;
    image: string;
    active: boolean;
  }[];
  updatedAt?: string;
}

export const CENTER_DATA = siteData as CenterData;
