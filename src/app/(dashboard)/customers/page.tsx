"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { Search, Download, UserPlus } from "lucide-react";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [source, setSource] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [search, source]);

  async function fetchCustomers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (source) params.set("source", source);

    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    if (data.success) setCustomers(data.data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">العملاء</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة العملاء ومتابعة نشاطهم</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير CSV
          </Button>
          <Button>
            <UserPlus className="h-4 w-4 ml-2" />
            إضافة عميل
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث بالاسم، الجوال، أو البريد..."
                className="pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              options={[
                { value: "", label: "كل المصادر" },
                { value: "salla", label: "سلة" },
                { value: "whatsapp", label: "واتساب" },
                { value: "manual", label: "يدوي" },
              ]}
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className="w-40"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الجوال</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الطلبات</TableHead>
                <TableHead>الإجمالي</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>الوسوم</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell>
                </TableRow>
              ) : customers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-400">لا يوجد عملاء</TableCell>
                </TableRow>
              ) : (
                customers.map((c: any) => (
                  <TableRow key={c.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">{c.name || "—"}</TableCell>
                    <TableCell dir="ltr">{c.phone || "—"}</TableCell>
                    <TableCell>{c.email || "—"}</TableCell>
                    <TableCell>{c.city || "—"}</TableCell>
                    <TableCell>{c.totalOrders}</TableCell>
                    <TableCell>{c.totalSpent} ر.س</TableCell>
                    <TableCell>
                      <Badge variant={c.source === "salla" ? "info" : c.source === "whatsapp" ? "success" : "secondary"}>
                        {c.source === "salla" ? "سلة" : c.source === "whatsapp" ? "واتساب" : "يدوي"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.tags?.slice(0, 2).map((t: any) => (
                          <Badge key={t.id} variant="outline" className="text-[10px]" style={{ borderColor: t.tag.color }}>
                            {t.tag.name}
                          </Badge>
                        ))}
                        {c.tags?.length > 2 && <span className="text-xs text-gray-400">+{c.tags.length - 2}</span>}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
