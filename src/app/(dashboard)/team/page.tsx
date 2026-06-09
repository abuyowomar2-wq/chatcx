"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Select } from "@/components/ui/select";
import { UserPlus, Mail, MoreHorizontal, Shield, ShieldCheck, ShieldAlert } from "lucide-react";

const roleLabels: Record<string, string> = {
  OWNER: "مالك",
  ADMIN: "مدير",
  MANAGER: "مشرف",
  AGENT: "موظف",
  VIEWER: "مشاهد",
};

const roleIcons: Record<string, any> = {
  OWNER: ShieldAlert,
  ADMIN: ShieldCheck,
  MANAGER: Shield,
  AGENT: Shield,
  VIEWER: Shield,
};

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("AGENT");

  useEffect(() => {
    fetch("/api/team")
      .then((r) => r.json())
      .then((d) => d.success && setMembers(d.data));
  }, []);

  async function sendInvite() {
    const res = await fetch("/api/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, role }),
    });
    const data = await res.json();
    if (data.success) {
      setShowInvite(false);
      setEmail("");
      setRole("AGENT");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الفريق</h1>
          <p className="text-gray-500 dark:text-gray-400">إدارة أعضاء الفريق والصلاحيات</p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <UserPlus className="h-4 w-4 ml-2" />
          دعوة موظف
        </Button>
      </div>

      {showInvite && (
        <Card>
          <CardHeader>
            <CardTitle>دعوة عضو جديد</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الدور</label>
                <Select
                  options={[
                    { value: "ADMIN", label: "مدير" },
                    { value: "MANAGER", label: "مشرف" },
                    { value: "AGENT", label: "موظف" },
                    { value: "VIEWER", label: "مشاهد" },
                  ]}
                  value={role}
                  onChange={(e: any) => setRole(e.target.value)}
                />
              </div>
              <Button onClick={sendInvite}>إرسال الدعوة</Button>
              <Button variant="outline" onClick={() => setShowInvite(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العضو</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>آخر نشاط</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((m: any) => {
                const RoleIcon = roleIcons[m.role] || Shield;
                return (
                  <TableRow key={m.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {m.user.name?.[0] || "?"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{m.user.name || "بدون اسم"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">{m.user.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <RoleIcon className="h-4 w-4 text-primary" />
                        <span>{roleLabels[m.role] || m.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={m.user.isActive ? "success" : "destructive"}>
                        {m.user.isActive ? "نشط" : "موقوف"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {m.user.lastLoginAt
                        ? new Date(m.user.lastLoginAt).toLocaleDateString("ar-SA", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "لم يسجل بعد"}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
