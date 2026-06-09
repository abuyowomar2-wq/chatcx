import Link from "next/link";

const plans = [
  {
    name: "تجربة مجانية",
    price: "مجانًا",
    period: "14 يوم",
    features: ["موظف واحد", "100 محادثة/شهر", "500 رسالة/شهر", "ردود جاهزة", "ربط سلة", "ربط واتساب"],
    cta: "ابدأ الآن",
    popular: false,
  },
  {
    name: "أساسي",
    price: "99",
    period: "شهريًا",
    features: ["3 موظفين", "500 محادثة/شهر", "2000 رسالة/شهر", "ردود جاهزة", "تقارير بسيطة", "دعم فني"],
    cta: "اشتراك",
    popular: true,
  },
  {
    name: "احترافي",
    price: "299",
    period: "شهريًا",
    features: ["10 موظفين", "2000 محادثة/شهر", "10000 رسالة/شهر", "ذكاء اصطناعي", "أتمتة متقدمة", "تقارير متقدمة", "قوالب واتساب"],
    cta: "اشتراك",
    popular: false,
  },
  {
    name: "بزنس",
    price: "599",
    period: "شهريًا",
    features: ["50 موظف", "غير محدود", "50000 رسالة/شهر", "دعم أولوية", "API مخصص", "تخصيص متقدم"],
    cta: "تواصل معنا",
    popular: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <header className="border-b dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">CX</div>
            <span className="font-bold text-xl">ChatCX</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-gray-600 hover:text-primary">تسجيل الدخول</Link>
            <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">ابدأ مجانًا</Link>
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-center mb-4">خطط أسعار مرنة</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          اختر الخطة المناسبة لمتجرك، مع إمكانية الترقية في أي وقت
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-6 ${
                plan.popular
                  ? "ring-2 ring-primary shadow-lg bg-white dark:bg-gray-900"
                  : "bg-white dark:bg-gray-900 dark:border-gray-800"
              }`}
            >
              {plan.popular && (
                <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-4">
                  الأكثر طلبًا
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-gray-500 mr-1">/{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`block text-center rounded-lg py-3 font-medium ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "border hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
