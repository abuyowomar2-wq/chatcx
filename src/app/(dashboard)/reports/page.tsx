"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Clock, MessageSquare, Users } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التقارير</h1>
        <p className="text-gray-500 dark:text-gray-400">تحليل أداء خدمة العملاء</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">متوسط وقت الرد</p>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">2.5 د</p>
            <p className="text-xs text-green-500 mt-1">↓ 15% عن الأسبوع الماضي</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">المحادثات اليوم</p>
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">24</p>
            <p className="text-xs text-green-500 mt-1">↑ 8% عن الأمس</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500">رضا العملاء</p>
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <p className="text-3xl font-bold">94%</p>
            <p className="text-xs text-green-500 mt-1">ممتاز</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">المحادثات حسب اليوم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48 flex items-end gap-2">
              {[12, 19, 8, 24, 15, 20, 18].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-gray-400">{val}</span>
                  <div
                    className="w-full rounded-t bg-primary/80"
                    style={{ height: `${(val / 24) * 100}%`, minHeight: 4 }}
                  />
                  <span className="text-[10px] text-gray-400">{["س", "ح", "ن", "ر", "خ", "ج", "س"][i]}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">أداء الموظفين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "أحمد محمد", convs: 15, avg: "1.2 د" },
                { name: "سارة خالد", convs: 12, avg: "2.1 د" },
                { name: "محمود علي", convs: 8, avg: "3.5 د" },
              ].map((emp, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b last:border-0 dark:border-gray-800">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{emp.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{emp.convs} محادثة</span>
                    <span>{emp.avg}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
