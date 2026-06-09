"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Search, Send, Paperclip, Bot, ChevronLeft,
  Phone, Mail, ShoppingBag, UserCheck, MoreHorizontal, MessageSquare, X
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
  const [unassignedFilter, setUnassignedFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  async function fetchConversations() {
    const params = new URLSearchParams();
    if (filterStatus) params.set("status", filterStatus);
    if (unassignedFilter) params.set("unassigned", "true");
    const res = await fetch(`/api/conversations?${params}`);
    const data = await res.json();
    if (data.success) setConversations(data.data);
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    fetchConversations();
  }, [filterStatus, unassignedFilter]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages, selectedConv?.internalNotes]);

  async function selectConversation(id: string) {
    const res = await fetch(`/api/conversations/${id}`);
    const data = await res.json();
    if (data.success) {
      setSelectedConv(data.data);
      if (data.data.unreadCount > 0) {
        const convInList = conversations.find((c) => c.id === id);
        if (convInList) {
          setConversations((prev) =>
            prev.map((c) => (c.id === id ? { ...c, unreadCount: 0 } : c))
          );
        }
      }
    }
  }

  async function sendMessage() {
    if (!messageText.trim() || !selectedConv || sending) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${selectedConv.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "message", body: messageText }),
    });
    const data = await res.json();
    if (data.success) {
      setMessageText("");
      await selectConversation(selectedConv.id);
      fetchConversations();
    }
    setSending(false);
  }

  function handleFilterClick(value: string) {
    if (value === "unassigned") {
      setFilterStatus("");
      setUnassignedFilter(true);
    } else if (value === "assigned_me") {
      setFilterStatus("");
      setUnassignedFilter(false);
    } else {
      setUnassignedFilter(false);
      setFilterStatus(value);
    }
  }

  function isFilterActive(value: string): boolean {
    if (value === "unassigned") return unassignedFilter;
    if (value === "assigned_me") return false;
    return filterStatus === value;
  }

  const filters = [
    { label: "الكل", value: "" },
    { label: "مفتوحة", value: "OPEN" },
    { label: "بانتظار العميل", value: "PENDING_CUSTOMER" },
    { label: "بانتظار الموظف", value: "PENDING_AGENT" },
    { label: "مغلقة", value: "CLOSED" },
    { label: "غير مسندة", value: "unassigned" },
  ];

  const filteredConversations = searchQuery
    ? conversations.filter(
        (c) =>
          (c.customer.name || "").includes(searchQuery) ||
          (c.customer.phone || "").includes(searchQuery) ||
          (c.lastMessagePreview || "").includes(searchQuery)
      )
    : conversations;

  return (
    <div className="flex h-[calc(100vh-7rem)] -m-4 lg:-m-6">
      {/* Filters sidebar */}
      <div className="hidden lg:flex w-56 flex-col border-l bg-white dark:bg-gray-900 dark:border-gray-800">
        <div className="p-3 border-b dark:border-gray-800">
          <h2 className="font-semibold">الفلاتر</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filters.map((f) => (
            <button
              key={f.label}
              onClick={() => handleFilterClick(f.value)}
              className={`w-full text-right px-3 py-2 rounded-lg text-sm transition-colors ${
                isFilterActive(f.value)
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
          {filteredConversations.map((conv) => (
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
                      {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : ""}
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
          {filteredConversations.length === 0 && (
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
              <p className="text-xs text-gray-500" dir="ltr">{selectedConv.customer?.phone || ""}</p>
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

          {/* Messages + internal notes */}
          <div className="flex-1 overflow-y-auto inbox-messages p-4 space-y-3 bg-gray-50 dark:bg-gray-950">
            {selectedConv.messages?.map((msg: any) => (
              <div key={msg.id} className={`flex ${msg.direction === "INBOUND" ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                  msg.direction === "INBOUND"
                    ? "bg-white dark:bg-gray-800 shadow-sm rounded-tr-sm"
                    : "bg-primary text-primary-foreground rounded-tl-sm"
                }`}>
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

            {selectedConv.internalNotes?.map((note: any) => (
              <div key={`note-${note.id}`} className="flex justify-center">
                <div className="max-w-[80%] rounded-lg px-4 py-2.5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                  <p className="text-[10px] font-medium text-yellow-600 dark:text-yellow-400 mb-1">
                    ملاحظة داخلية — {note.author?.name || "موظف"}
                  </p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{note.body}</p>
                  <p className="text-[10px] mt-1 text-gray-400">
                    {new Date(note.createdAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
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
                <Button onClick={sendMessage} size="icon" className="rounded-xl" disabled={sending}>
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
              <p className="text-sm text-gray-500">{selectedConv.customer?.city || ""}</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400 shrink-0" />
                <span dir="ltr" className="text-sm truncate">{selectedConv.customer?.phone || "—"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShoppingBag className="h-4 w-4 text-gray-400 shrink-0" />
                <span>{selectedConv.customer?.totalOrders ?? 0} طلبات</span>
              </div>
              {selectedConv.customer?.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-sm truncate" dir="ltr">{selectedConv.customer.email}</span>
                </div>
              )}
            </div>

            {selectedConv.tags?.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">الوسوم</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedConv.tags.map((ct: any) => (
                    <Badge key={ct.id} variant="outline" className="text-[10px]" style={{ borderColor: ct.tag.color, color: ct.tag.color }}>
                      {ct.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-sm" size="sm">
                <Mail className="h-4 w-4 ml-2" />
                فتح صفحة العميل
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start text-sm"
                size="sm"
                onClick={() => {
                  if (selectedConv.customer?.phone) {
                    navigator.clipboard.writeText(selectedConv.customer.phone);
                  }
                }}
              >
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
