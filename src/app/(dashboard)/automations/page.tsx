"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Zap, ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

const automations = [
  { id: "1", name: "رد تلقائي لاستفسار الطلب", trigger: "كلمة مفتاحية", action: "إرسال رسالة", active: true },
  { id: "2", name: "إشعار تغير حالة الطلب", trigger: "تغير حالة طلب", action: "إرسال قالب واتساب", active: true },
  { id: "3", name: "تنبيه المحادثة المتأخرة", trigger: "مدة الانتظار", action: "إشعار المدير", active: false },
  { id: "4", name: "وسم عميل جديد", trigger: "عميل جديد", action: "إضافة وسم", active: true },
];

export default function AutomationsPage() {
  const [items, setItems] = useState(automations);

  function toggle(id: string) {
    setItems(items.map((a) => (a.id === id ? { ...a, active: !a.active } : a)));
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">الأتمتة</h1>
          <p className="text-gray-500 dark:text-gray-400">أتمتة المهام والردود التلقائية</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 ml-2" />
          أتمتة جديدة
        </Button>
      </div>

      <div className="grid gap-4">
        {items.map((a) => (
          <Card key={a.id} className="hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className={`h-5 w-5 ${a.active ? "text-yellow-500" : "text-gray-400"}`} />
                <div>
                  <p className="font-medium">{a.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">{a.trigger}</Badge>
                    <span className="text-gray-400 text-xs">→</span>
                    <Badge variant="secondary" className="text-[10px]">{a.action}</Badge>
                  </div>
                </div>
              </div>
              <button onClick={() => toggle(a.id)} className="text-gray-400 hover:text-primary">
                {a.active ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6" />}
              </button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
