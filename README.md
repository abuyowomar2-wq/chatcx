# ChatCX - منصة إدارة خدمة العملاء

ربط متجر سلة مع واتساب في لوحة واحدة لإدارة محادثات العملاء والطلبات وردود الفريق.

## التقنيات

- **Frontend**: Next.js 16 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Auth**: NextAuth.js (Credentials)
- **Queue**: BullMQ + Redis
- **AI**: OpenAI API (GPT-4o-mini)

## البدء

### المتطلبات

- Node.js 18+
- PostgreSQL
- Redis (اختياري للتطوير)

### التثبيت

```bash
# نسخ المتغيرات
cp .env.example .env

# تعديل المتغيرات في .env

# تثبيت الحزم
npm install

# إنشاء قاعدة البيانات
npx prisma generate
npx prisma db push

# تعبئة بيانات تجريبية
npm run seed

# تشغيل التطوير
npm run dev
```

### المتغيرات

انظر `.env.example` لكل المتغيرات المطلوبة.

### بينات الدخول التجريبية

- **سوبر أدمن**: `abuyowomar2@gmail.com` / `admin123`
- **متجر تجريبي**: `demo@chatcx.com` / `demo1234`

## الهيكلة

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/           # صفحات عامة
│   ├── (dashboard)/        # لوحة العميل
│   ├── (super-admin)/      # لوحة الإدارة
│   └── api/                # API Routes
├── components/             # مكونات مشتركة
│   ├── ui/                 # shadcn/ui
│   └── shared/             # مكونات مخصصة
├── lib/                    # مكتبات (Auth)
├── server/
│   ├── auth/               # إعدادات Auth
│   ├── db/                 # Prisma client
│   └── services/           # خدمات
├── integrations/           # تكاملات خارجية
│   ├── salla/              # تكامل سلة
│   └── whatsapp/           # تكامل واتساب
├── utils/                  # دوال مساعدة
└── types/                  # أنواع TypeScript
```

## المميزات

- ✅ ربط متجر سلة (OAuth 2.0)
- ✅ ربط واتساب بزنس (WhatsApp Cloud API)
- ✅ صندوق وارد موحد مع فلاتر
- ✅ إدارة العملاء والطلبات
- ✅ نظام الفريق والصلاحيات (RBAC)
- ✅ ردود جاهزة ومتغيرات
- ✅ أتمتة المهام
- ✅ ذكاء اصطناعي لاقتراح الردود
- ✅ تقارير وأداء
- ✅ نظام اشتراكات وخطط
- ✅ لوحة سوبر أدمن
- ✅ دعم RTL عربي
- ✅ تصميم متجاوب

## الأوامر

```bash
npm run dev          # تشغيل التطوير
npm run build        # بناء الإنتاج
npm run seed         # تعبئة بيانات تجريبية
npx prisma studio   # فتح مدير قاعدة البيانات
```

## النشر

1. انشر قاعدة البيانات على Supabase أو Neon
2. انشر Redis على Upstash
3. انشر التطبيق على Vercel
4. عدّل المتغيرات البيئية
