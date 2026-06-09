"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Store, Users, CreditCard, Activity } from "lucide-react";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then((r) => r.json())
      .then((d) => d.success && setStats(d.data))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">لوحة الإدارة</h1>
        <p className="text-gray-400">نظرة عامة على المنصة</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">إجمالي المتاجر</p>
                <p className="text-3xl font-bold text-white">{stats?.totalOrganizations || 0}</p>
              </div>
              <Store className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">إجمالي المستخدمين</p>
                <p className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">الاشتراكات النشطة</p>
                <p className="text-3xl font-bold text-white">{stats?.activeSubscriptions || 0}</p>
              </div>
              <CreditCard className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">إجمالي الرسائل</p>
                <p className="text-3xl font-bold text-white">{stats?.totalMessages || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            <button className="rounded-lg border border-gray-700 p-4 text-right hover:bg-gray-800 transition-colors">
              <p className="text-white font-medium">إدارة المتاجر</p>
              <p className="text-sm text-gray-400">عرض وتعطيل المتاجر</p>
            </button>
            <button className="rounded-lg border border-gray-700 p-4 text-right hover:bg-gray-800 transition-colors">
              <p className="text-white font-medium">الاشتراكات</p>
              <p className="text-sm text-gray-400">إدارة خطط الأسعار</p>
            </button>
            <button className="rounded-lg border border-gray-700 p-4 text-right hover:bg-gray-800 transition-colors">
              <p className="text-white font-medium">طلبات العملاء</p>
              <p className="text-sm text-gray-400">متابعة طلبات الدعم</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
