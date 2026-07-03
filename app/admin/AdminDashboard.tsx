"use client";

import React, { useState, useEffect } from "react";
import { 
  Lock, LogOut, Save, Download, Eye, FileCode, Check, AlertCircle, 
  Plus, Trash2, ArrowUp, ArrowDown, ChevronRight, Info, EyeOff
} from "lucide-react";
import siteData from "../../data/site-data.json";
import { CenterData } from "../../data/site-data";

export default function AdminDashboard() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Site Data State
  const [formData, setFormData] = useState<CenterData>(siteData as CenterData);

  // Tab State
  const [activeTab, setActiveTab] = useState<
    "basic" | "hero" | "services" | "cartypes" | "faq" | "chatbot" | "images" | "seo"
  >("basic");

  // UI State
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/admin/check");
        if (res.ok) {
          const data = await res.json();
          setIsAuthenticated(data.authenticated);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    }
    checkAuth();
  }, []);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    setAuthError("");
    setIsLoggingIn(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setAuthError(data.error || "فشل تسجيل الدخول");
      }
    } catch {
      setAuthError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout");
    } finally {
      setIsAuthenticated(false);
      setPassword("");
    }
  };

  // Handle Basic Field Change
  const handleChange = (path: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const parts = path.split(".");
      let current: any = updated;
      for (let i = 0; i < parts.length - 1; i++) {
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
      return updated;
    });
  };

  // Chatbot Rules Helpers
  const handleRuleChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedRules = [...updated.chatbot.rules];
      if (field === "keywords") {
        updatedRules[index] = {
          ...updatedRules[index],
          keywords: value.split(",").map((k: string) => k.trim()).filter(Boolean)
        };
      } else {
        updatedRules[index] = {
          ...updatedRules[index],
          [field]: value
        };
      }
      updated.chatbot = { ...updated.chatbot, rules: updatedRules };
      return updated;
    });
  };

  const addChatbotRule = () => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.chatbot = {
        ...updated.chatbot,
        rules: [
          ...updated.chatbot.rules,
          { keywords: ["كلمة"], reply: "الرد هنا", active: true }
        ]
      };
      return updated;
    });
  };

  const deleteChatbotRule = (index: number) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedRules = updated.chatbot.rules.filter((_, i) => i !== index);
      updated.chatbot = { ...updated.chatbot, rules: updatedRules };
      return updated;
    });
  };

  // Services Helpers
  const handleServiceChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedServices = [...updated.services];
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value
      };
      updated.services = updatedServices;
      return updated;
    });
  };

  // Car Types Helpers
  const handleCarTypeChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedCarTypes = [...updated.carTypes];
      updatedCarTypes[index] = {
        ...updatedCarTypes[index],
        [field]: value
      };
      updated.carTypes = updatedCarTypes;
      return updated;
    });
  };

  // FAQ Helpers
  const handleFaqChange = (index: number, field: "q" | "a", value: string) => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedFaqs = [...updated.faqs];
      updatedFaqs[index] = {
        ...updatedFaqs[index],
        [field]: value
      };
      updated.faqs = updatedFaqs;
      return updated;
    });
  };

  const addFaq = () => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.faqs = [...updated.faqs, { q: "السؤال الجديد؟", a: "الإجابة هنا" }];
      return updated;
    });
  };

  const deleteFaq = (index: number) => {
    setFormData((prev) => {
      const updated = { ...prev };
      updated.faqs = updated.faqs.filter((_, i) => i !== index);
      return updated;
    });
  };

  const moveFaq = (index: number, direction: "up" | "down") => {
    setFormData((prev) => {
      const updated = { ...prev };
      const updatedFaqs = [...updated.faqs];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= updatedFaqs.length) return prev;
      
      const temp = updatedFaqs[index];
      updatedFaqs[index] = updatedFaqs[targetIndex];
      updatedFaqs[targetIndex] = temp;
      
      updated.faqs = updatedFaqs;
      return updated;
    });
  };

  // Download Backup Action
  const handleDownloadBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(formData, null, 2)
    )}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `site-data-backup-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Save changes to GitHub Action
  const handleSaveToGithub = async () => {
    setIsSaving(true);
    setSaveMessage("");
    setSaveError("");
    setShowConfirmModal(false);

    try {
      const res = await fetch("/api/admin/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: formData }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage(data.message || "تم حفظ البيانات بنجاح!");
      } else {
        setSaveError(data.error || "فشل حفظ البيانات");
      }
    } catch {
      setSaveError("حدث خطأ أثناء محاولة الاتصال بالخادم وحفظ التغييرات");
    } finally {
      setIsSaving(false);
    }
  };

  // Loading Screen (before auth check completes)
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-gray-100 flex items-center justify-center font-cairo">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-electric-blue border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-sm">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080a0f] text-gray-100 flex items-center justify-center px-4 font-cairo">
        <div className="max-w-md w-full bg-[#0c0f17]/90 border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e6ffa08_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          
          <div className="flex flex-col items-center mb-8 relative z-10">
            <div className="w-16 h-16 bg-electric-blue/10 border border-electric-blue/30 rounded-2xl flex items-center justify-center text-electric-blue mb-4">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">لوحة تحكم المبرمج</h1>
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              هذه الصفحة مخصصة فقط لتعديل محتوى موقع مركز لؤي سعادة. يرجى إدخال كلمة المرور للمتابعة.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5 relative z-10">
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-2">كلمة المرور</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50 text-center font-mono"
                required
              />
            </div>

            {authError && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-electric-blue hover:bg-electric-blue-hover text-white py-3.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoggingIn ? "جاري التحقق..." : "تسجيل الدخول"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard Screen
  return (
    <div className="min-h-screen bg-[#080a0f] text-gray-100 font-cairo flex flex-col">
      {/* Top Navbar */}
      <header className="bg-[#0c0f17] border-b border-white/5 py-4 px-6 sticky top-0 z-30 shadow-lg shadow-[#080a0f]/20">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center text-white font-bold text-sm">
              M
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-extrabold text-white">لوحة تحكم المحتوى</h1>
              <p className="text-[10px] text-gray-400">مركز لؤي سعادة لصيانة السيارات</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowJsonPreview(!showJsonPreview)}
              className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="معاينة كود JSON"
            >
              <FileCode className="w-4 h-4" />
              <span className="hidden md:inline">معاينة JSON</span>
            </button>

            <button
              onClick={handleDownloadBackup}
              className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="تنزيل نسخة احتياطية من البيانات"
            >
              <Download className="w-4 h-4" />
              <span className="hidden md:inline">تحميل نسخة احتياطية</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-red-500 transition-all flex items-center gap-1.5 text-xs font-bold"
              title="تسجيل الخروج"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">خروج</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar tabs */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: "basic", label: "البيانات الأساسية" },
            { id: "hero", label: "قسم البانر (Hero)" },
            { id: "services", label: "خدمات المركز" },
            { id: "cartypes", label: "أنواع السيارات" },
            { id: "faq", label: "الأسئلة الشائعة" },
            { id: "chatbot", label: "ردود الشات بوت" },
            { id: "images", label: "إدارة الصور" },
            { id: "seo", label: "الظهور والـ SEO" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs sm:text-sm font-bold border transition-all flex items-center justify-between ${
                activeTab === tab.id
                  ? "bg-electric-blue border-electric-blue/30 text-white shadow-lg shadow-electric-blue/15"
                  : "bg-[#0c0f17] border-white/5 text-gray-400 hover:text-gray-200 hover:bg-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <ChevronRight className={`w-4 h-4 transition-transform ${activeTab === tab.id ? "rotate-90 md:rotate-0" : ""}`} />
            </button>
          ))}

          {/* Warnings Banner */}
          <div className="bg-warning-orange/10 border border-warning-amber/30 rounded-xl p-4 text-xs text-warning-amber space-y-1 leading-relaxed">
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Info className="w-4 h-4 shrink-0" />
              <span>ملاحظة للمبرمج:</span>
            </div>
            <p>تعديل البيانات هنا وحفظها سيقوم بإرسال Commit مباشر لمستودع GitHub لبدء نشر Cloudflare Pages تلقائياً.</p>
          </div>
        </aside>

        {/* Tab content forms */}
        <main className="lg:col-span-9 bg-[#0c0f17]/90 border border-white/5 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          {/* Messages */}
          {saveMessage && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-xs sm:text-sm text-green-400 flex items-center gap-3">
              <Check className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">تم الحفظ بنجاح!</p>
                <p className="text-xs text-gray-400 pt-0.5">سيظهر التحديث بعد انتهاء نشر Cloudflare خلال دقائق (2-3 دقائق عادةً).</p>
              </div>
            </div>
          )}

          {saveError && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-xs sm:text-sm text-red-400 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">فشل الحفظ</p>
                <p className="text-xs text-gray-400 pt-0.5">{saveError}</p>
              </div>
            </div>
          )}

          {/* TAB 1: Basic Info */}
          {activeTab === "basic" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">البيانات الأساسية للمركز</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">اسم المركز التجاري</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">شعار / حكمة المركز</label>
                  <input
                    type="text"
                    value={formData.slogan}
                    onChange={(e) => handleChange("slogan", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">رقم الهاتف (الأساسي للروابط)</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">رقم الهاتف للعرض</label>
                  <input
                    type="text"
                    value={formData.phoneDisplay}
                    onChange={(e) => handleChange("phoneDisplay", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">رقم الواتساب الدولي (مثال: 962788526696)</label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">رابط الخريطة على خرائط Google</label>
                  <input
                    type="text"
                    value={formData.googleMapsLink}
                    onChange={(e) => handleChange("googleMapsLink", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">الموقع (سلسلة قصيرة)</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">تفاصيل العنوان</label>
                  <input
                    type="text"
                    value={formData.locationDetail}
                    onChange={(e) => handleChange("locationDetail", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">ساعات العمل للعرض الكامل</label>
                  <input
                    type="text"
                    value={formData.workingHoursDisplay}
                    onChange={(e) => handleChange("workingHoursDisplay", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">ساعات العمل المختصرة</label>
                  <input
                    type="text"
                    value={formData.workingHoursShort}
                    onChange={(e) => handleChange("workingHoursShort", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Hero Config */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إعدادات قسم البانر (Hero Section)</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">الشارة أعلى العنوان الرئيسي (Badge)</label>
                  <input
                    type="text"
                    value={formData.hero.badge}
                    onChange={(e) => handleChange("hero.badge", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">العنوان الرئيسي بعد اسم المركز</label>
                  <input
                    type="text"
                    value={formData.hero.title}
                    onChange={(e) => handleChange("hero.title", e.target.value)}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">الوصف التعريفي للبانر</label>
                  <textarea
                    value={formData.hero.desc}
                    onChange={(e) => handleChange("hero.desc", e.target.value)}
                    rows={3}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">نص الزر الأول (واتساب)</label>
                    <input
                      type="text"
                      value={formData.hero.btn1Text}
                      onChange={(e) => handleChange("hero.btn1Text", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">نص الزر الثاني (اتصال مباشر)</label>
                    <input
                      type="text"
                      value={formData.hero.btn2Text}
                      onChange={(e) => handleChange("hero.btn2Text", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-600 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Services */}
          {activeTab === "services" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إدارة خدمات المركز</h2>
              <div className="space-y-4">
                {formData.services.map((service, index) => (
                  <div key={service.id} className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-electric-blue" />
                        <span className="font-mono text-xs text-gray-500">{service.id}</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={service.active !== false}
                          onChange={(e) => handleServiceChange(index, "active", e.target.checked)}
                          className="w-4 h-4 text-electric-blue bg-slate-900 border-white/10 rounded focus:ring-electric-blue cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-300">نشط في الموقع</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">عنوان الخدمة</label>
                        <input
                          type="text"
                          value={service.title}
                          onChange={(e) => handleServiceChange(index, "title", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">رمز الأيقونة (من Lucide Icons)</label>
                        <input
                          type="text"
                          value={service.icon}
                          onChange={(e) => handleServiceChange(index, "icon", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">وصف الخدمة</label>
                        <textarea
                          value={service.desc}
                          onChange={(e) => handleServiceChange(index, "desc", e.target.value)}
                          rows={2}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Car Types */}
          {activeTab === "cartypes" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">أنواع السيارات التي نخدمها</h2>
              <div className="space-y-4">
                {formData.carTypes.map((car, index) => (
                  <div key={index} className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-white">النوع #{index + 1}</span>
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={car.active !== false}
                          onChange={(e) => handleCarTypeChange(index, "active", e.target.checked)}
                          className="w-4 h-4 text-electric-blue bg-slate-900 border-white/10 rounded focus:ring-electric-blue cursor-pointer"
                        />
                        <span className="text-xs font-bold text-gray-300">نشط في الموقع</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">العنوان</label>
                        <input
                          type="text"
                          value={car.title}
                          onChange={(e) => handleCarTypeChange(index, "title", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">مسار الصورة (مسار نسبي)</label>
                        <input
                          type="text"
                          value={car.image}
                          onChange={(e) => handleCarTypeChange(index, "image", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                          dir="ltr"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-[11px] font-bold text-gray-400 mb-1.5">الوصف المختصر</label>
                        <textarea
                          value={car.desc}
                          onChange={(e) => handleCarTypeChange(index, "desc", e.target.value)}
                          rows={2}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: FAQ */}
          {activeTab === "faq" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <h2 className="text-lg font-bold text-white">إدارة الأسئلة الشائعة</h2>
                <button
                  type="button"
                  onClick={addFaq}
                  className="bg-electric-blue hover:bg-electric-blue-hover text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة سؤال</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.faqs.map((faq, index) => (
                  <div key={index} className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-gray-400">سؤال #{index + 1}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => moveFaq(index, "up")}
                          disabled={index === 0}
                          className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30"
                          title="نقل للأعلى"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFaq(index, "down")}
                          disabled={index === formData.faqs.length - 1}
                          className="p-1 rounded bg-white/5 border border-white/5 text-gray-400 hover:text-white disabled:opacity-30"
                          title="نقل للأسفل"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteFaq(index)}
                          className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="حذف السؤال"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">السؤال</label>
                        <input
                          type="text"
                          value={faq.q}
                          onChange={(e) => handleFaqChange(index, "q", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">الإجابة</label>
                        <textarea
                          value={faq.a}
                          onChange={(e) => handleFaqChange(index, "a", e.target.value)}
                          rows={3}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: Chatbot Rules */}
          {activeTab === "chatbot" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إعدادات الشات بوت والردود الفورية</h2>
              
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">رسالة الترحيب الأولى</label>
                  <textarea
                    value={formData.chatbot.welcomeMessage}
                    onChange={(e) => handleChange("chatbot.welcomeMessage", e.target.value)}
                    rows={2}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-2">الرد الافتراضي (إذا لم تطابق الكلمات المفتاحية)</label>
                  <textarea
                    value={formData.chatbot.defaultReply}
                    onChange={(e) => handleChange("chatbot.defaultReply", e.target.value)}
                    rows={3}
                    className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-white/5 pt-6 pb-2">
                <h3 className="text-md font-bold text-white">قواعد الكلمات المفتاحية</h3>
                <button
                  type="button"
                  onClick={addChatbotRule}
                  className="bg-electric-blue hover:bg-electric-blue-hover text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                >
                  <Plus className="w-4.5 h-4.5" />
                  <span>إضافة قاعدة</span>
                </button>
              </div>

              <div className="space-y-4">
                {formData.chatbot.rules.map((rule, index) => (
                  <div key={index} className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-4 sm:p-5 space-y-4">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-xs font-bold text-gray-400">قاعدة #{index + 1}</span>
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={rule.active !== false}
                            onChange={(e) => handleRuleChange(index, "active", e.target.checked)}
                            className="w-4 h-4 text-electric-blue bg-slate-900 border-white/10 rounded focus:ring-electric-blue cursor-pointer"
                          />
                          <span className="text-xs text-gray-400">نشطة</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => deleteChatbotRule(index)}
                          className="p-1 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors"
                          title="حذف القاعدة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">الكلمات المفتاحية (مفصولة بفواصل `,`)</label>
                        <input
                          type="text"
                          value={rule.keywords.join(", ")}
                          onChange={(e) => handleRuleChange(index, "keywords", e.target.value)}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 mb-1">رد البوت</label>
                        <textarea
                          value={rule.reply}
                          onChange={(e) => handleRuleChange(index, "reply", e.target.value)}
                          rows={2}
                          className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: Images */}
          {activeTab === "images" && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إدارة الصور</h2>
              <p className="text-xs text-gray-400 leading-relaxed">
                غيّر مسار أو رابط أي صورة في الموقع. إذا كانت الصورة داخل مجلد <code className="text-electric-blue bg-white/5 px-1 py-0.5 rounded font-mono">public</code>، اكتب المسار مبتدئاً بـ <code className="text-electric-blue bg-white/5 px-1 py-0.5 rounded font-mono">/</code>. يمكنك أيضاً استخدام رابط خارجي كامل <code className="text-electric-blue bg-white/5 px-1 py-0.5 rounded font-mono">https://...</code>.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Electric car image */}
                <div className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">السيارات الكهربائية</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">تظهر في بطاقة أنواع السيارات</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                      {formData.images.electric.startsWith("http") || formData.images.electric.startsWith("/") ? (
                        <img src={formData.images.electric} alt="electric" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.classList.add("flex","items-center","justify-center","text-gray-600","text-[10px]"); (e.target as HTMLImageElement).parentElement!.textContent = "معاينة" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">معاينة</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">المسار الحالي</label>
                    <input
                      type="text"
                      value={formData.images.electric}
                      onChange={(e) => handleChange("images.electric", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Hybrid car image */}
                <div className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">سيارات الهايبرد</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">تظهر في بطاقة أنواع السيارات</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                      {formData.images.hybrid.startsWith("http") || formData.images.hybrid.startsWith("/") ? (
                        <img src={formData.images.hybrid} alt="hybrid" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.classList.add("flex","items-center","justify-center","text-gray-600","text-[10px]"); (e.target as HTMLImageElement).parentElement!.textContent = "معاينة" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">معاينة</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">المسار الحالي</label>
                    <input
                      type="text"
                      value={formData.images.hybrid}
                      onChange={(e) => handleChange("images.hybrid", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Default/Petrol-Diesel car image */}
                <div className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">سيارات البنزين والديزل</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">تظهر في بطاقة أنواع السيارات</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                      {formData.images.defaultCar.startsWith("http") || formData.images.defaultCar.startsWith("/") ? (
                        <img src={formData.images.defaultCar} alt="default" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.classList.add("flex","items-center","justify-center","text-gray-600","text-[10px]"); (e.target as HTMLImageElement).parentElement!.textContent = "معاينة" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">معاينة</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">المسار الحالي</label>
                    <input
                      type="text"
                      value={formData.images.defaultCar}
                      onChange={(e) => handleChange("images.defaultCar", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* OG Image */}
                <div className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">صورة مشاركة الرابط (Open Graph)</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">تظهر عند مشاركة رابط الموقع على فيسبوك، واتساب، تلغرام...</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                      {formData.images.ogImage.startsWith("http") || formData.images.ogImage.startsWith("/") ? (
                        <img src={formData.images.ogImage} alt="og" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.classList.add("flex","items-center","justify-center","text-gray-600","text-[10px]"); (e.target as HTMLImageElement).parentElement!.textContent = "معاينة" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">معاينة</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">المسار الحالي</label>
                    <input
                      type="text"
                      value={formData.images.ogImage}
                      onChange={(e) => handleChange("images.ogImage", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>

                {/* Favicon */}
                <div className="bg-[#080a0f]/60 border border-white/5 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-bold text-white">أيقونة الموقع (Favicon)</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">تظهر في تبويب المتصفح بجانب عنوان الصفحة</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-slate-900 border border-white/5 overflow-hidden shrink-0">
                      {formData.images.favicon.startsWith("http") || formData.images.favicon.startsWith("/") ? (
                        <img src={formData.images.favicon} alt="favicon" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; (e.target as HTMLImageElement).parentElement!.classList.add("flex","items-center","justify-center","text-gray-600","text-[10px]"); (e.target as HTMLImageElement).parentElement!.textContent = "معاينة" }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">معاينة</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 mb-1.5">المسار الحالي</label>
                    <input
                      type="text"
                      value={formData.images.favicon}
                      onChange={(e) => handleChange("images.favicon", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-3 py-2 text-xs sm:text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-left"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: Visibility & SEO */}
          {activeTab === "seo" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إظهار وإخفاء أقسام الموقع</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                  {[
                    { key: "hero", label: "البانر (Hero)" },
                    { key: "carTypes", label: "أنواع السيارات" },
                    { key: "services", label: "الخدمات" },
                    { key: "problems", label: "الأعطال الشائعة" },
                    { key: "whyUs", label: "لماذا نحن" },
                    { key: "faq", label: "الأسئلة الشائعة" },
                    { key: "contact", label: "معلومات الاتصال" },
                    { key: "cta", label: "قسم CTA النهائي" },
                    { key: "chatbot", label: "الشات بوت" }
                  ].map((section) => (
                    <label
                      key={section.key}
                      className="flex items-center gap-3 p-4 bg-[#080a0f]/60 border border-white/5 rounded-xl cursor-pointer hover:border-electric-blue/20 transition-all select-none"
                    >
                      <input
                        type="checkbox"
                        checked={(formData.sectionsVisibility as any)[section.key] !== false}
                        onChange={(e) => handleChange(`sectionsVisibility.${section.key}`, e.target.checked)}
                        className="w-4 h-4 text-electric-blue bg-slate-900 border-white/10 rounded focus:ring-electric-blue cursor-pointer"
                      />
                      <span className="text-xs font-bold text-gray-200">{section.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-6">
                <h2 className="text-lg font-bold text-white border-b border-white/5 pb-3">إعدادات محركات البحث والـ SEO</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-2">عنوان الصفحة لـ SEO (Meta Title)</label>
                    <input
                      type="text"
                      value={formData.metadata.title}
                      onChange={(e) => handleChange("metadata.title", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-2">وصف الصفحة لـ SEO (Meta Description)</label>
                    <textarea
                      value={formData.metadata.description}
                      onChange={(e) => handleChange("metadata.description", e.target.value)}
                      rows={3}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">عنوان الرابط الرئيسي (Canonical URL)</label>
                    <input
                      type="text"
                      value={formData.metadata.canonical}
                      onChange={(e) => handleChange("metadata.canonical", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-2">رابط قاعدة البيانات الوصفية (Metadata Base)</label>
                    <input
                      type="text"
                      value={formData.metadata.metadataBase}
                      onChange={(e) => handleChange("metadata.metadataBase", e.target.value)}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50 font-mono text-xs"
                      dir="ltr"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-300 mb-2">الكلمات الدلالية المفتاحية (مفصولة بفواصل `,`)</label>
                    <input
                      type="text"
                      value={formData.metadata.keywords.join(", ")}
                      onChange={(e) => handleChange("metadata.keywords", e.target.value.split(",").map(k => k.trim()).filter(Boolean))}
                      className="w-full bg-[#080a0f] border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 focus:outline-none focus:border-electric-blue/50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* JSON Live Preview Area */}
          {showJsonPreview && (
            <div className="bg-[#080a0f] border border-white/10 rounded-2xl p-4 sm:p-5 mt-8 space-y-3 animate-fadeIn">
              <div className="flex justify-between items-center gap-4">
                <span className="text-xs font-bold text-electric-blue">معاينة ملف البيانات site-data.json المباشر:</span>
                <button
                  onClick={() => setShowJsonPreview(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  إغلاق المعاينة
                </button>
              </div>
              <pre className="bg-black/40 rounded-xl p-4 font-mono text-xs text-green-400 overflow-x-auto max-h-[350px] leading-relaxed select-all" dir="ltr">
                {JSON.stringify(formData, null, 2)}
              </pre>
            </div>
          )}

          {/* Sticky Actions bar */}
          <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-xs text-gray-400 text-center sm:text-right">
              يرجى التأكد من صحة البيانات وتعبئة كافة الحقول بشكل صحيح قبل إرسال طلب الحفظ.
            </div>
            
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={isSaving}
              className="w-full sm:w-auto bg-electric-blue hover:bg-electric-blue-hover text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-electric-blue/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Save className="w-4.5 h-4.5" />
              <span>حفظ ونشر التغييرات</span>
            </button>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full bg-[#0c0f17] border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex flex-col items-center text-center">
              <div className="w-14 h-14 bg-warning-orange/10 border border-warning-orange/20 rounded-full flex items-center justify-center text-warning-orange mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">هل أنت متأكد من حفظ ونشر البيانات؟</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                سيؤدي الضغط على تأكيد إلى تحديث ملف <code className="text-electric-blue bg-white/5 px-1 py-0.5 rounded font-mono text-[11px]">site-data.json</code> مباشرة على GitHub. 
                سيؤدي هذا إلى بدء نشر جديد وتلقائي على Cloudflare Pages، وسيظهر التغيير مباشرة على موقع العميل في غضون دقائق معدودة.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="bg-white/5 hover:bg-white/10 text-gray-300 py-3 rounded-xl text-xs sm:text-sm font-bold border border-white/5 transition-all"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleSaveToGithub}
                disabled={isSaving}
                className="bg-electric-blue hover:bg-electric-blue-hover text-white py-3 rounded-xl text-xs sm:text-sm font-bold shadow-lg shadow-electric-blue/15 transition-all"
              >
                {isSaving ? "جاري الحفظ..." : "تأكيد ونشر"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
