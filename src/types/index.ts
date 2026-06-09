import type { OrgRole } from "@/generated/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  isSuperAdmin: boolean;
  organizations: UserOrganization[];
}

export interface UserOrganization {
  id: string;
  role: OrgRole;
  name: string;
  slug: string;
}

export interface OrganizationContext {
  organizationId: string;
  role: OrgRole;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ConversationListItem {
  id: string;
  customerId: string;
  customerName: string | null;
  customerPhone: string | null;
  status: string;
  priority: string;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  unreadCount: number;
  assignedAgentName: string | null;
  tags: { id: string; name: string; color: string }[];
}

export interface CustomerListItem {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  totalOrders: number;
  totalSpent: number;
  lastOrderAt: string | null;
  source: string;
  tags: { id: string; name: string; color: string }[];
}

export interface OrderListItem {
  id: string;
  orderNumber: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: string;
  total: number;
  currency: string;
  orderedAt: string | null;
  paymentMethod: string | null;
}

export interface DashboardStats {
  totalConversationsToday: number;
  openConversations: number;
  unreadConversations: number;
  avgResponseTime: number;
  newCustomersToday: number;
  totalOrders: number;
  recentMessages: { id: string; body: string; createdAt: string; customerName: string | null }[];
  agentPerformance: { name: string; conversationsCount: number; avgResponseTime: number }[];
  sallaConnected: boolean;
  whatsappConnected: boolean;
  alerts: { type: string; message: string }[];
}

export interface MessageItem {
  id: string;
  body: string;
  direction: string;
  source: string;
  status: string;
  createdAt: string;
  senderName: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  isAiSuggested: boolean;
}
