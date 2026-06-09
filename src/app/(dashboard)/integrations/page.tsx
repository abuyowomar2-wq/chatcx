"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ShoppingCart, MessageSquare, CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react";

export default function IntegrationsPage() {
  const [sallaStatus, setSallaStatus] = useState<any>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);

  useEffect(() => {
    fetchSallaStatus();
    fetchWhatsappStatus();
  }, []);

  async function fetchSallaStatus() {
    const res = await fetch("/api/integrations/salla/status");
    const data = await res.json();
    if (data.success) setSallaStatus(data.data);
  }

  async function fetchWhatsappStatus() {
    const res = await fetch("/api/integrations/whatsapp/status");
    const data = await res.json();
    if (data.success) setWhatsappStatus(data.data);
  }

  async function connectSalla() {
    const res = await fetch("/api/integrations/salla/connect");
    const data = await res.json();
    if (data.success && data.data.url) {
      window.location.href = data.data.url;
    }
  }

  async function disconnectSalla() {
    await fetch("/api/integrations/salla/disconnect", { method: "POST" });
    fetchSallaStatus();
  }

  async function syncSalla() {
    await fetch("/api/integrations/salla/sync", { method: "POST" });
    fetchSallaStatus();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">التكاملات</h1>
        <p className="text-gray-500 dark:text-gray-400">ربط المتجر وقنوات التواصل</p>
      </div>

      {/* Salla Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>سلة</CardTitle>
                <CardDescription>ربط متجرك في سلة لاستيراد العملاء والطلبات</CardDescription>
              </div>
            </div>
            <Badge variant={sallaStatus?.isConnected ? "success" : "secondary"} className="text-sm px-3 py-1">
              {sallaStatus?.isConnected ? "متصل" : "غير متصل"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {sallaStatus?.isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>متصل بحساب: {sallaStatus.merchantName || "—"}</span>
              </div>
              {sallaStatus.lastSyncAt && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <RefreshCw className="h-4 w-4" />
                  <span>آخر مزامنة: {new Date(sallaStatus.lastSyncAt).toLocaleString("ar-SA")}</span>
                </div>
              )}
              {sallaStatus.lastErrorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{sallaStatus.lastErrorMessage}</span>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={syncSalla} variant="outline">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  مزامنة الآن
                </Button>
                <Button onClick={disconnectSalla} variant="destructive" size="sm">
                  قطع الاتصال
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">اربط متجرك في سلة لاستيراد العملاء والطلبات تلقائيًا</p>
              <Button onClick={connectSalla}>
                <ShoppingCart className="h-4 w-4 ml-2" />
                ربط سلة
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/20">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div>
                <CardTitle>واتساب</CardTitle>
                <CardDescription>ربط رقم واتساب بزنس لاستقبال وإرسال الرسائل</CardDescription>
              </div>
            </div>
            <Badge variant={whatsappStatus?.isConnected ? "success" : "secondary"} className="text-sm px-3 py-1">
              {whatsappStatus?.isConnected ? "متصل" : "غير متصل"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {whatsappStatus?.isConnected ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>متصل بالرقم: {whatsappStatus.phoneNumber || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Badge variant={whatsappStatus.webhookVerified ? "success" : "warning"}>
                  {whatsappStatus.webhookVerified ? "Webhook متصل" : "بانتظار التحقق من Webhook"}
                </Badge>
              </div>
              {whatsappStatus.lastErrorMessage && (
                <div className="flex items-center gap-2 text-sm text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  <span>{whatsappStatus.lastErrorMessage}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">اربط رقم واتساب بزنس لاستقبال رسائل العملاء والرد عليهم</p>
              <Button>
                <MessageSquare className="h-4 w-4 ml-2" />
                ربط واتساب
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
