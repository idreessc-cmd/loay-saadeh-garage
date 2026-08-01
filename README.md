# موقع مركز لؤي سعادة لخدمات السيارات

موقع تعريفي وتسويقي عربي لمركز لؤي سعادة في عمّان، يركز على فحص وتشخيص وصيانة سيارات البنزين والديزل والهايبرد والكهرباء قبل تغيير القطع.

## التقنية

- Next.js 16 وReact 19 وTypeScript.
- Tailwind CSS 4.
- Static Export إلى مجلد `out`.
- Cloudflare Pages للاستضافة وCloudflare Pages Functions للوحة الإدارة.
- GitHub كمصدر للمحتوى وتشغيل النشر التلقائي.

## التشغيل المحلي

```bash
npm install
npm run dev
```

الموقع: `http://localhost:3000`

لوحة الإدارة: `http://localhost:3000/admin`

> واجهات `/api/admin/*` هي Cloudflare Pages Functions، ولذلك لا تعمل عبر خادم Next.js المحلي وحده. لاختبارها محليًا استخدم Wrangler Pages أو اختبارات الأمان المرفقة.

## الفحوصات

```bash
npm run test:security
npm run lint
npm run build
```

## النشر

- عنوان الإنتاج الحالي: `https://loay-saadeh-garage.pages.dev`
- أمر البناء: `npm run build`
- مجلد الناتج: `out`
- فرع الإنتاج: `main`

تُضبط أسرار لوحة الإدارة من إعدادات Cloudflare ولا تُحفظ في المستودع. راجع [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) للقيم المطلوبة وخطوات الحماية والنشر.

## النطاق الرسمي

النطاق `luaysaadeh-garage.com` غير موجود في DNS حتى تاريخ 1 أغسطس 2026. يجب شراؤه وربطه بـ Cloudflare Pages قبل تحويل canonical وSitemap إليه.
