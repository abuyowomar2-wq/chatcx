import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getConversation, assignConversation, closeConversation, addInternalNote, createMessage } from "@/server/services/conversation-service";
import { createAuditLog } from "@/server/services/audit-log-service";
import { prisma } from "@/server/db/prisma";

async function getMemberRole(orgId: string, userId: string) {
  const member = await prisma.organizationMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId } },
  });
  return member?.role;
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const conversation = await getConversation(id, orgId);
  if (!conversation) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: conversation });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const role = await getMemberRole(orgId, session.user.id);
  if (!role) {
    return NextResponse.json({ success: false, error: "Not a member" }, { status: 403 });
  }

  const body = await req.json();
  const { action } = body;

  switch (action) {
    case "message": {
      const message = await createMessage({
        organizationId: orgId,
        conversationId: id,
        senderId: session.user.id,
        direction: "OUTBOUND",
        source: "SYSTEM",
        body: body.body,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType,
        status: "SENT",
      });

      await createAuditLog({
        organizationId: orgId,
        userId: session.user.id,
        action: "SEND_MESSAGE",
        entityType: "MESSAGE",
        entityId: message.id,
      });

      return NextResponse.json({ success: true, data: message });
    }

    case "assign": {
      if (role === "AGENT" || role === "VIEWER") {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
      await assignConversation(id, body.agentId, orgId);
      await createAuditLog({
        organizationId: orgId,
        userId: session.user.id,
        action: "ASSIGN_CONVERSATION",
        entityType: "CONVERSATION",
        entityId: id,
        metadata: { assignedTo: body.agentId },
      });
      return NextResponse.json({ success: true });
    }

    case "close": {
      if (role === "VIEWER") {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
      await closeConversation(id, session.user.id, orgId);
      await createAuditLog({
        organizationId: orgId,
        userId: session.user.id,
        action: "CLOSE_CONVERSATION",
        entityType: "CONVERSATION",
        entityId: id,
      });
      return NextResponse.json({ success: true });
    }

    case "note": {
      if (role === "VIEWER") {
        return NextResponse.json({ success: false, error: "Not authorized" }, { status: 403 });
      }
      const note = await addInternalNote({
        organizationId: orgId,
        conversationId: id,
        authorId: session.user.id,
        body: body.body,
      });
      return NextResponse.json({ success: true, data: note });
    }

    default:
      return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  }
}
