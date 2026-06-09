import Link from "next/link";
import { MessageSquare, ShoppingCart, Users, Bot, BarChart3, Zap, UserPlus } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      {/* Nav */}
      <header className="border-b dark:border-gray-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">CX</div>
            <span className="font-bold text-xl">ChatCX</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/features" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400">المميزات</Link>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400">الأسعار</Link>
            <Link href="/login" className="text-sm text-gray-600 hover:text-primary dark:text-gray-400">تسجيل الدخول</Link>
            <Link href="/register" className="rounded-lg bg-primary px-4 py-2 text-sm text-white hover:bg-primary/90">ابدأ مجانًا</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
          إدارة خدمة عملاء واتساب لمتجرك <br />
          <span className="text-primary">من مكان واحد</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          اربط متجرك في سلة مع واتساب، واجمع محادثات العملاء وطلباتهم وردود فريقك داخل لوحة واحدة سهلة وسريعة
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="rounded-lg bg-primary px-8 py-3 text-white font-medium hover:bg-primary/90 text-lg">
            ابدأ الآن مجانًا
          </Link>
          <Link href="/features" className="rounded-lg border px-8 py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 text-lg">
            اعرف المزيد
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShoppingCart, title: "اربط متجرك بسلة", desc: "استورد العملاء والطلبات تلقائيًا من متجرك في سلة" },
            { icon: MessageSquare, title: "استقبل محادثات واتساب", desc: "كل رسائل العملاء من واتساب تظهر في صندوق وارد واحد" },
            { icon: Users, title: "اعرف بيانات العميل فورًا", desc: "شاهد معلومات العميل وطلباته السابقة أثناء المحادثة" },
            { icon: UserPlus, title: "وزّع المحادثات على فريقك", desc: "حدد الموظف المناسب لكل محادثة بضغطة زر" },
            { icon: Bot, title: "ردود جاهزة وذكاء اصطناعي", desc: "استخدم ردود جاهزة أو اقتراحات الذكاء الاصطناعي للرد السريع" },
            { icon: BarChart3, title: "تقارير أداء واضحة", desc: "تابع أداء فريق الدعم ومتوسط وقت الرد وجودة الخدمة" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="rounded-xl border bg-white p-6 hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-gray-800">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">جهز متجرك لخدمة عملاء احترافية</h2>
          <p className="text-lg mb-8 opacity-90">ابدأ تجربتك المجانية لمدة 14 يومًا بدون بطاقة ائتمان</p>
          <Link href="/register" className="inline-block rounded-lg bg-white px-8 py-3 text-primary font-medium hover:bg-gray-100 text-lg">
            ابدأ مجانًا
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-gray-500 dark:border-gray-800">
        <p>© 2026 ChatCX. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
