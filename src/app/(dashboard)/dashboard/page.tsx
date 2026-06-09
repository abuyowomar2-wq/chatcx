"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Users, ShoppingCart, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

interface DashboardData {
  openConversations: number;
  unreadConversations: number;
  totalConversationsToday: number;
  newCustomersToday: number;
  totalOrders: number;
  sallaConnected: boolean;
  whatsappConnected: boolean;
  avgResponseTimeMinutes: number;
  recentConversations: { id: string; customerName: string; lastMessagePreview: string; lastMessageAt: string }[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
          <div className="h-5 w-72 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-5 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-2" />
                <div className="h-8 w-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const formattedAvgTime = stats?.avgResponseTimeMinutes != null
    ? stats.avgResponseTimeMinutes < 1
      ? "أقل من دقيقة"
      : `${stats.avgResponseTimeMinutes.toFixed(1)} د`
    : "—";

  const checklistItems = [
    { task: "أكمل بيانات المتجر", done: true },
    { task: "اربط متجر سلة", done: stats?.sallaConnected ?? false },
    { task: "اربط واتساب", done: stats?.whatsappConnected ?? false },
    { task: "أضف أول موظف", done: false },
    { task: "أنشئ أول رد جاهز", done: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">لوحة التحكم</h1>
        <p className="text-gray-500 dark:text-gray-400">نظرة عامة على أداء خدمة العملاء</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">المحادثات المفتوحة</p>
                <p className="text-3xl font-bold">{stats?.openConversations ?? 0}</p>
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
                <p className="text-3xl font-bold text-red-500">{stats?.unreadConversations ?? 0}</p>
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
                <p className="text-3xl font-bold">{stats?.newCustomersToday ?? 0}</p>
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
                <p className="text-3xl font-bold">{formattedAvgTime}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/20">
                <Clock className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
              {stats?.sallaConnected ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <p className="font-medium">{stats?.sallaConnected ? "متصل" : "غير متصل"}</p>
                <p className="text-sm text-gray-500">
                  {stats?.sallaConnected ? "المتجر مربوط بنجاح" : "اربط متجرك من صفحة التكاملات"}
                </p>
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
              {stats?.whatsappConnected ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <AlertCircle className="h-8 w-8 text-gray-400" />
              )}
              <div>
                <p className="font-medium">{stats?.whatsappConnected ? "متصل" : "غير متصل"}</p>
                <p className="text-sm text-gray-500">
                  {stats?.whatsappConnected ? "واتساب مربوط بنجاح" : "اربط واتساب من صفحة التكاملات"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">آخر المحادثات</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.recentConversations && stats.recentConversations.length > 0 ? (
              <div className="space-y-3">
                {stats.recentConversations.map((item) => (
                  <div key={item.id} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800">
                    <div>
                      <p className="font-medium text-sm">{item.customerName || "عميل"}</p>
                      <p className="text-sm text-gray-500 truncate max-w-[200px]">{item.lastMessagePreview || "—"}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {item.lastMessageAt
                        ? new Date(item.lastMessageAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 py-4 text-center">لا توجد محادثات بعد</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">قائمة الإنجاز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {checklistItems.map((item, i) => (
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
