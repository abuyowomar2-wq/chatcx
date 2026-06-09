"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <p className="text-gray-500 dark:text-gray-400">إعدادات المتجر والفريق</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>معلومات المتجر</CardTitle>
          <CardDescription>البيانات الأساسية لمتجرك</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اسم المتجر</label>
            <Input defaultValue="متجري التجريبي" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">المنطقة الزمنية</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="Asia/Riyadh">الرياض (UTC+3)</option>
              <option value="Asia/Dubai">دبي (UTC+4)</option>
              <option value="Asia/Kuwait">الكويت (UTC+3)</option>
            </select>
          </div>
          <Button onClick={handleSave}>
            {saved ? "✓ تم الحفظ" : "حفظ التغييرات"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات المحادثات</CardTitle>
          <CardDescription>توزيع المحادثات وإعدادات التواصل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">توزيع المحادثات</label>
            <select className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm">
              <option value="manual">يدوي</option>
              <option value="round-robin">توزيع تلقائي</option>
              <option value="least-loaded">أقل موظف محادثات</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">رسالة الترحيب</label>
            <textarea
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm"
              rows={3}
              defaultValue="أهلاً بك في متجرنا! كيف أقدر أساعدك اليوم؟"
            />
          </div>
          <Button onClick={handleSave}>حفظ التغييرات</Button>
        </CardContent>
      </Card>
    </div>
  );
}
