import { NextResponse } from "next/server";
import { prisma } from "@/server/db/prisma";
import { WhatsAppIntegrationService } from "@/integrations/whatsapp";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get("hub.mode") || "";
  const token = url.searchParams.get("hub.verify_token") || "";
  const challenge = url.searchParams.get("hub.challenge") || "";

  const phoneNumberId = url.searchParams.get("phone_number_id");

  if (!phoneNumberId) {
    return NextResponse.json({ error: "Missing phone_number_id" }, { status: 400 });
  }

  const connection = await prisma.whatsAppConnection.findFirst({
    where: { phoneNumberId },
  });

  if (!connection) {
    return NextResponse.json({ error: "Unknown phone number" }, { status: 404 });
  }

  const service = new WhatsAppIntegrationService(connection.organizationId);
  const result = await service.verifyWebhook(mode, token, challenge);

  if (result) {
    return new NextResponse(result, { status: 200 });
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const entry = body.entry?.[0];
    const metadata = entry?.changes?.[0]?.value?.metadata;
    const phoneNumberId = metadata?.phone_number_id;

    if (!phoneNumberId) {
      return NextResponse.json({ success: false, error: "Missing phone number" }, { status: 400 });
    }

    const connection = await prisma.whatsAppConnection.findFirst({
      where: { phoneNumberId },
    });

    if (!connection) {
      return NextResponse.json({ success: false, error: "Unknown phone" }, { status: 404 });
    }

    const change = entry.changes?.[0];
    const statuses = change?.value?.statuses;
    const messages = change?.value?.messages;

    if (statuses) {
      for (const status of statuses) {
        const msgId = status.id;
        const statusName = status.status.toUpperCase();

        await prisma.message.updateMany({
          where: { externalMsgId: msgId },
          data: { status: statusName as any },
        });
      }
    }

    if (messages) {
      const service = new WhatsAppIntegrationService(connection.organizationId);

      for (const msg of messages) {
        const from = msg.from;
        const msgId = msg.id;
        const timestamp = new Date(parseInt(msg.timestamp) * 1000);

        const existingMsg = await prisma.message.findFirst({
          where: { externalMsgId: msgId },
        });
        if (existingMsg) continue;

        const body = msg.text?.body || msg.image?.caption || "";
        const mediaUrl = msg.image?.url || msg.document?.url;
        const mediaType = msg.image ? "image" : msg.document ? "document" : undefined;

        let customer = await prisma.customer.findUnique({
          where: {
            organizationId_normalizedPhone: {
              organizationId: connection.organizationId,
              normalizedPhone: from,
            },
          },
        });

        if (!customer) {
          customer = await prisma.customer.create({
            data: {
              organizationId: connection.organizationId,
              phone: from,
              normalizedPhone: from,
              name: msg.profile?.name,
              source: "whatsapp",
              firstSeenAt: timestamp,
            },
          });
        }

        let conversation = await prisma.conversation.findFirst({
          where: {
            organizationId: connection.organizationId,
            customerId: customer.id,
            status: { not: "CLOSED" },
          },
          orderBy: { createdAt: "desc" },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              organizationId: connection.organizationId,
              customerId: customer.id,
              channel: "whatsapp",
              source: "whatsapp",
            },
          });
        }

        try {
          await prisma.message.create({
            data: {
              externalMsgId: msgId,
              organizationId: connection.organizationId,
              conversationId: conversation.id,
              customerId: customer.id,
              direction: "INBOUND",
              source: "WHATSAPP",
              body,
              mediaUrl,
              mediaType,
              status: "DELIVERED",
            },
          });
        } catch (e) {
          // Duplicate
        }

        await prisma.conversation.update({
          where: { id: conversation.id },
          data: {
            lastMessageAt: timestamp,
            lastMessagePreview: body.substring(0, 100),
            unreadCount: { increment: 1 },
            status: "OPEN",
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("WhatsApp webhook error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
