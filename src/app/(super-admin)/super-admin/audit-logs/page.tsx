"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";

export default function SuperAdminAuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetch("/api/super-admin/audit-logs")
      .then((r) => r.json())
      .then((d) => d.success && setLogs(d.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">سجل الأحداث</h1>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">التاريخ</TableHead>
                <TableHead className="text-gray-400">المستخدم</TableHead>
                <TableHead className="text-gray-400">الإجراء</TableHead>
                <TableHead className="text-gray-400">النوع</TableHead>
                <TableHead className="text-gray-400">البيانات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => (
                <TableRow key={log.id} className="border-gray-800">
                  <TableCell className="text-gray-400 text-xs">
                    {new Date(log.createdAt).toLocaleString("ar-SA")}
                  </TableCell>
                  <TableCell className="text-gray-400">{log.user?.name || log.user?.email || "—"}</TableCell>
                  <TableCell>
                    <span className="font-mono text-xs text-white">{log.action}</span>
                  </TableCell>
                  <TableCell className="text-gray-400">{log.entityType || "—"}</TableCell>
                  <TableCell className="text-gray-400 text-xs truncate max-w-[200px]">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
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
