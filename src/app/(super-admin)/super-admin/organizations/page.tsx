"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function SuperAdminOrganizations() {
  const [orgs, setOrgs] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/organizations")
      .then((r) => r.json())
      .then((d) => d.success && setOrgs(d.data));
  }, []);

  async function toggleOrgStatus(id: string, action: string) {
    await fetch("/api/super-admin/organizations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    const res = await fetch("/api/super-admin/organizations");
    const d = await res.json();
    if (d.success) setOrgs(d.data);
  }

  const filtered = orgs.filter((o: any) =>
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">المتاجر</h1>
          <p className="text-gray-400">إدارة جميع المتاجر المسجلة</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="بحث عن متجر..."
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
                <TableHead className="text-gray-400">المتجر</TableHead>
                <TableHead className="text-gray-400">الأعضاء</TableHead>
                <TableHead className="text-gray-400">الاشتراك</TableHead>
                <TableHead className="text-gray-400">الحالة</TableHead>
                <TableHead className="text-gray-400">المحادثات</TableHead>
                <TableHead className="text-gray-400">سلة</TableHead>
                <TableHead className="text-gray-400">واتساب</TableHead>
                <TableHead className="text-gray-400"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((org: any) => (
                <TableRow key={org.id} className="border-gray-800">
                  <TableCell>
                    <div>
                      <p className="font-medium text-white">{org.name}</p>
                      <p className="text-xs text-gray-500">{org.slug}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-400">{org.members?.length || 0}</TableCell>
                  <TableCell>
                    <Badge variant={org.subscriptions?.[0]?.status === "ACTIVE" ? "success" : "warning"}>
                      {org.subscriptions?.[0]?.plan?.name || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={org.isActive ? "success" : "destructive"}>
                      {org.isActive ? "نشط" : "موقوف"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">{org._count?.conversations || 0}</TableCell>
                  <TableCell>
                    {org.sallaConnections?.[0]?.isConnected ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    {org.whatsappConnections?.[0]?.isConnected ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-gray-600" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {org.isActive ? (
                        <Button variant="ghost" size="sm" className="text-red-400" onClick={() => toggleOrgStatus(org.id, "suspend")}>
                          <AlertTriangle className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button variant="ghost" size="sm" className="text-green-400" onClick={() => toggleOrgStatus(org.id, "activate")}>
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
