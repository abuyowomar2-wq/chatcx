"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Search, Send, Paperclip, Bot, X, ChevronLeft, Filter,
  Phone, Mail, ShoppingBag, Star, Clock, UserCheck, Tag, MoreHorizontal, MessageSquare
} from "lucide-react";

interface Conversation {
  id: string;
  customer: { id: string; name: string | null; phone: string | null };
  status: string;
  priority: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  assignedAgent: { id: string; name: string } | null;
  tags: { tag: { id: string; name: string; color: string } }[];
}

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<any>(null);
  const [showCustomerPanel, setShowCustomerPanel] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [filterStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  async function fetchConversations() {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/conversations?${params}`);
    const data = await res.json();
    if (data.success) setConversations(data.data);
  }

  async function selectConversation(id: string) {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    if (data.success) setSelectedConv(data.data);
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedConv) return;
    const res = await fetch(`/api/conversations/${selectedConv.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "message", body: messageText }),
    });
    const data = await res.json();
    if (data.success) {
      setMessageText("");
      selectConversation(selectedConv.id);
    }
  }

  const filters = [
    { label: "الكل", value: "" },
    { label: "غير مقروءة", value: "OPEN" },
    { label: "مفتوحة", value: "OPEN" },
    { label: "بانتظار العميل", value: "PENDING_CUSTOMER" },
    { label: "بانتظار الموظف", value: "PENDING_AGENT" },
    { label: "مغلقة", value: "CLOSED" },
    { label: "مسندة لي", value: "assigned" },
    { label: "غير مسندة", value: "unassigned" },
  ];

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-4 lg:-m-6">
      {/* Filters sidebar - mobile responsive */}
      <div className="hidden lg:flex w-56 flex-col border-l bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-3 border-b dark:border-gray-800">
          <h2 className="font-semibold">الفلاتر</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => setFilterStatus(f.value === "unassigned" ? "unassigned=true" : f.value)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === f.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Conversation list */}
      <div className={`flex flex-col w-full lg:w-80 border-l bg-white dark:bg-gray-900 dark:border-gray-800 ${
        selectedConv ? "hidden lg:flex" : "flex"
      }`}>
        <div className="p-3 border-b dark:border-gray-800">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="بحث في المحادثات..."
              className="pr-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => selectConversation(conv.id)}
              className={`w-full text-right p-3 border-b hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50 transition-colors ${
                selectedConv?.id === conv.id ? "bg-primary/5" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {conv.customer.name?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      {conv.customer.name || conv.customer.phone || "عميل"}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate mt-0.5">
                    {conv.lastMessagePreview || "بدون رسائل"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {conv.unreadCount > 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        {conv.unreadCount}
                      </Badge>
                    )}
                    {conv.assignedAgent && (
                      <span className="text-[10px] text-gray-400">{conv.assignedAgent.name}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))}
          {conversations.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <MessageSquare className="h-12 w-12 mb-3" />
              <p className="text-sm">لا توجد محادثات</p>
            </div>
          )}
        </div>
      </div>

      {/* Conversation view */}
      {selectedConv ? (
        <div className="flex flex-1 flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 p-3 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
            <button onClick={() => setSelectedConv(null)} className="lg:hidden p-1 hover:bg-gray-100 rounded dark:hover:bg-gray-800">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {selectedConv.customer?.name?.[0] || "?"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium text-sm">{selectedConv.customer?.name || "عميل"}</p>
              <p className="text-xs text-gray-500">{selectedConv.customer?.phone || ""}</p>
            </div>
            <div className="flex items-center gap-1">
              <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" title="معلومات العميل" onClick={() => setShowCustomerPanel(!showCustomerPanel)}>
                <UserCheck className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" title="الذكاء الاصطناعي">
                <Bot className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" title="المزيد">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto inbox-messages p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {selectedConv.messages?.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.direction === "INBOUND" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.direction === "INBOUND"
                    ? "bg-white dark:bg-gray-800 shadow-sm rounded-tr-sm"
                    : msg.source === "INTERNAL_NOTE"
                    ? "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-sm"
                    : "bg-primary text-primary-foreground rounded-tl-sm"
                }`}>
                  {msg.source === "INTERNAL_NOTE" && (
                    <p className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                      ملاحظة داخلية - {msg.sender?.name || "موظف"}
                    </p>
                  )}
                  {msg.isAiSuggested && (
                    <p className="text-[10px] font-medium text-purple-500 mb-1">اقتراح AI</p>
                  )}
                  <p className="text-sm">{msg.body}</p>
                  <p className="text-[10px] mt-1 opacity-60 text-left">
                    {new Date(msg.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                    {msg.status === "READ" && msg.direction === "OUTBOUND" && " ✓✓"}
                    {msg.status === "DELIVERED" && msg.direction === "OUTBOUND" && " ✓✓"}
                    {msg.status === "SENT" && msg.direction === "OUTBOUND" && " ✓"}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t bg-white p-3 dark:bg-gray-900 dark:border-gray-800">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  className="w-full rounded-xl border p-3 pr-10 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                  rows={2}
                  placeholder="اكتب رسالتك هنا..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
              </div>
              <div className="flex items-center gap-1">
                <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" title="إرفاق ملف">
                  <Paperclip className="h-5 w-5 text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg dark:hover:bg-gray-800" title="اقتراح رد بالذكاء الاصطناعي">
                  <Bot className="h-5 w-5 text-purple-500" />
                </button>
                <Button onClick={sendMessage} size="icon" className="rounded-xl">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50 dark:bg-gray-950">
          <div className="text-center text-gray-400">
            <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">اختر محادثة</h3>
            <p className="text-sm">اختر محادثة من القائمة لعرضها</p>
          </div>
        </div>
      )}

      {/* Customer info panel */}
      {selectedConv && showCustomerPanel && (
        <div className="hidden lg:flex w-72 flex-col border-r bg-white dark:bg-gray-900 dark:border-gray-800">
          <div className="p-4 border-b dark:border-gray-800">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-2">
                <AvatarFallback className="bg-primary/10 text-primary text-xl">
                  {selectedConv.customer?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold">{selectedConv.customer?.name || "عميل"}</h3>
              <p className="text-sm text-gray-500">آخر ظهور: منذ يوم</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span dir="ltr" className="text-sm">{selectedConv.customer?.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="h-4 w-4 text-gray-400" />
                <span>5 طلبات</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-gray-400" />
                <span>عميل مميز</span>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">الوسوم</h4>
              <div className="flex flex-wrap gap-1">
                <Badge variant="success" className="text-[10px]">عميل مميز</Badge>
                <Badge variant="info" className="text-[10px]">استفسار</Badge>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">آخر الطلبات</h4>
              <div className="space-y-2">
                {[
                  { num: "ORD-1005", amount: "450 ريال", status: "تم الشحن" },
                  { num: "ORD-1004", amount: "230 ريال", status: "تم التوصيل" },
                ].map((order, i) => (
                  <div key={i} className="rounded-lg border p-2 text-xs dark:border-gray-700">
                    <p className="font-medium">{order.num}</p>
                    <p className="text-gray-500">{order.amount}</p>
                    <Badge variant="success" className="text-[10px] mt-1">{order.status}</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Mail className="h-4 w-4 ml-2" />
                فتح صفحة العميل
              </Button>
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Phone className="h-4 w-4 ml-2" />
                نسخ رقم الجوال
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
