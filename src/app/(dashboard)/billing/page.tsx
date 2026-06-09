"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const plans = [
  {
    name: "تجربة مجانية",
    price: "مجانًا",
    period: "14 يوم",
    features: ["موظف واحد", "100 محادثة", "500 رسالة", "ردود جاهزة"],
    current: true,
  },
  {
    name: "أساسي",
    price: "99",
    period: "شهريًا",
    features: ["3 موظفين", "500 محادثة", "2000 رسالة", "ردود جاهزة", "تقارير"],
    current: false,
  },
  {
    name: "احترافي",
    price: "299",
    period: "شهريًا",
    features: ["10 موظفين", "2000 محادثة", "10000 رسالة", "ذكاء اصطناعي", "أتمتة"],
    current: false,
  },
  {
    name: "بزنس",
    price: "599",
    period: "شهريًا",
    features: ["50 موظف", "غير محدود", "50000 رسالة", "دعم أولوية", "API"],
    current: false,
  },
];

export default function BillingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">الفواتير والاشتراك</h1>
        <p className="text-gray-500 dark:text-gray-400">إدارة خطتك وفواتيرك</p>
      </div>

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle>الخطة الحالية</CardTitle>
          <CardDescription>تجربة مجانية - 14 يوم متبقي</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">تجربة مجانية</p>
              <p className="text-sm text-gray-500">تنتهي في 23 يونيو 2026</p>
            </div>
            <Badge variant="success" className="text-sm px-3 py-1">نشط</Badge>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-2 w-1/3 rounded-full bg-primary" />
              </div>
              <span>47/100 محادثة</span>
            </div>
          </div>
          <div className="mt-4">
            <Button variant="outline">ترقية الخطة</Button>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <Card key={plan.name} className={`relative ${plan.current ? "ring-2 ring-primary" : ""}`}>
            {plan.current && (
              <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2">الحالية</Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <div>
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-sm text-gray-500 mr-1">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-green-500">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.current ? "outline" : "default"}>
                {plan.current ? "خطتك الحالية" : "الاشتراك"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
