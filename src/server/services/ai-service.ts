import { prisma } from "@/server/db/prisma";

export async function getAiSettings(organizationId: string) {
  return prisma.aiSettings.findUnique({ where: { organizationId } });
}

export async function upsertAiSettings(organizationId: string, data: {
  isEnabled?: boolean;
  tone?: string;
  storeName?: string;
  storeDescription?: string;
  shippingPolicy?: string;
  returnPolicy?: string;
  exchangePolicy?: string;
  paymentPolicy?: string;
  deliveryTime?: string;
  customInstructions?: string;
  forbiddenPhrases?: string;
  autoReplyEnabled?: boolean;
  maxReplyLength?: number;
}) {
  return prisma.aiSettings.upsert({
    where: { organizationId },
    update: data,
    create: { organizationId, ...data },
  });
}

export async function suggestReply(organizationId: string, conversationId: string, customerMessage: string) {
  const settings = await getAiSettings(organizationId);
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      customer: true,
      messages: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!conversation) throw new Error("Conversation not found");

  const customer = conversation.customer;
  const recentOrders = customer
    ? await prisma.order.findMany({
        where: { customerId: customer.id, organizationId },
        orderBy: { orderedAt: "desc" },
        take: 3,
        include: { items: true },
      })
    : [];

  const kbArticles = await prisma.knowledgeBaseArticle.findMany({
    where: { organizationId, isActive: true },
    take: 5,
  });

  const context = buildContext(settings, customer, recentOrders, kbArticles);

  const prompt = `
أنت مساعد ذكي لخدمة العملاء. مهمتك اقتراح رد مناسب على رسالة عميل.

معلومات المتجر:
${context.storeInfo}

سياسات المتجر:
${context.policies}

آخر طلبات العميل:
${context.orders}

قاعدة المعرفة:
${context.knowledgeBase}

تاريخ المحادثة:
${context.conversationHistory}

رسالة العميل:
${customerMessage}

المطلوب: اقتراح رد مناسب.
- استخدم نبرة ${settings?.tone || "ودية"}
- لا تخترع معلومات غير موجودة
- إذا احتجت توضيح، اسأل الموظف أن يتحقق
${settings?.maxReplyLength ? `- أقصى طول ${settings.maxReplyLength} حرف` : ""}
${settings?.customInstructions ? `\nتعليمات خاصة:\n${settings.customInstructions}` : ""}
${settings?.forbiddenPhrases ? `\nممنوع:\n${settings.forbiddenPhrases}` : ""}

الاقتراح:
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "أنت مساعد متخصص في خدمة العملاء للمتاجر الإلكترونية. ردودك بالعربية دقيقة ومفيدة.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: settings?.maxReplyLength || 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch (error) {
    console.error("AI suggestion error:", error);
    return "عذرًا، تعذر الحصول على اقتراح من الذكاء الاصطناعي حاليًا.";
  }
}

function buildContext(settings: any, customer: any, orders: any[], kbArticles: any[]) {
  return {
    storeInfo: `
الاسم: ${settings?.storeName || ""}
الوصف: ${settings?.storeDescription || ""}
مدة التوصيل: ${settings?.deliveryTime || ""}
`.trim(),
    policies: `
سياسة الشحن: ${settings?.shippingPolicy || "غير محددة"}
سياسة الاسترجاع: ${settings?.returnPolicy || "غير محددة"}
سياسة الاستبدال: ${settings?.exchangePolicy || "غير محددة"}
سياسة الدفع: ${settings?.paymentPolicy || "غير محددة"}
`.trim(),
    orders: orders.length
      ? orders.map((o: any) => `طلب #${o.orderNumber} - حالة: ${o.status} - ${o.total} ${o.currency}`).join("\n")
      : "لا توجد طلبات حديثة",
    knowledgeBase: kbArticles.length
      ? kbArticles.map((a) => `${a.title}: ${a.content.substring(0, 200)}`).join("\n")
      : "لا توجد مقالات",
    conversationHistory: "",
  };
}

export async function summarizeConversation(organizationId: string, conversationId: string) {
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, organizationId },
    include: {
      messages: { orderBy: { createdAt: "asc" }, take: 50 },
      customer: true,
    },
  });

  if (!conversation) return "";

  const messages = conversation.messages
    .map((m: any) => `${m.direction === "INBOUND" ? "عميل" : "موظف"}: ${m.body}`)
    .join("\n");

  const prompt = `لخص المحادثة التالية بالعربية:\n\n${messages}\n\nالملخص:`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "لخص المحادثات بشكل دقيق." },
          { role: "user", content: prompt },
        ],
        max_tokens: 300,
      }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  } catch {
    return "";
  }
}
