"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function AiSettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">الذكاء الاصطناعي</h1>
        <p className="text-gray-500 dark:text-gray-400">إعدادات المساعد الذكي لاقتراح الردود</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>حالة المساعد الذكي</CardTitle>
              <CardDescription>تشغيل أو إيقاف الذكاء الاصطناعي</CardDescription>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
            </label>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>نبرة الرد</CardTitle>
          <CardDescription>كيف تريد أن يرد المساعد الذكي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {["ودية", "رسمية", "مختصرة", "تسويقية"].map((tone) => (
              <label key={tone} className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                <input type="radio" name="tone" defaultChecked={tone === "ودية"} className="text-primary" />
                <span className="text-sm">{tone}</span>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>سياسات المتجر</CardTitle>
          <CardDescription>معلومات يستخدمها الذكاء الاصطناعي لصياغة الردود</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { label: "سياسة الشحن", placeholder: "مدة التوصيل والتكلفة..." },
            { label: "سياسة الاسترجاع", placeholder: "شروط الاسترجاع والاستبدال..." },
            { label: "مدة التوصيل", placeholder: "2-5 أيام عمل" },
            { label: "تعليمات خاصة", placeholder: "ممنوع تقديم وعود بدون تأكيد..." },
          ].map((field, i) => (
            <div key={i} className="space-y-2">
              <label className="text-sm font-medium">{field.label}</label>
              <textarea
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
                rows={3}
                placeholder={field.placeholder}
              />
            </div>
          ))}
          <Button onClick={handleSave}>
            {saved ? "✓ تم الحفظ" : "حفظ الإعدادات"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
