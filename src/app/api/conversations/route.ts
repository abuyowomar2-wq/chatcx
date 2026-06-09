import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConversations } from "@/server/services/conversation-service";
import { prisma } from "@/server/db/prisma";
import type { ConversationStatus } from "@/generated/prisma";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") as ConversationStatus | null;
  const assignedAgentId = url.searchParams.get("assignedAgentId");
  const unassigned = url.searchParams.get("unassigned") === "true";
  const customerId = url.searchParams.get("customerId");
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "50");

  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } },
  });

  const effectiveAgentId =
    member?.role === "AGENT" ? session.user.id : (assignedAgentId || undefined);

  const result = await getConversations(orgId, {
    status: status || undefined,
    assignedAgentId: effectiveAgentId,
    unassigned: unassigned || undefined,
    customerId: customerId || undefined,
    limit,
    offset: (page - 1) * limit,
  });

  return NextResponse.json({
    success: true,
    data: result.conversations,
    total: result.total,
    page,
    pageSize: limit,
    totalPages: Math.ceil(result.total / limit),
  });
}
