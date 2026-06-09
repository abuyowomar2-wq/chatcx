"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Search, ExternalLink } from "lucide-react";

const statusColors: Record<string, "success" | "warning" | "info" | "secondary" | "destructive"> = {
  pending: "warning",
  processing: "info",
  shipped: "success",
  delivered: "success",
  cancelled: "destructive",
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    fetchOrders();
  }, [search, status]);

  async function fetchOrders() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(`/api/orders?${params}`);
    const data = await res.json();
    if (data.success) setOrders(data.data);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الطلبات</h1>
        <p className="text-gray-500 dark:text-gray-400">جميع الطلبات المستوردة من سلة</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث برقم الطلب أو الجوال..."
                className="pr-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              <option value="">كل الحالات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="processing">قيد المعالجة</option>
              <option value="shipped">تم الشحن</option>
              <option value="delivered">تم التوصيل</option>
              <option value="cancelled">ملغي</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الجوال</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">جاري التحميل...</TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-400">لا توجد طلبات</TableCell>
                </TableRow>
              ) : (
                orders.map((o: any) => (
                  <TableRow key={o.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <TableCell className="font-medium">{o.orderNumber || "—"}</TableCell>
                    <TableCell>{o.customer?.name || "—"}</TableCell>
                    <TableCell dir="ltr">{o.customer?.phone || "—"}</TableCell>
                    <TableCell>
                      <Badge variant={statusColors[o.status] || "secondary"}>
                        {statusLabels[o.status] || o.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{o.total} {o.currency}</TableCell>
                    <TableCell>{o.paymentMethod || "—"}</TableCell>
                    <TableCell>
                      {o.orderedAt ? new Date(o.orderedAt).toLocaleDateString("ar-SA") : "—"}
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
