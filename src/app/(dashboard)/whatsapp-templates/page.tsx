"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

const templates = [
  { name: "order_shipped", lang: "ar", category: "UTILITY", status: "APPROVED", body: "طلبك {{1}} تم شحنه. رقم التتبع: {{2}}" },
  { name: "order_delivered", lang: "ar", category: "UTILITY", status: "APPROVED", body: "طلبك {{1}} تم توصيله. شكراً لتسوقك معنا!" },
  { name: "welcome_message", lang: "ar", category: "MARKETING", status: "PENDING", body: "أهلاً بك في {{1}}! كيف نقدر نساعدك؟" },
];

export default function WhatsAppTemplatesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">قوالب واتساب</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة قوالب الرسائل المعتمدة من Meta</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          قالب جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>اللغة</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>نص القالب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs font-medium">{t.name}</TableCell>
                  <TableCell>{t.lang === "ar" ? "عربي" : "English"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{t.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={t.status === "APPROVED" ? "success" : "warning"}>
                      {t.status === "APPROVED" ? "معتمد" : "قيد المراجعة"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500 truncate max-w-xs">{t.body}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
