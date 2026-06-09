import Link from "next/link";
import { MessageSquare, ShoppingCart, Users, Bot, BarChart3, Zap, Shield, Globe } from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
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
        <h1 className="text-4xl font-bold text-center mb-12">كل ما تحتاجه لإدارة خدمة العملاء</h1>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: MessageSquare, title: "صندوق وارد واحد", desc: "كل محادثات واتساب في مكان واحد مع فلاتر ذكية وتنظيم احترافي" },
            { icon: ShoppingCart, title: "ربط مع سلة", desc: "استيراد العملاء والطلبات تلقائيًا مع مزامنة مباشرة" },
            { icon: Users, title: "ملف عميل متكامل", desc: "مشاهدة بيانات العميل وطلباته ومحادثاته السابقة أثناء الرد" },
            { icon: Bot, title: "ذكاء اصطناعي", desc: "اقتراح ردود ذكية بناءً على سياسات المتجر وبيانات العميل" },
            { icon: Zap, title: "أتمتة ذكية", desc: "ردود تلقائية وإشعارات ذكية بناءً على أحداث محددة" },
            { icon: BarChart3, title: "تقارير وأداء", desc: "تحليل أداء الفريق ومتوسط وقت الرد وجودة الخدمة" },
            { icon: Shield, title: "الخصوصية والأمان", desc: "بيانات مشفرة، فصل تام بين المتاجر، وصلاحيات دقيقة" },
            { icon: Globe, title: "واجهة عربية", desc: "واجهة كاملة بالعربية مع دعم RTL احترافي" },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="rounded-xl border p-6 hover:shadow-md transition-shadow dark:border-gray-800">
                <Icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
