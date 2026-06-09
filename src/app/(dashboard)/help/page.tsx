"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Mail, MessageCircle, BookOpen } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">المساعدة والدعم</h1>
        <p className="text-gray-500 dark:text-gray-400">كيف يمكننا مساعدتك؟</p>
      </div>

      <div className="grid gap-4">
        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">دليل الاستخدام</CardTitle>
                <CardDescription>تعلم كيفية استخدام المنصة خطوة بخطوة</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <MessageCircle className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">الدعم المباشر</CardTitle>
                <CardDescription>تواصل مع فريق الدعم عبر واتساب</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-lg">راسلنا</CardTitle>
                <CardDescription>support@chatcx.com</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
