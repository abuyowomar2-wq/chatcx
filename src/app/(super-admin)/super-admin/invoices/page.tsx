"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function SuperAdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetch("/api/super-admin/invoices")
      .then((r) => r.json())
      .then((d) => d.success && setInvoices(d.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">الفواتير</h1>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4 ml-2" />
          إنشاء فاتورة
        </Button>
      </div>

      {showCreate && (
        <Card className="bg-gray-900 border-gray-800 p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const data = {
                organizationId: formData.get("orgId") as string,
                amount: parseFloat(formData.get("amount") as string),
                dueDate: formData.get("dueDate") as string,
                notes: formData.get("notes") as string,
              };
              await fetch("/api/super-admin/invoices", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              setShowCreate(false);
              const res = await fetch("/api/super-admin/invoices");
              const d = await res.json();
              if (d.success) setInvoices(d.data);
            }}
            className="grid md:grid-cols-2 gap-3"
          >
            <Input name="orgId" placeholder="معرف المنظمة" className="bg-gray-800 border-gray-700" required />
            <Input name="amount" type="number" placeholder="المبلغ" className="bg-gray-800 border-gray-700" required />
            <Input name="dueDate" type="date" className="bg-gray-800 border-gray-700" required />
            <Input name="notes" placeholder="ملاحظات" className="bg-gray-800 border-gray-700" />
            <Button type="submit">إنشاء</Button>
          </form>
        </Card>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">رقم الفاتورة</TableHead>
                <TableHead className="text-gray-400">المتجر</TableHead>
                <TableHead className="text-gray-400">المبلغ</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400">تاريخ الاستحقاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv: any) => (
                <TableRow key={inv.id} className="border-gray-800">
                  <TableCell className="text-white font-mono text-xs">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-gray-400">{inv.organization?.name || "—"}</TableCell>
                  <TableCell className="text-white">{inv.total} {inv.currency}</TableCell>
                  <TableCell>
                    <Badge variant={
                      inv.status === "paid" ? "success" :
                      inv.status === "overdue" ? "destructive" :
                      inv.status === "draft" ? "secondary" : "warning"
                    }>
                      {inv.status === "paid" ? "مدفوعة" :
                       inv.status === "overdue" ? "متأخرة" :
                       inv.status === "draft" ? "مسودة" :
                       inv.status === "sent" ? "مرسلة" : inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(inv.dueDate).toLocaleDateString("ar-SA")}
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
