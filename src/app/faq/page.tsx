import Link from "next/link";

export default function FAQPage() {
  const faqs = [
    { q: "ما هي منصة ChatCX؟", a: "منصة سحابية لإدارة خدمة العملاء عبر واتساب للمتاجر الإلكترونية في سلة." },
    { q: "هل أحتاج إلى حساب واتساب بزنس؟", a: "نعم، تحتاج إلى حساب واتساب بزنس (WhatsApp Business API) لربطه بالمنصة." },
    { q: "كم تكلفة الخدمة؟", a: "نوفر تجربة مجانية لمدة 14 يوم، ثم خطط تبدأ من 99 ريال شهريًا." },
    { q: "هل تدعمون متاجر أخرى غير سلة؟", a: "حاليًا ندعم سلة. ندعم WooCommerce و Shopify قريبًا." },
    { q: "هل البيانات آمنة؟", a: "نعم، البيانات مشفرة ولا يتم مشاركتها مع أي طرف ثالث." },
    { q: "كم عدد الموظفين المسموح؟", a: "حسب الخطة، من موظف واحد في التجربة المجانية حتى 50 موظف في خطة بزنس." },
  ];

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
          </nav>
        </div>
      </header>

      <section className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="text-4xl font-bold text-center mb-12">الأسئلة الشائعة</h1>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border p-6 dark:border-gray-800">
              <h3 className="font-semibold text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
