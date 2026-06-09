"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Shield, Ban } from "lucide-react";

export default function SuperAdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/users")
      .then((r) => r.json())
      .then((d) => d.success && setUsers(d.data));
  }, []);

  async function toggleUser(id: string, action: string) {
    await fetch("/api/super-admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const res = await fetch("/api/super-admin/users");
    const d = await res.json();
    if (d.success) setUsers(d.data);
  }

  const filtered = users.filter((u: any) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">المستخدمين</h1>
      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث..."
          className="pr-9 bg-gray-900 border-gray-700 text-white"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">الاسم</TableHead>
                <TableHead className="text-gray-400">البريد</TableHead>
                <TableHead className="text-gray-400">المتاجر</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400">آخر دخول</TableHead>
                <TableHead className="text-gray-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user: any) => (
                <TableRow key={user.id} className="border-gray-800">
                  <TableCell className="text-white">{user.name || "—"}</TableCell>
                  <TableCell className="text-gray-400">{user.email}</TableCell>
                  <TableCell className="text-gray-400">
                    {user.organizationMembers?.map((m: any) => m.organization.name).join(", ") || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "success" : "destructive"}>
                      {user.isActive ? "نشط" : "محظور"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString("ar-SA") : "—"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={user.isActive ? "text-red-400" : "text-green-400"}
                      onClick={() => toggleUser(user.id, user.isActive ? "block" : "unblock")}
                    >
                      <Ban className="h-4 w-4 ml-1" />
                      {user.isActive ? "حظر" : "إلغاء الحظر"}
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
