"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import {
  Cpu,
  Wrench,
  Zap,
  Battery,
  Settings,
  ShieldAlert,
  Search,
  CheckCircle,
  AlertTriangle,
  Phone,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  Menu,
  X,
  Gauge,
  Activity,
  HeartPulse,
  DollarSign,
  Bot,
  Send,
  Sun,
  Moon,
  MessageSquare,
  Calendar
} from "lucide-react";

import { CENTER_DATA } from "../data/site-data";

// Map Icon Strings to Lucide Components
const IconMapper = ({ name, className }: { name: string; className?: string }) => {
  const icons: Record<string, LucideIcon> = {
    Cpu,
    Wrench,
    Zap,
    Battery,
    Settings,
    ShieldAlert,
    Search,
    CheckCircle,
    AlertTriangle,
    Phone,
    Clock,
    MapPin,
    Gauge,
    Activity,
    HeartPulse,
    DollarSign,
    MessageSquare,
    Calendar
  };
  const IconComponent = icons[name] || Settings;
  return <IconComponent className={className} />;
};

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  
  const theme = useSyncExternalStore(
    (onStoreChange) => {
      window.addEventListener("storage", onStoreChange);
      window.addEventListener("theme-change", onStoreChange);
      return () => {
        window.removeEventListener("storage", onStoreChange);
        window.removeEventListener("theme-change", onStoreChange);
      };
    },
    () => localStorage.getItem("theme") === "light" ? "light" : "dark",
    () => "dark"
  );

  useEffect(() => {
    document.body.classList.toggle("light-mode", theme === "light");
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };
  
  // Chatbot State
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<{
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
  }[]>([
    {
      id: "welcome",
      text: CENTER_DATA.chatbot.welcomeMessage,
      sender: "bot",
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Close mobile menu when hash changes
  useEffect(() => {
    const handleHashChange = () => setMobileMenuOpen(false);
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = {
      id: Math.random().toString(),
      text: inputText.trim(),
      sender: "user" as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    const userText = userMsg.text.toLowerCase();
    
    const matches = (keywords: string[]) => {
      return keywords.some(keyword => userText.includes(keyword.toLowerCase()));
    };

    const matchingRule = CENTER_DATA.chatbot.rules.find(
      (rule) => rule.active !== false && matches(rule.keywords)
    );
    const reply = matchingRule?.reply || CENTER_DATA.chatbot.defaultReply;

    setTimeout(() => {
      const botMsg = {
        id: Math.random().toString(),
        text: reply,
        sender: "bot" as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <div className="relative min-h-screen selection:bg-electric-blue selection:text-white overflow-hidden">
      <a href="#main-content" className="skip-link">تجاوز القائمة والانتقال إلى المحتوى</a>
      
      {/* Dynamic Background Effects */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-electric-blue/10 to-transparent pointer-events-none z-0" />
      <div className="absolute top-[1200px] right-0 w-[300px] h-[300px] bg-electric-blue/5 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[800px] left-0 w-[400px] h-[400px] bg-warning-amber/5 blur-[150px] rounded-full pointer-events-none z-0" />
      
      {/* 1. HEADER SECTION */}
      <header className="sticky top-0 w-full z-50 glass-panel border-b border-white/5 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center gap-3">
              {CENTER_DATA.images.logo ? (
                <div className="h-10 flex items-center">
                  <Image
                    src={`${CENTER_DATA.images.logo}?v=${CENTER_DATA.updatedAt || "1"}`} 
                    width={160}
                    height={40}
                    className="h-10 w-auto max-w-[160px] object-contain rounded-lg" 
                    alt={CENTER_DATA.name} 
                  />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-electric-blue flex items-center justify-center text-white shadow-lg shadow-electric-blue/30 border border-white/10 overflow-hidden">
                  {CENTER_DATA.images.favicon ? (
                    <Image
                      src={`${CENTER_DATA.images.favicon}?v=${CENTER_DATA.updatedAt || "1"}`} 
                      width={40}
                      height={40}
                      className="w-full h-full object-cover" 
                      alt={CENTER_DATA.name} 
                    />
                  ) : (
                    <Cpu className="w-6 h-6 animate-pulse" />
                  )}
                </div>
              )}
              <span className="font-cairo-play font-bold text-lg sm:text-xl md:text-2xl tracking-tight bg-gradient-to-l from-white via-gray-200 to-electric-blue bg-clip-text text-transparent">
                {CENTER_DATA.name}
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <a href="#" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">الرئيسية</a>
              <a href="#services" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">الخدمات</a>
              <a href="#problems" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">أعطال شائعة</a>
              <a href="#why-us" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">لماذا نحن</a>
              <a href="#faq" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">الأسئلة الشائعة</a>
              <a href="#contact" className="text-gray-300 hover:text-electric-blue transition-colors text-sm font-semibold">تواصل معنا</a>
            </nav>

            {/* CTA Button Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              {/* Theme Toggle Button Desktop */}
              <button
                onClick={toggleTheme}
                className="min-w-11 min-h-11 text-gray-400 hover:text-white p-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 transition-all cursor-pointer"
                aria-label="تبديل الوضع"
                title="تبديل الوضع"
              >
                {theme === 'light' ? <Sun className="w-5 h-5 text-warning-amber" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <a
                href={`https://wa.me/${CENTER_DATA.whatsapp}?text=مرحباً، أرغب في حجز موعد لفحص سيارتي`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cairo-play bg-electric-blue hover:bg-electric-blue-hover text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow-md shadow-electric-blue/20 hover:shadow-lg hover:shadow-electric-blue/40 border border-white/10 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                تواصل الآن
              </a>
            </div>

            {/* Mobile Menu Switch & Theme Toggle */}
            <div className="flex lg:hidden items-center gap-3">
              {/* Theme Toggle Button Mobile */}
              <button
                onClick={toggleTheme}
                className="min-w-11 min-h-11 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer"
                aria-label="تبديل الوضع"
                title="تبديل الوضع"
              >
                {theme === 'light' ? <Sun className="w-5 h-5 text-warning-amber" /> : <Moon className="w-5 h-5" />}
              </button>
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="min-w-11 min-h-11 text-gray-400 hover:text-white p-2 rounded-lg bg-white/5 border border-white/5 cursor-pointer"
                aria-label={mobileMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div id="mobile-navigation" className="lg:hidden glass-panel border-b border-white/5 animate-fadeIn">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a href="#" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">الرئيسية</a>
              <a href="#services" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">الخدمات</a>
              <a href="#problems" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">أعطال شائعة</a>
              <a href="#why-us" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">لماذا نحن</a>
              <a href="#faq" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">الأسئلة الشائعة</a>
              <a href="#contact" className="block px-3 py-2.5 rounded-lg text-base font-semibold text-gray-300 hover:bg-white/5 hover:text-electric-blue transition-all">تواصل معنا</a>
            </div>
          </div>
        )}
      </header>

      <main id="main-content" tabIndex={-1}>
      {/* 2. HERO SECTION */}
      {CENTER_DATA.sectionsVisibility.hero && (
        <section className="relative pt-8 pb-20 lg:pt-16 lg:pb-32 overflow-hidden">
          {/* High-tech photographic workshop background from the new design */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-[#0b1326]/60 via-[#0b1326]/85 to-[#0b1326] z-10" />
            <Image
              src="/images/hero-bg.png"
              alt="High Tech EV Workshop"
              fill
              priority
              className="object-cover opacity-20"
            />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-8 text-center lg:text-right z-10">
                
                {/* Specialized Tech Tag */}
                {CENTER_DATA.hero.badge && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-electric-blue/10 border border-electric-blue/30 text-electric-blue mx-auto lg:mx-0">
                    <span className="w-2 h-2 rounded-full bg-electric-blue animate-ping" />
                    <span className="font-data-mono text-xs uppercase tracking-wider font-semibold">{CENTER_DATA.hero.badge}</span>
                  </div>
                )}
                <h1 className="font-cairo-play text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight">
                  {CENTER_DATA.name}
                  <span className="block text-2xl sm:text-3xl lg:text-4xl font-bold text-electric-blue mt-2 sm:mt-3">
                    {CENTER_DATA.hero.title}
                  </span>
                </h1>
                
                <div className="bg-electric-blue/5 border-r-4 border-r-electric-blue rounded-xl p-4 sm:p-5 my-6 text-right max-w-2xl mx-auto lg:mx-0 shadow-md">
                  <p className="text-base sm:text-lg font-bold text-gray-200 flex items-center gap-2">
                    <Search className="w-5 h-5 text-electric-blue shrink-0" aria-hidden="true" />
                    <span>فحص وتشخيص أعطال السيارات بدقة قبل تغيير القطع</span>
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400 mt-1.5 font-medium leading-relaxed">
                    {CENTER_DATA.slogan}
                  </p>
                </div>

                <p className="text-sm sm:text-base text-gray-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-semibold">
                  {CENTER_DATA.hero.desc}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <a
                    href={`https://wa.me/${CENTER_DATA.whatsapp}?text=أرغب في حجز موعد لفحص سيارتي`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-cairo-play bg-electric-blue hover:bg-electric-blue-hover text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-electric-blue/30 border border-white/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <IconMapper name="Zap" className="w-5 h-5" />
                    <span>{CENTER_DATA.hero.btn1Text}</span>
                  </a>
                  <a
                    href={`tel:${CENTER_DATA.phone}`}
                    className="font-cairo-play bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white px-8 py-4 rounded-xl text-base font-bold border border-white/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5 text-warning-amber" />
                    <span>{CENTER_DATA.hero.btn2Text}</span>
                  </a>
                </div>

                {/* Trust Indicators */}
                <div className="pt-8 border-t border-white/5">
                  <p className="text-xs sm:text-sm text-gray-400 font-bold mb-4">فحوصات متكاملة تغطي كافة الاحتياجات:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { text: "فحص كمبيوتر", label: "Scanner diag" },
                      { text: "تشخيص أعطال", label: "Fault analysis" },
                      { text: "برمجة سيارات", label: "ECU Coding" },
                      { text: "بنزين وهايبرد وكهرباء", label: "All drivetrains" }
                    ].map((badge, idx) => (
                      <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5 hover:border-electric-blue/20 transition-colors text-right">
                        <div className="text-xs text-electric-blue font-bold tracking-wider uppercase mb-1">{badge.label}</div>
                        <div className="text-sm font-bold text-gray-200">{badge.text}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Hero Visual - Premium SVG Diagnostics Wireframe */}
              <div className="lg:col-span-5 relative w-full flex justify-center items-center z-10">
                <div className="relative w-full max-w-[450px] aspect-square rounded-2xl glass-panel-glow border border-electric-blue/20 p-6 flex flex-col justify-between overflow-hidden">
                  
                  {/* SVG Scanning Grid */}
                  <div className="absolute inset-0 bg-[radial-gradient(#00daf310_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />
                  
                  {/* Laser scan line animates over the car SVG */}
                  <div className="absolute left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-electric-blue to-transparent shadow-[0_0_15px_#00daf3] z-20 animate-scan pointer-events-none" />

                  {/* Tech Dashboard Top Bar */}
                  <div className="flex justify-between items-center text-[10px] sm:text-xs text-gray-400 font-mono border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      <span className="text-gray-300 font-bold">SMART DIAGNOSTIC V4.6</span>
                    </div>
                    <div>OBDII CONNECTED</div>
                  </div>

                  {/* SVG Car Wireframe */}
                  <div className="my-auto w-full flex justify-center items-center relative py-4">
                    <svg className="w-full h-auto max-h-[220px]" viewBox="0 0 400 180" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Background glows */}
                      <ellipse cx="200" cy="115" rx="140" ry="40" fill="url(#blueGlow)" opacity="0.4" />
                      
                      {/* Car Outline Wireframe */}
                      <path d="M40,115 L60,115 C60,100 80,85 100,85 L140,85 C145,85 150,75 160,65 L210,50 L270,50 L310,85 L350,95 L375,108 C382,111 385,117 385,123 L385,135 L360,135 C360,123 345,115 330,115 C315,115 300,123 300,135 L160,135 C160,123 145,115 130,115 C115,115 100,123 100,135 L50,135 C42,135 35,128 35,120 L35,117 C35,116 38,115 40,115 Z" 
                        stroke="#00daf3" strokeWidth="2.5" strokeDasharray="3 3" className="opacity-90" />
                      <path d="M40,115 L60,115 C60,100 80,85 100,85 L140,85 C145,85 150,75 160,65 L210,50 L270,50 L310,85 L350,95 L375,108 C382,111 385,117 385,123 L385,135 L360,135 C360,123 345,115 330,115 C315,115 300,123 300,135 L160,135 C160,123 145,115 130,115 C115,115 100,123 100,135 L50,135 C42,135 35,128 35,120 L35,117 C35,116 38,115 40,115 Z" 
                        stroke="#00daf3" strokeWidth="1.5" className="animate-pulse" />

                      {/* Windshield & Windows */}
                      <path d="M165,66 L210,53 L265,53 L303,85 L260,85 L200,85 Z" stroke="#00d4ff" strokeWidth="1.5" />
                      <line x1="230" y1="53" x2="230" y2="85" stroke="#00d4ff" strokeWidth="1" />

                      {/* Wheels */}
                      <circle cx="130" cy="135" r="24" stroke="#00daf3" strokeWidth="2" fill="#0b1326" />
                      <circle cx="130" cy="135" r="16" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="130" cy="135" r="6" fill="#00daf3" />

                      <circle cx="330" cy="135" r="24" stroke="#00daf3" strokeWidth="2" fill="#0b1326" />
                      <circle cx="330" cy="135" r="16" stroke="#00d4ff" strokeWidth="1" strokeDasharray="2 2" />
                      <circle cx="330" cy="135" r="6" fill="#00daf3" />

                      {/* Sensor Scanning Nodes (glowing dots) */}
                      {/* Engine block sensor */}
                      <circle cx="90" cy="100" r="4" fill="#ff5c00" className="animate-ping" />
                      <circle cx="90" cy="100" r="3" fill="#ff5c00" />
                      <line x1="90" y1="100" x2="65" y2="60" stroke="#ff5c00" strokeWidth="1" />
                      <text x="50" y="52" fill="#ff5c00" fontSize="10" fontFamily="monospace" fontWeight="bold">ENGINE FAULT</text>

                      {/* Hybrid battery pack sensor */}
                      <circle cx="215" cy="115" r="4" fill="#00d4ff" className="animate-ping" />
                      <circle cx="215" cy="115" r="3" fill="#00d4ff" />
                      <line x1="215" y1="115" x2="215" y2="155" stroke="#00d4ff" strokeWidth="1" />
                      <text x="195" y="167" fill="#00d4ff" fontSize="10" fontFamily="monospace" fontWeight="bold">BATTERY: 94%</text>

                      {/* ABS / Brake sensor */}
                      <circle cx="330" cy="135" r="4" fill="#ff9f1c" className="animate-ping" />
                      <circle cx="330" cy="135" r="3" fill="#ff9f1c" />

                      {/* ECU Node */}
                      <circle cx="150" cy="95" r="4" fill="#1e6ffa" className="animate-ping" />
                      <circle cx="150" cy="95" r="3" fill="#1e6ffa" />
                      <line x1="150" y1="95" x2="165" y2="40" stroke="#1e6ffa" strokeWidth="1" />
                      <text x="145" y="32" fill="#1e6ffa" fontSize="10" fontFamily="monospace" fontWeight="bold">ECU: ONLINE</text>

                      {/* Gradient Definitions */}
                      <defs>
                        <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
                          <stop offset="0%" stopColor="#1e6ffa" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#1e6ffa" stopOpacity="0" />
                        </radialGradient>
                      </defs>
                    </svg>
                  </div>

                  {/* Tech Dashboard Bottom Bar */}
                  <div className="border-t border-white/5 pt-3 grid grid-cols-3 gap-2 text-center text-[10px] font-mono text-gray-400">
                    <div>
                      <div className="text-gray-300 font-bold">SYSTEM</div>
                      <div className="text-green-500 font-bold">SECURE</div>
                    </div>
                    <div>
                      <div className="text-gray-300 font-bold">DIAGNOSIS</div>
                      <div className="text-electric-blue font-bold">SCANNING</div>
                    </div>
                    <div>
                      <div className="text-gray-300 font-bold">ERRORS</div>
                      <div className="text-[#ff5c00] font-bold">02 DETECTED</div>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 3. EDUCATIONAL SLOGAN SECTION */}
      <section className="relative -mt-10 mb-20 z-20 max-w-5xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-r from-warning-orange/10 via-[#ff9f1c1f] to-warning-orange/10 border-2 border-warning-amber/40 shadow-2xl shadow-warning-amber/5">
          <div className="absolute inset-0 bg-stripes opacity-20 pointer-events-none" />
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-right">
            <div className="flex items-center gap-4 flex-col md:flex-row">
              <div className="w-14 h-14 rounded-full bg-warning-orange/20 flex items-center justify-center text-warning-amber border border-warning-amber/30 shrink-0 animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div>
                <p className="text-warning-amber text-xs sm:text-sm font-black tracking-wider uppercase mb-1">القاعدة الأساسية لفحص وصيانة السيارات الحديثة</p>
                <h2 className="font-cairo-play text-xl sm:text-2xl md:text-3xl font-bold text-white leading-tight">
                  &quot;لا تغيّر قطع قبل أن تعرف سبب العطل الحقيقي.&quot;
                </h2>
              </div>
            </div>
            <a
              href="#contact"
              className="font-cairo-play bg-warning-amber hover:bg-orange-500 text-black px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 shrink-0 shadow-lg shadow-warning-amber/20 hover:shadow-orange-500/40"
            >
              افحص الآن ووفر مالك
            </a>
          </div>
        </div>
      </section>

      {/* 3.5. VEHICLE TYPES WE SERVE */}
      {CENTER_DATA.sectionsVisibility.carTypes && (
        <section className="py-20 relative bg-stripes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">تخصصنا شامل ومتكامل</p>
              <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                أنواع السيارات التي نخدمها في المركز
              </h2>
              <p className="text-base text-gray-400 font-medium">
                سواء كنت تقود سيارة تقليدية أو حديثة صديقة للبيئة، نوفر لك تشخيصاً هندسياً وصيانة متكاملة.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {CENTER_DATA.carTypes.filter(car => car.active !== false).map((car, idx) => (
                <div 
                  key={idx} 
                  className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#11141d]/80 to-[#0c0f17]/80 hover:border-electric-blue/25 hover:shadow-2xl hover:shadow-electric-blue/5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Image container with next/image */}
                  <div className="relative w-full h-[220px] bg-slate-950 overflow-hidden shrink-0">
                    <Image 
                      src={
                        car.image && car.image !== "/electric.png" && car.image !== "/hybrid.png" && car.image !== "/defualt.png"
                          ? car.image
                          : car.title.includes("كهرب") 
                            ? (CENTER_DATA.images.electric || "/images/car-types-split.png")
                            : car.title.includes("هايب")
                              ? (CENTER_DATA.images.hybrid || "/images/hv-battery.png")
                              : (CENTER_DATA.images.defaultCar || "/images/diagnostics-tablet.png")
                      } 
                      alt={car.title}
                      fill
                      sizes="(max-w-768px) 100vw, (max-w-1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                    />
                    {/* Overlay shadow gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/20 to-transparent" />
                    {/* Glowing border line at the bottom of the image */}
                    <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-electric-blue/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-electric-blue transition-colors">
                        {car.title}
                      </h3>
                      <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed font-medium">
                        {car.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 4. SERVICES SECTION */}
      {CENTER_DATA.sectionsVisibility.services && (
        <section id="services" className="py-20 bg-[#0c0f17] border-y border-white/5 relative bg-stripes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">ماذا يقدم المركز؟</p>
              <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                خدمات الفحص والصيانة الذكية
              </h2>
              <p className="text-base text-gray-400 font-medium">
                نقدم باقة متكاملة من فحوصات السيارات الكهربائية، الهايبرد، والبنزين بأحدث الأنظمة الإلكترونية والأجهزة الهندسية لضمان كفاءة التشخيص.
              </p>
            </div>

            <div className="space-y-16">
              {CENTER_DATA.services.filter(service => service.active !== false).map((service, idx) => {
                const isEven = idx % 2 === 0;
                return (
                  <div 
                    key={service.id} 
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
                  >
                    {/* Visual Image Card (lg:col-span-5) */}
                    <div className={`lg:col-span-5 relative group order-2 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                      <div className="absolute -inset-4 bg-electric-blue/5 rounded-2xl blur-2xl group-hover:bg-electric-blue/10 transition-all duration-500" />
                      <div className="relative rounded-2xl overflow-hidden glass-panel border border-white/10 h-[240px] sm:h-[280px] w-full">
                        <Image 
                          src={service.image || "/images/diagnostics-tablet.png"}
                          alt={service.title}
                          fill
                          sizes="(max-w-768px) 100vw, 40vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-700 opacity-60 group-hover:opacity-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-transparent to-transparent opacity-80" />
                      </div>
                    </div>

                    {/* Content Section (lg:col-span-7) */}
                    <div className={`lg:col-span-7 space-y-6 order-1 ${isEven ? 'lg:order-2' : 'lg:order-1'} text-right`}>
                      <div className="flex items-center gap-4 justify-start">
                        <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-electric-blue">
                          <IconMapper name={service.icon} className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-cairo-play">
                          {service.title}
                        </h3>
                      </div>
                      
                      <p className="text-base text-gray-300 leading-relaxed font-medium">
                        {service.desc}
                      </p>

                      <div className="pt-4 flex flex-wrap gap-4 justify-start">
                        <a
                          href={`https://wa.me/${CENTER_DATA.whatsapp}?text=أرغب في الاستفسار عن خدمة: ${service.title}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-cairo-play bg-electric-blue/10 hover:bg-electric-blue text-electric-blue hover:text-black px-6 py-3 rounded-xl text-sm font-bold border border-electric-blue/30 transition-all duration-300 flex items-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>استفسر عبر واتساب</span>
                        </a>
                        <a
                          href={`tel:${CENTER_DATA.phone}`}
                          className="font-cairo-play bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white px-6 py-3 rounded-xl text-sm font-bold border border-white/10 transition-all duration-300 flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4 text-warning-amber" />
                          <span>احجز موعد فحص</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 4.5. PROCESS SECTION (كيف تتم الخدمة؟) */}
      <section id="process" className="py-20 relative border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">آلية العمل</p>
            <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              كيف تتم الخدمة في مركزنا؟
            </h2>
            <p className="text-base text-gray-400 font-medium">
              منهجية هندسية واضحة ومبسطة تضمن لك دقة التشخيص وتجنب الصيانة العشوائية.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line on desktop */}
            <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 border-t border-dashed border-white/10 -translate-y-12 z-0" />
            
            {[
              {
                step: "01",
                title: "التواصل والطلب",
                desc: "تواصل معنا مباشرة عبر الهاتف أو الواتساب، وأرسل لنا وصف المشكلة أو الأعطال.",
                icon: <MessageSquare className="w-6 h-6 text-electric-blue" />
              },
              {
                step: "02",
                title: "حجز موعد فحص",
                desc: "نحدد لك موعداً دقيقاً للفحص لتفادي الانتظار وتوفير وقتك الثمين.",
                icon: <Calendar className="w-6 h-6 text-[#00d4ff]" />
              },
              {
                step: "03",
                title: "فحص وتشخيص دقيق",
                desc: "نقوم بفحص السيارة بأحدث الأنظمة الذكية لتشخيص السبب الحقيقي للعطل.",
                icon: <Search className="w-6 h-6 text-warning-amber" />
              },
              {
                step: "04",
                title: "شرح الحل والتكلفة",
                desc: "نشرح لك المشكلة وخطة الإصلاح مع التكلفة بالتفصيل قبل أن نبدأ بأي عمل.",
                icon: <CheckCircle className="w-6 h-6 text-green-400" />
              }
            ].map((item, idx) => (
              <div key={idx} className="group relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-[#11141d]/80 to-[#0c0f17]/80 hover:border-electric-blue/25 hover:shadow-2xl hover:shadow-electric-blue/5 transition-all duration-300 p-6 flex flex-col space-y-4 z-10">
                <div className="flex justify-between items-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                    {item.icon}
                  </div>
                  <span className="text-3xl font-black font-cairo-play text-white/5 group-hover:text-electric-blue/25 transition-colors">
                    {item.step}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-electric-blue transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300 leading-relaxed font-medium">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 5. PROBLEMS SECTION */}
      {CENTER_DATA.sectionsVisibility.problems && (
        <section id="problems" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <p className="text-xs sm:text-sm font-extrabold text-[#ff5c00] uppercase tracking-widest">هل تعاني من هذه المشاكل؟</p>
              <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                أعطال شائعة نقوم بتشخيصها وحلها
              </h2>
              <p className="text-base text-gray-400 font-medium">
                السيارات الحديثة مليئة بالحساسات والأنظمة المتداخلة. نحن هنا لنكتشف السبب الدقيق للمشكلة وليس مجرد قراءة أكواد.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {CENTER_DATA.problems.map((problem, idx) => (
                <div 
                  key={idx} 
                  className="glass-panel hover:bg-white/5 rounded-xl p-5 border-r-4 border-r-warning-orange border-y border-white/5 hover:border-y-white/10 transition-all duration-200"
                >
                  <div className="text-[10px] font-mono text-warning-amber font-bold mb-1 tracking-wider">{problem.code}</div>
                  <h3 className="text-base font-bold text-white group-hover:text-warning-amber transition-colors">
                    {problem.title}
                  </h3>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 6. WHY US SECTION */}
      {CENTER_DATA.sectionsVisibility.whyUs && (
        <section id="why-us" className="py-20 bg-[#0c0f17] border-y border-white/5 relative bg-stripes">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">تميزنا في مجال الصيانة</p>
              <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                لماذا تختار {CENTER_DATA.name}؟
              </h2>
              <p className="text-base text-gray-400 font-medium">
                لسنا مجرد كراج عشوائي؛ بل نعتمد على العلم والهندسة والأجهزة التقنية لتشخيص المشاكل بدقة وتجنب الخسائر المالية.
              </p>
            </div>

            {/* Hexagon/Circle Featured Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {CENTER_DATA.whyUs.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center space-y-4 p-6 glass-panel rounded-2xl relative border border-white/5 hover:border-electric-blue/15 transition-all">
                  {/* Hexagonal styled icon container */}
                  <div className="relative w-16 h-16 flex items-center justify-center text-white shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-tr from-electric-blue to-[#00d4ff] transform rotate-45 rounded-xl opacity-20" />
                    <div className="absolute inset-0 border border-electric-blue/30 transform -rotate-12 rounded-xl" />
                    <div className="relative z-10 text-electric-blue">
                      <IconMapper name={item.icon} className="w-8 h-8" />
                    </div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-white pt-2">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 7. SALES / VALUE MESSAGE SECTION */}
      <section className="py-20 relative overflow-hidden bg-stripes">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="glass-panel-glow border border-electric-blue/20 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden">
            <div className="absolute -top-16 -left-16 w-32 h-32 bg-electric-blue/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-warning-amber/10 rounded-full blur-2xl" />
            
            <p className="text-xs sm:text-sm font-extrabold text-warning-amber uppercase tracking-widest">توعية مالية وفنية</p>
            <h2 className="font-cairo-play text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight">
              الفحص الصحيح يوفر عليك تكلفة الإصلاح العشوائي
            </h2>
            
            <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-medium">
              كثير من مشاكل السيارات لا تحتاج إلى تغيير قطع كثيرة ومكلفة، بل تحتاج إلى تشخيص صحيح للمشكلة من البداية. لذلك نبدأ بفحص السيارة وقراءة الأعطال، ثم تحليل السبب الحقيقي بدقة متناهية، ونشرح لك المشكلة وحلها الفني المناسب بالتفصيل قبل القيام بأي صيانة أو فك أي قطعة في مركبتك.
            </p>

            <div className="pt-4 flex flex-wrap gap-4 justify-center">
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-electric-blue" /> بدون تغيير قطع عشوائي
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-[#00d4ff]" /> أحدث تكنولوجيا الفحص
              </span>
              <span className="px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-warning-amber" /> مهندسون متخصصون
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* 8. CTA SECTION */}
      {CENTER_DATA.sectionsVisibility.cta && (
        <section className="py-16 bg-gradient-to-r from-[#0b101d] via-[#121c33] to-[#0b101d] border-y border-white/5 relative">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white">جاهز لفحص سيارتك؟</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto font-medium">
              احجز فحص سيارتك الآن واعرف سبب العطل الحقيقي ووفر على نفسك تكاليف التجارب.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a
                href={`https://wa.me/${CENTER_DATA.whatsapp}?text=أرغب في حجز موعد لفحص سيارتي`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-cairo-play bg-electric-blue hover:bg-electric-blue-hover text-white px-8 py-4 rounded-xl text-base font-bold shadow-lg shadow-electric-blue/30 border border-white/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Zap className="w-5 h-5" />
                <span>واتساب</span>
              </a>
              <a
                href={`tel:${CENTER_DATA.phone}`}
                className="font-cairo-play bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white px-8 py-4 rounded-xl text-base font-bold border border-white/10 transition-all duration-300 transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <Phone className="w-5 h-5 text-warning-amber" />
                <span>اتصال</span>
              </a>
            </div>
          </div>
        </section>
      )}

      {/* 9. FAQ SECTION */}
      {CENTER_DATA.sectionsVisibility.faq && (
        <section id="faq" className="py-20 relative bg-stripes">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">تساؤلات فنية وإجابات واضحة</p>
              <h2 className="font-cairo-play text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
                الأسئلة الشائعة حول فحص وصيانة السيارات
              </h2>
              <p className="text-base text-gray-400 font-medium">
                إليك إجابات الأسئلة الهامة التي تساعدك في فهم آليات الفحص المتبعة ومستويات الدقة التي نوفرها.
              </p>
            </div>

            {/* Accordion list */}
            <div className="space-y-4">
              {CENTER_DATA.faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div 
                    key={idx} 
                    className={`rounded-2xl transition-all duration-300 border ${
                      isOpen 
                        ? "glass-panel-glow border-electric-blue/20" 
                        : "glass-panel border-white/5 hover:border-white/10"
                    }`}
                  >
                    <button
                      id={`faq-btn-${idx}`}
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${idx}`}
                      className="w-full px-6 py-5 flex items-center justify-between text-right font-bold text-white text-base sm:text-lg hover:text-electric-blue transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric-blue focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1326] rounded-t-2xl"
                    >
                      <span>{faq.q}</span>
                      <span className={`p-1 rounded-lg bg-white/5 text-gray-400 group-hover:text-white transition-transform ${isOpen ? "rotate-180 text-electric-blue" : ""}`}>
                        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    </button>
                    
                    {isOpen && (
                      <div 
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-btn-${idx}`}
                        className="px-6 pb-6 text-sm sm:text-base text-gray-400 leading-relaxed font-medium border-t border-white/5 pt-4 animate-fadeIn"
                      >
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* 10. CONTACT SECTION */}
      {CENTER_DATA.sectionsVisibility.contact && (
        <section id="contact" className="py-20 bg-[#0c0f17] border-t border-white/5 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
              
              {/* Contact Details Column */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-4">
                  <p className="text-xs sm:text-sm font-extrabold text-electric-blue uppercase tracking-widest">معلومات الاتصال والموقع</p>
                  <h2 className="font-cairo-play text-3xl sm:text-4xl font-bold text-white leading-tight">تفضل بزيارتنا أو تواصل معنا</h2>
                  <p className="text-base text-gray-400 font-medium leading-relaxed">
                    نحن متواجدون لمساعدتك في فحص وتشخيص سيارتك. تواصل معنا مسبقاً لحجز موعد لضمان عدم الانتظار وتلقي الخدمة في أسرع وقت.
                  </p>
                </div>

                <div className="space-y-4">
                  {/* Location */}
                  <div className="flex items-start gap-4 p-4 glass-panel rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue border border-electric-blue/20 shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs text-gray-400 font-bold mb-1">الموقع الجغرافي</h3>
                      <p className="text-sm sm:text-base font-bold text-white">{CENTER_DATA.location}</p>
                      <p className="text-xs text-gray-400 font-medium pt-1">{CENTER_DATA.locationDetail}</p>
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-4 p-4 glass-panel rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue border border-electric-blue/20 shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs text-gray-400 font-bold mb-1">ساعات العمل</h3>
                      <p className="text-sm sm:text-base font-bold text-white">{CENTER_DATA.workingHoursDisplay}</p>
                    </div>
                  </div>

                  {/* Direct Contact */}
                  <div className="flex items-start gap-4 p-4 glass-panel rounded-xl border border-white/5">
                    <div className="w-10 h-10 rounded-lg bg-electric-blue/10 flex items-center justify-center text-electric-blue border border-electric-blue/20 shrink-0">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs text-gray-400 font-bold mb-1">الهاتف وواتساب</h3>
                      <p className="text-sm sm:text-base font-bold text-white">هاتف: {CENTER_DATA.phoneDisplay}</p>
                      <p className="text-xs text-gray-400 font-medium pt-1">واتساب: {CENTER_DATA.phoneDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* Instant Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <a
                    href={CENTER_DATA.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-cairo-play bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white py-3.5 px-6 rounded-xl text-sm font-bold border border-white/10 flex items-center justify-center gap-2 transition-all flex-1"
                  >
                    <MapPin className="w-5 h-5 text-warning-orange" />
                    <span>افتح الموقع على خرائط Google</span>
                  </a>
                  <a
                    href={`https://wa.me/${CENTER_DATA.whatsapp}?text=أرغب في الاستفسار عن خدمة فحص السيارات`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-cairo-play bg-electric-blue hover:bg-electric-blue-hover text-white py-3.5 px-6 rounded-xl text-sm font-bold border border-white/10 flex items-center justify-center gap-2 shadow-lg shadow-electric-blue/20 transition-all flex-1"
                  >
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.773 1.226h.004c5.505 0 9.989-4.478 9.99-9.984A9.97 9.97 0 0 0 12.012 2zm5.82 14.161c-.3.84-1.491 1.568-2.051 1.621-.56.051-1.11.271-3.6-0.73-3.189-1.28-5.229-4.52-5.389-4.731-.16-.21-1.28-1.7-1.28-3.24 0-1.54.8-2.3 1.09-2.6.29-.3.63-.37.84-.37.21 0 .42.01.6.01.19 0 .44-.08.69.51.26.62.88 2.14.96 2.3.08.16.13.35.03.55-.1.21-.15.34-.3.52-.15.18-.32.41-.45.55-.15.15-.31.32-.13.62.18.3.82 1.36 1.76 2.2 1.21 1.08 2.22 1.41 2.53 1.56.31.15.49.13.67-.08.18-.21.79-.92.99-1.23.21-.31.42-.26.71-.15.3.11 1.89.89 2.21 1.05.32.16.54.24.62.38.08.14.08.82-.22 1.66z" />
                    </svg>
                    <span>تواصل واتساب</span>
                  </a>
                  <a
                    href={`tel:${CENTER_DATA.phone}`}
                    className="font-cairo-play bg-white/5 hover:bg-white/10 text-gray-200 hover:text-white py-3.5 px-6 rounded-xl text-sm font-bold border border-white/10 flex items-center justify-center gap-2 transition-all flex-1"
                  >
                    <Phone className="w-5 h-5 text-warning-amber" />
                    <span>اتصال مباشر</span>
                  </a>
                </div>
              </div>

              {/* Map Placeholder or Visual Illustration */}
              <div className="lg:col-span-7 w-full h-full min-h-[350px] lg:min-h-[480px] relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                {/* Modern UI map representation with real-world layout design style */}
                <div className="absolute inset-0 flex flex-col justify-between p-6">
                  {/* Map background image from the new design */}
                  <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-[#0b1326]/70 via-[#0b1326]/55 to-[#0b1326]/85 z-10" />
                    <Image
                      src="/images/map-bg.png"
                      alt=""
                      fill
                      className="object-cover opacity-20 grayscale"
                    />
                  </div>
                  
                  {/* Tech navigation header bar */}
                  <div className="glass-panel border border-white/5 rounded-xl p-4 flex items-center justify-between text-xs sm:text-sm text-gray-300 relative z-10">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-electric-blue" />
                      <span className="font-bold">موقع {CENTER_DATA.name}</span>
                    </div>
                    <div className="text-gray-400">عمّان، الأردن</div>
                  </div>
                  
                  {/* Visual map graphics (grid, roads, pins) */}
                  <div className="my-auto relative w-full h-[220px] sm:h-[300px] overflow-hidden rounded-xl border border-white/5 bg-[#131b2e]/40 backdrop-blur-sm z-10">
                    <div className="absolute inset-0 bg-[radial-gradient(#00daf315_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                    
                    {/* Road 1 */}
                    <div className="absolute left-[30%] top-0 bottom-0 w-[40px] bg-slate-800/60 transform rotate-12" />
                    {/* Road 2 */}
                    <div className="absolute left-0 right-0 top-[40%] h-[35px] bg-slate-800/60 transform -rotate-6" />
                    {/* Intersection Road */}
                    <div className="absolute left-[70%] top-0 bottom-0 w-[45px] bg-slate-800/60 transform -rotate-45" />

                    {/* Marker Pin */}
                    <div className="absolute left-[45%] top-[38%] transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                      <span className="absolute w-8 h-8 rounded-full bg-electric-blue/30 animate-ping" />
                      <span className="absolute w-12 h-12 rounded-full bg-electric-blue/15 animate-pulse" />
                      <div className="relative z-10 w-10 h-10 rounded-full bg-electric-blue flex items-center justify-center text-white border-2 border-white shadow-lg">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div className="mt-2.5 px-3 py-1 rounded bg-[#080a0f] border border-electric-blue/30 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
                        {CENTER_DATA.name}
                      </div>
                    </div>

                    {/* Surrounding landmarks */}
                    <div className="absolute left-[15%] top-[20%] text-[9px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">طريق الملك عبدالله الثاني</div>
                    <div className="absolute left-[75%] top-[75%] text-[9px] text-gray-500 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">المنطقة الصناعية</div>
                  </div>

                  {/* Tech navigation footer bar */}
                  <a
                    href={CENTER_DATA.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-cairo-play w-full bg-electric-blue hover:bg-electric-blue-hover text-white text-center py-3.5 rounded-xl text-sm font-bold border border-white/10 transition-all flex items-center justify-center gap-2 relative z-10"
                  >
                    <MapPin className="w-4 h-4" />
                    <span>انقر هنا لفتح الموقع الجغرافي على خرائط Google وتحديد الاتجاهات</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}
      </main>

      {/* 11. FOOTER SECTION */}
      <footer className="bg-[#080a0f] border-t border-white/5 pt-12 pb-24 sm:pb-12 text-sm text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
            
            {/* Column 1 - Brand */}
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                {CENTER_DATA.images.logo ? (
                  <div className="h-8 flex items-center">
                    <Image
                      src={`${CENTER_DATA.images.logo}?v=${CENTER_DATA.updatedAt || "1"}`} 
                      width={120}
                      height={32}
                      className="h-8 w-auto max-w-[120px] object-contain rounded-lg" 
                      alt={CENTER_DATA.name} 
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-white border border-white/10 overflow-hidden">
                    {CENTER_DATA.images.favicon ? (
                      <Image
                        src={`${CENTER_DATA.images.favicon}?v=${CENTER_DATA.updatedAt || "1"}`} 
                        width={32}
                        height={32}
                        className="w-full h-full object-cover" 
                        alt={CENTER_DATA.name} 
                      />
                    ) : (
                      <Cpu className="w-5 h-5" />
                    )}
                  </div>
                )}
                <span className="font-extrabold text-lg sm:text-xl text-white">
                  {CENTER_DATA.name}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 leading-relaxed font-medium">
                {CENTER_DATA.locationDetail} وتشخيص أعطالها بدقة متناهية.
              </p>
              <div className="text-xs text-gray-500">
                ساعات العمل: {CENTER_DATA.workingHoursDisplay}
              </div>
            </div>

            {/* Column 2 - Links */}
            <div className="md:col-span-3 space-y-3">
              <h2 className="font-cairo-play font-bold text-white text-sm">روابط سريعة</h2>
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
                <a href="#" className="hover:text-electric-blue transition-colors">الرئيسية</a>
                <a href="#services" className="hover:text-electric-blue transition-colors">الخدمات</a>
                <a href="#problems" className="hover:text-electric-blue transition-colors">الأعطال الشائعة</a>
                <a href="#why-us" className="hover:text-electric-blue transition-colors">لماذا نحن</a>
                <a href="#faq" className="hover:text-electric-blue transition-colors">الأسئلة الشائعة</a>
                <a href="#contact" className="hover:text-electric-blue transition-colors">تواصل معنا</a>
              </div>
            </div>

            {/* Column 3 - Contact Info details */}
            <div className="md:col-span-4 space-y-3">
              <h2 className="font-cairo-play font-bold text-white text-sm">تواصل معنا</h2>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-electric-blue" />
                  <span>مباشر: {CENTER_DATA.phoneDisplay}</span>
                </li>
                <li className="flex items-center gap-2">
                  <IconMapper name="Zap" className="w-4 h-4 text-[#00d4ff]" />
                  <span>واتساب: {CENTER_DATA.phoneDisplay}</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-warning-amber" />
                  <span>{CENTER_DATA.location}</span>
                </li>
              </ul>
            </div>

          </div>

          <div className="border-t border-white/5 mt-10 pt-6 text-center text-xs text-gray-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} {CENTER_DATA.name}. جميع الحقوق محفوظة.</p>
            <p className="font-bold">فحص وتشخيص هندسي حقيقي يوفر المال والجهد.</p>
          </div>
        </div>
      </footer>

      {/* ==========================================
          FLOATING WIDGETS (DESKTOP) & MOBILE BOTTOM BAR
      ========================================== */}
      
      {/* Floating WhatsApp Button (Bottom Left - Desktop Only) */}
      <a
        href={`https://wa.me/${CENTER_DATA.whatsapp}?text=أرغب في الاستفسار عن صيانة سيارتي`}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden sm:flex fixed bottom-6 left-6 z-50 w-14 h-14 rounded-full bg-[#25d366] hover:bg-[#20ba5a] text-white items-center justify-center shadow-xl shadow-green-500/20 hover:shadow-green-500/40 border border-white/10 hover:scale-110 transition-all duration-300"
        title="تواصل عبر الواتساب"
        aria-label="التواصل عبر واتساب"
      >
        <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.773 1.226h.004c5.505 0 9.989-4.478 9.99-9.984A9.97 9.97 0 0 0 12.012 2zm5.82 14.161c-.3.84-1.491 1.568-2.051 1.621-.56.051-1.11.271-3.6-0.73-3.189-1.28-5.229-4.52-5.389-4.731-.16-.21-1.28-1.7-1.28-3.24 0-1.54.8-2.3 1.09-2.6.29-.3.63-.37.84-.37.21 0 .42.01.6.01.19 0 .44-.08.69.51.26.62.88 2.14.96 2.3.08.16.13.35.03.55-.1.21-.15.34-.3.52-.15.18-.32.41-.45.55-.15.15-.31.32-.13.62.18.3.82 1.36 1.76 2.2 1.21 1.08 2.22 1.41 2.53 1.56.31.15.49.13.67-.08.18-.21.79-.92.99-1.23.21-.31.42-.26.71-.15.3.11 1.89.89 2.21 1.05.32.16.54.24.62.38.08.14.08.82-.22 1.66z" />
        </svg>
      </a>

      {/* Floating Chatbot Button (Bottom Right - Desktop Only) */}
      {CENTER_DATA.sectionsVisibility.chatbot && (
        <button
          onClick={() => setChatOpen(true)}
          className="hidden sm:flex fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-electric-blue hover:bg-electric-blue-hover text-white items-center justify-center shadow-xl shadow-electric-blue/20 hover:shadow-electric-blue/40 border border-white/10 hover:scale-110 transition-all duration-300"
          title="المساعد الذكي"
          aria-label="فتح المساعد التفاعلي"
          aria-expanded={chatOpen}
          aria-controls="chatbot-dialog"
        >
          <Bot className="w-7 h-7" />
        </button>
      )}

      {/* Unified Mobile Bottom Bar (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0d0f17]/95 backdrop-blur-md border-t border-white/10 py-2.5 px-4 flex justify-between items-center gap-3 sm:hidden animate-slideUp">
        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${CENTER_DATA.whatsapp}?text=مرحباً، أرغب في الاستفسار عن صيانة وفحص سيارتي`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-[#25d366] hover:bg-[#20ba5a] text-white py-2.5 px-2 rounded-xl text-xs font-bold font-cairo-play flex items-center justify-center gap-1.5 transition-all shadow-md shadow-green-500/10"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.773 1.226h.004c5.505 0 9.989-4.478 9.99-9.984A9.97 9.97 0 0 0 12.012 2zm5.82 14.161c-.3.84-1.491 1.568-2.051 1.621-.56.051-1.11.271-3.6-0.73-3.189-1.28-5.229-4.52-5.389-4.731-.16-.21-1.28-1.7-1.28-3.24 0-1.54.8-2.3 1.09-2.6.29-.3.63-.37.84-.37.21 0 .42.01.6.01.19 0 .44-.08.69.51.26.62.88 2.14.96 2.3.08.16.13.35.03.55-.1.21-.15.34-.3.52-.15.18-.32.41-.45.55-.15.15-.31.32-.13.62.18.3.82 1.36 1.76 2.2 1.21 1.08 2.22 1.41 2.53 1.56.31.15.49.13.67-.08.18-.21.79-.92.99-1.23.21-.31.42-.26.71-.15.3.11 1.89.89 2.21 1.05.32.16.54.24.62.38.08.14.08.82-.22 1.66z" />
          </svg>
          <span>واتساب</span>
        </a>

        {/* Direct Call Button */}
        <a
          href={`tel:${CENTER_DATA.phone}`}
          className="flex-1 bg-warning-amber hover:bg-orange-500 text-black py-2.5 px-2 rounded-xl text-xs font-bold font-cairo-play flex items-center justify-center gap-1.5 transition-all shadow-md shadow-warning-amber/10"
        >
          <Phone className="w-4 h-4" />
          <span>اتصال</span>
        </a>

        {/* AI Chatbot Button */}
        {CENTER_DATA.sectionsVisibility.chatbot && (
          <button
            onClick={() => setChatOpen(true)}
            className="flex-1 bg-electric-blue hover:bg-electric-blue-hover text-white py-2.5 px-2 rounded-xl text-xs font-bold font-cairo-play flex items-center justify-center gap-1.5 transition-all shadow-md shadow-electric-blue/10"
          >
            <Bot className="w-4 h-4" />
            <span>شات</span>
          </button>
        )}
      </div>

      {/* Chatbot Window (Modal/Card Popup) */}
      {CENTER_DATA.sectionsVisibility.chatbot && chatOpen && (
        <div id="chatbot-dialog" role="dialog" aria-label="المساعد التفاعلي" className="fixed bottom-20 left-4 right-4 sm:bottom-24 sm:left-auto sm:right-6 sm:w-[380px] h-[460px] z-50 glass-panel-glow border border-electric-blue/20 rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-slideUp">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-electric-blue/20 via-[#0f1422] to-electric-blue/10 px-4 py-3.5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-white">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="text-right">
                <h2 className="text-sm font-bold text-white font-cairo-play">المساعد الذكي</h2>
                <p className="text-[9px] text-green-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping inline-block" />
                  <span>متصل للرد الفوري</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`https://wa.me/${CENTER_DATA.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25d366] hover:bg-[#20ba5a] text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                <span>تواصل واتساب</span>
              </a>
              <button
                onClick={() => {
                  setChatOpen(false);
                }}
                className="min-w-11 min-h-11 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-center"
                aria-label="إغلاق المساعد"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Chat Description Banner */}
          <div className="bg-[#111625] px-4 py-2 border-b border-white/5 text-right text-[11px] text-gray-400 font-medium leading-relaxed">
            اسأل عن فحص السيارة، الأعطال، البرمجة، أو الحجز.
          </div>

          {/* Chat Body (Messages) */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#080a0f]/40 flex flex-col">
            <div className="space-y-4 flex-grow flex flex-col justify-start">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 max-w-[85%] text-right ${
                    msg.sender === "user" ? "self-end flex-row-reverse" : "self-start"
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      msg.sender === "user"
                        ? "bg-electric-blue text-white"
                        : "bg-electric-blue/15 border border-electric-blue/25 text-electric-blue"
                    }`}
                  >
                    {msg.sender === "user" ? "أنت" : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`border rounded-2xl p-3 text-xs sm:text-sm leading-relaxed font-medium ${
                      msg.sender === "user"
                        ? "bg-electric-blue border-electric-blue/20 text-white rounded-tl-none"
                        : "bg-[#161a24] border-white/5 text-gray-200 rounded-tr-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {/* Bot typing simulation */}
              {isTyping && (
                <div className="flex items-start gap-2.5 max-w-[85%] text-right self-start animate-pulse">
                  <div className="w-7 h-7 rounded-full bg-electric-blue/15 border border-electric-blue/25 flex items-center justify-center text-electric-blue shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-[#161a24] border border-white/5 rounded-2xl rounded-tr-none p-3 text-xs sm:text-sm text-gray-400 font-medium">
                    يكتب الآن...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Chat Footer (Input Form) */}
          <div className="p-4 border-t border-white/5 bg-[#0f1422]/60">
            <form 
              onSubmit={handleSendMessage}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="اكتب سؤالك هنا..."
                aria-label="اكتب سؤالك للمساعد"
                className="flex-grow bg-[#080a0f] border border-white/10 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-gray-200 placeholder-gray-600 focus:border-electric-blue/50 focus-visible:ring-2 focus-visible:ring-electric-blue text-right"
              />
              <button
                type="submit"
                className="min-w-11 min-h-11 rounded-xl bg-electric-blue hover:bg-electric-blue-hover text-white flex items-center justify-center shrink-0 border border-white/10 transition-all hover:scale-105"
                title="إرسال"
                aria-label="إرسال الرسالة"
              >
                <Send className="w-4 h-4 transform rotate-180" />
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
