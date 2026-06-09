"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, ShoppingCart, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-gray-500 dark:text-gray-400">نظرة عامة على أداء خدمة العملاء</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المحادثات المفتوحة</p>
                <p className="text-3xl font-bold">12</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <MessageSquare className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">غير مقروءة</p>
                <p className="text-3xl font-bold text-red-500">3</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/20">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">العملاء الجدد اليوم</p>
                <p className="text-3xl font-bold">5</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20">
                <Users className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">متوسط وقت الرد</p>
                <p className="text-3xl font-bold">2.5 د</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              ربط سلة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">متصل</p>
                <p className="text-sm text-gray-500">آخر مزامنة: منذ 5 دقائق</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              ربط واتساب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">متصل</p>
                <p className="text-sm text-gray-500">رقم +966 55 000 0000</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent conversations & Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخر المحادثات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "سارة أحمد", msg: "السلام عليكم، عندي استفسار", time: "منذ 5 دقائق", status: "جديد" },
                { name: "محمد العلي", msg: "وين طلبي؟", time: "منذ 15 دقيقة", status: "بانتظار" },
                { name: "نورة خالد", msg: "شكراً على الخدمة", time: "منذ ساعة", status: "مقروء" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800">
                  <div>
                    <p className="font-medium text-sm">{item.name}</p>
                    <p className="text-sm text-gray-500 truncate max-w-[200px]">{item.msg}</p>
                    <p className="text-xs text-gray-400">{item.time}</p>
                  </div>
                  <Badge variant={item.status === "جديد" ? "destructive" : "secondary"}>{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">قائمة الإنجاز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { task: "أكمل بيانات المتجر", done: true },
                { task: "اربط متجر سلة", done: true },
                { task: "اربط واتساب", done: true },
                { task: "أضف أول موظف", done: false },
                { task: "أنشئ أول رد جاهز", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.done ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-gray-300 shrink-0" />
                  )}
                  <span className={item.done ? "text-gray-500 line-through" : "text-sm"}>{item.task}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
