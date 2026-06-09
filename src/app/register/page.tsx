"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      name: formData.get("name") as string,
      storeName: formData.get("storeName") as string,
    };

    if (data.password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "حدث خطأ أثناء التسجيل");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white text-lg font-bold">CX</div>
          </div>
          <CardTitle className="text-2xl">إنشاء حساب جديد</CardTitle>
          <CardDescription>ابدأ تجربتك المجانية لمدة 14 يومًا</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم الكامل</label>
              <Input name="name" required placeholder="محمد أحمد" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">اسم المتجر</label>
              <Input name="storeName" required placeholder="متجري الإلكتروني" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">البريد الإلكتروني</label>
              <Input name="email" type="email" required placeholder="your@email.com" dir="ltr" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">كلمة المرور</label>
              <Input name="password" type="password" required placeholder="•••••••• (8 أحرف minimum)" dir="ltr" />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "جاري إنشاء الحساب..." : "إنشاء الحساب"}
            </Button>
            <p className="text-center text-sm text-gray-500">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="text-primary hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
