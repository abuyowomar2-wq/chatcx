"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, MessageSquare, Users, ShoppingCart, UserPlus,
  BarChart3, Settings, Bot, Zap, MessageCircle, CreditCard, HelpCircle,
  ChevronLeft, LogOut
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { href: "/inbox", label: "صندوق الوارد", icon: MessageSquare },
  { href: "/customers", label: "العملاء", icon: Users },
  { href: "/orders", label: "الطلبات", icon: ShoppingCart },
  { href: "/team", label: "الفريق", icon: UserPlus },
  { href: "/saved-replies", label: "الردود الجاهزة", icon: MessageCircle },
  { href: "/whatsapp-templates", label: "قوالب واتساب", icon: Bot },
  { href: "/automations", label: "الأتمتة", icon: Zap },
  { href: "/ai-settings", label: "الذكاء الاصطناعي", icon: Bot },
  { href: "/reports", label: "التقارير", icon: BarChart3 },
  { href: "/integrations", label: "التكاملات", icon: Settings },
  { href: "/billing", label: "الفواتير", icon: CreditCard },
  { href: "/settings", label: "الإعدادات", icon: Settings },
  { href: "/help", label: "المساعدة", icon: HelpCircle },
];

export function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full flex-col bg-white border-l dark:bg-gray-900 dark:border-gray-800">
      <div className="flex h-14 items-center gap-2 border-b px-4 dark:border-gray-800">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-sm font-bold">
            CX
          </div>
          <span className="font-bold text-lg">ChatCX</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="mr-auto p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-2 dark:border-gray-800">
        <Link
          href="/logout"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </Link>
      </div>
    </aside>
  );
}
