"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

const statusColors: Record<string, "success" | "warning" | "destructive" | "secondary"> = {
  TRIALING: "warning",
  ACTIVE: "success",
  PAST_DUE: "destructive",
  SUSPENDED: "destructive",
  CANCELLED: "secondary",
  EXPIRED: "destructive",
};

export default function SuperAdminSubscriptions() {
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    fetch("/api/super-admin/subscriptions")
      .then((r) => r.json())
      .then((d) => d.success && setSubs(d.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">الاشتراكات</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">المتجر</TableHead>
                <TableHead className="text-gray-400">الخطة</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400">تاريخ البداية</TableHead>
                <TableHead className="text-gray-400">تاريخ النهاية</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subs.map((sub: any) => (
                <TableRow key={sub.id} className="border-gray-800">
                  <TableCell className="text-white">{sub.organization?.name || "—"}</TableCell>
                  <TableCell className="text-gray-400">{sub.plan?.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={statusColors[sub.status] || "secondary"}>
                      {sub.status === "TRIALING" ? "تجربة" :
                       sub.status === "ACTIVE" ? "نشط" :
                       sub.status === "PAST_DUE" ? "متأخر" :
                       sub.status === "SUSPENDED" ? "موقوف" :
                       sub.status === "CANCELLED" ? "ملغي" :
                       sub.status === "EXPIRED" ? "منتهي" : sub.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(sub.currentPeriodStart).toLocaleDateString("ar-SA")}
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {new Date(sub.currentPeriodEnd).toLocaleDateString("ar-SA")}
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
