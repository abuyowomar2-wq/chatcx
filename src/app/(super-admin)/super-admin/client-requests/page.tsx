"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function SuperAdminClientRequests() {
  const [requests, setRequests] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/super-admin/client-requests")
      .then((r) => r.json())
      .then((d) => d.success && setRequests(d.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">طلبات العملاء</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 ml-2" />
          تسجيل طلب
        </Button>
      </div>

      {showCreate && (
        <Card className="bg-gray-900 border-gray-800 p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = {
                organizationId: form.orgId.value,
                type: form.type.value,
                contactName: form.contactName.value,
                phone: form.phone.value,
                subject: form.subject.value,
                description: form.description.value,
              };
              await fetch("/api/super-admin/client-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              setShowCreate(false);
              const res = await fetch("/api/super-admin/client-requests");
              const d = await res.json();
              if (d.success) setRequests(d.data);
            }}
            className="grid md:grid-cols-2 gap-3"
          >
            <input name="orgId" placeholder="معرف المنظمة" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" required />
            <select name="type" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
              <option value="TECHNICAL">مشكلة تقنية</option>
              <option value="ACTIVATION">تفعيل</option>
              <option value="INTEGRATION">ربط</option>
              <option value="UPGRADE">ترقية</option>
              <option value="INVOICE">فاتورة</option>
              <option value="SUPPORT">دعم</option>
            </select>
            <input name="contactName" placeholder="اسم جهة الاتصال" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
            <input name="phone" placeholder="رقم الجوال" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
            <input name="subject" placeholder="الموضوع" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" />
            <textarea name="description" placeholder="الوصف" className="rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white" rows={2} />
            <Button type="submit">تسجيل</Button>
          </form>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">النوع</TableHead>
                <TableHead className="text-gray-400">المتجر</TableHead>
                <TableHead className="text-gray-400">الموضوع</TableHead>
                <TableHead className="text-gray-400">الأولوية</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((req: any) => (
                <TableRow key={req.id} className="border-gray-800">
                  <TableCell className="text-gray-400">{req.type}</TableCell>
                  <TableCell className="text-white">{req.organization?.name || "—"}</TableCell>
                  <TableCell className="text-gray-400">{req.subject || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={req.priority === "high" ? "destructive" : req.priority === "urgent" ? "destructive" : "secondary"}>
                      {req.priority === "high" ? "عالية" : req.priority === "urgent" ? "عاجلة" : "عادية"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={
                      req.status === "RESOLVED" ? "success" :
                      req.status === "IN_PROGRESS" ? "warning" : "secondary"
                    }>
                      {req.status === "PENDING" ? "بانتظار" :
                       req.status === "IN_PROGRESS" ? "قيد التنفيذ" :
                       req.status === "RESOLVED" ? "تم الحل" :
                       req.status === "CLOSED" ? "مغلق" : req.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(req.createdAt).toLocaleDateString("ar-SA")}
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
