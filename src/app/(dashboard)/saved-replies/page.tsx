"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, Plus, Copy } from "lucide-react";

const sampleReplies = [
  { id: "1", title: "ترحيب", body: "أهلاً بك في {{store_name}}! كيف أقدر أساعدك اليوم؟", category: "ترحيب", shortcut: "/ترحيب" },
  { id: "2", title: "استفسار عن طلب", body: "أهلاً {{customer_name}}، طلبك رقم {{order_id}} حالته: {{order_status}}", category: "طلبات", shortcut: "/طلب" },
  { id: "3", title: "مدة التوصيل", body: "مدة التوصيل المتوقعة {{delivery_time}} أيام عمل.", category: "عام", shortcut: "/توصيل" },
  { id: "4", title: "شكر", body: "شكراً لتواصلك مع {{store_name}}. في خدمتك دائمًا!", category: "عام", shortcut: "/شكر" },
  { id: "5", title: "طلب الشحن", body: "طلبك رقم {{order_id}} تم شحنه. يمكنك تتبعه عبر الرابط: {{tracking_url}}", category: "طلبات", shortcut: "/شحن" },
];

export default function SavedRepliesPage() {
  const [search, setSearch] = useState("");

  const filtered = sampleReplies.filter(
    (r) => r.title.includes(search) || r.body.includes(search) || r.category.includes(search)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الردود الجاهزة</h1>
          <p className="text-gray-500 dark:text-gray-400">ردود سريعة جاهزة للاستخدام في المحادثات</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          إضافة رد
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث في الردود..."
              className="pr-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العنوان</TableHead>
                <TableHead>التصنيف</TableHead>
                <TableHead>الاختصار</TableHead>
                <TableHead>نص الرد</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((reply) => (
                <TableRow key={reply.id}>
                  <TableCell className="font-medium">{reply.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{reply.category}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500 font-mono text-xs">{reply.shortcut}</TableCell>
                  <TableCell className="max-w-xs truncate text-gray-500">{reply.body}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
