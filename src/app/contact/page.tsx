import Link from "next/link";

export default function ContactPage() {
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

      <section className="container mx-auto px-4 py-20 max-w-2xl">
        <h1 className="text-4xl font-bold text-center mb-4">تواصل معنا</h1>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-12">
          لديك استفسار أو اقتراح؟ نحن هنا لمساعدتك
        </p>

        <div className="grid gap-6">
          <div className="rounded-xl border p-6 text-center dark:border-gray-800">
            <h3 className="font-semibold mb-2">البريد الإلكتروني</h3>
            <p className="text-primary">support@chatcx.com</p>
          </div>
          <div className="rounded-xl border p-6 text-center dark:border-gray-800">
            <h3 className="font-semibold mb-2">واتساب</h3>
            <p className="text-primary">+966 55 000 0000</p>
          </div>
        </div>
      </section>
    </div>
  );
}
