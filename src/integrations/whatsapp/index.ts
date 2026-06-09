import { prisma } from "@/server/db/prisma";
import { encrypt, decrypt } from "@/utils/crypto";

const WHATSAPP_API_BASE = "https://graph.facebook.com/v21.0";

export class WhatsAppIntegrationService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  async getConnection() {
    const conn = await prisma.whatsAppConnection.findUnique({
      where: { organizationId: this.organizationId },
    });
    if (!conn) return null;

    return {
      ...conn,
      accessToken: conn.accessToken ? decrypt(conn.accessToken) : null,
    };
  }

  async sendMessage(to: string, body: string, options?: {
    templateName?: string;
    templateLanguage?: string;
    templateVariables?: Record<string, string>;
    mediaUrl?: string;
    mediaType?: string;
  }) {
    const conn = await this.getConnection();
    if (!conn || !conn.phoneNumberId || !conn.accessToken) {
      throw new Error("WhatsApp not connected");
    }

    let payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
    };

    if (options?.templateName) {
      payload.type = "template";
      payload.template = {
        name: options.templateName,
        language: { code: options.templateLanguage || "ar" },
        ...(options.templateVariables && {
          components: [{
            type: "body",
            parameters: Object.entries(options.templateVariables).map(([_, value]) => ({
              type: "text",
              text: value,
            })),
          }],
        }),
      };
    } else if (options?.mediaUrl && options?.mediaType) {
      payload.type = options.mediaType;
      payload[options.mediaType] = { link: options.mediaUrl };
    } else {
      payload.type = "text";
      payload.text = { body };
    }

    const response = await fetch(
      `${WHATSAPP_API_BASE}/${conn.phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      await this.logError(data.error?.message || "WhatsApp send failed");
      throw new Error(data.error?.message || "Failed to send WhatsApp message");
    }

    return data.messages?.[0]?.id;
  }

  async verifyWebhook(mode: string, token: string, challenge: string): Promise<string | null> {
    const conn = await this.getConnection();
    if (mode === "subscribe" && token === (conn?.verifyToken || process.env.WHATSAPP_VERIFY_TOKEN)) {
      await prisma.whatsAppConnection.update({
        where: { organizationId: this.organizationId },
        data: { webhookVerified: true },
      });
      return challenge;
    }
    return null;
  }

  async processIncomingMessage(payload: any) {
    const entry = payload.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    if (!value) return;

    if (value.messages) {
      for (const msg of value.messages) {
        await this.handleMessage(msg, value.metadata);
      }
    }

    if (value.statuses) {
      for (const status of value.statuses) {
        await this.handleStatusUpdate(status);
      }
    }
  }

  private async handleMessage(msg: any, metadata: any) {
    const from = msg.from;
    const msgId = msg.id;
    const msgType = msg.type;
    const timestamp = new Date(parseInt(msg.timestamp) * 1000);

    const body = msg.text?.body ||
      msg.image?.caption ||
      msg.document?.caption ||
      "";

    const mediaUrl = msg.image?.url || msg.document?.url || msg.audio?.url;
    const mediaType = msg.image ? "image" : msg.document ? "document" : msg.audio ? "audio" : undefined;

    let customer = await prisma.customer.findUnique({
      where: {
        organizationId_normalizedPhone: {
          organizationId: this.organizationId,
          normalizedPhone: from,
        },
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          organizationId: this.organizationId,
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
        organizationId: this.organizationId,
        customerId: customer.id,
        status: { not: "CLOSED" },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          organizationId: this.organizationId,
          customerId: customer.id,
          channel: "whatsapp",
          source: "whatsapp",
        },
      });
    }

    const existingMsg = await prisma.message.findUnique({
      where: { id: msgId } as any,
    });
    if (existingMsg) return;

    try {
      await prisma.message.create({
        data: {
          id: msgId,
          organizationId: this.organizationId,
          conversationId: conversation.id,
          customerId: customer.id,
          direction: "INBOUND",
          source: "WHATSAPP",
          body,
          mediaUrl,
          mediaType,
          status: "DELIVERED",
          externalMsgId: msgId,
        },
      });
    } catch {
      // Idempotency
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

  private async handleStatusUpdate(status: any) {
    const msgId = status.id;
    const statusName = status.status.toUpperCase();

    await prisma.message.updateMany({
      where: { externalMsgId: msgId },
      data: { status: statusName as any },
    });
  }

  private async logError(message: string) {
    await prisma.integrationError.create({
      data: {
        organizationId: this.organizationId,
        integration: "WHATSAPP",
        message,
      },
    });
  }

  async disconnect() {
    await prisma.whatsAppConnection.update({
      where: { organizationId: this.organizationId },
      data: {
        isConnected: false,
        webhookVerified: false,
        accessToken: "",
      },
    });
  }
}
