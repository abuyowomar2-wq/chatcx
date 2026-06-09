"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Store, Users, CreditCard, FileText,
  ShoppingBag, AlertCircle, ClipboardList, Settings, Shield,
  Activity, LogOut
} from "lucide-react";

const navItems = [
  { href: "/super-admin/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/super-admin/organizations", label: "المتاجر", icon: Store },
  { href: "/super-admin/users", label: "المستخدمين", icon: Users },
  { href: "/super-admin/subscriptions", label: "الاشتراكات", icon: CreditCard },
  { href: "/super-admin/plans", label: "الخطط", icon: ClipboardList },
  { href: "/super-admin/invoices", label: "الفواتير", icon: FileText },
  { href: "/super-admin/client-requests", label: "طلبات العملاء", icon: ShoppingBag },
  { href: "/super-admin/audit-logs", label: "سجل الأحداث", icon: Shield },
  { href: "/super-admin/errors", label: "الأخطاء", icon: AlertCircle },
  { href: "/super-admin/settings", label: "إعدادات المنصة", icon: Settings },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col bg-gray-900 border-l border-gray-800">
      <div className="flex h-14 items-center gap-2 border-b border-gray-800 px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold">
          SA
        </div>
        <span className="font-bold text-lg text-white">ChatCX Admin</span>
        <span className="mr-auto px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[10px] font-medium">
          SUPER ADMIN
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-800 p-2">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-200"
        >
          <LogOut className="h-5 w-5" />
          <span>العودة للوحة العميل</span>
        </Link>
      </div>
    </aside>
  );
}
