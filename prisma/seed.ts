import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hash } from "bcryptjs";

const url = process.env.DATABASE_URL || "postgresql://localhost:5432/chatcx";
const pool = new pg.Pool({ connectionString: url });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  if (process.env.NODE_ENV === "production") {
    console.log("⛔ Cannot seed in production");
    process.exit(1);
  }

  // Plans
  const freePlan = await prisma.plan.upsert({
    where: { slug: "free-trial" },
    update: {},
    create: {
      name: "تجربة مجانية",
      slug: "free-trial",
      description: "14 يوم تجربة مجانية للتعرف على المنصة",
      priceMonthly: 0,
      priceYearly: 0,
      maxAgents: 1,
      maxConversations: 100,
      maxMessages: 500,
      maxTemplates: 5,
      maxAutomations: 3,
      features: JSON.stringify(["ربط متجر سلة", "ربط واتساب", "محادثات غير محدودة", "موظف واحد"]),
      sortOrder: 1,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "basic" },
    update: {},
    create: {
      name: "أساسي",
      slug: "basic",
      description: "للمتاجر الصغيرة",
      priceMonthly: 99,
      priceYearly: 999,
      maxAgents: 3,
      maxConversations: 500,
      maxMessages: 2000,
      maxTemplates: 10,
      maxAutomations: 10,
      features: JSON.stringify(["3 موظفين", "ردود جاهزة", "تقارير بسيطة", "ربط سلة", "ربط واتساب"]),
      sortOrder: 2,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "pro" },
    update: {},
    create: {
      name: "احترافي",
      slug: "pro",
      description: "للمتاجر المتوسطة",
      priceMonthly: 299,
      priceYearly: 2999,
      maxAgents: 10,
      maxConversations: 2000,
      maxMessages: 10000,
      maxTemplates: 25,
      maxAutomations: 30,
      features: JSON.stringify(["10 موظفين", "ذكاء اصطناعي", "أتمتة", "تقارير متقدمة", "قوالب واتساب"]),
      sortOrder: 3,
    },
  });

  await prisma.plan.upsert({
    where: { slug: "business" },
    update: {},
    create: {
      name: "بزنس",
      slug: "business",
      description: "للمتاجر الكبيرة",
      priceMonthly: 599,
      priceYearly: 5999,
      maxAgents: 50,
      maxConversations: 10000,
      maxMessages: 50000,
      maxTemplates: 100,
      maxAutomations: 100,
      features: JSON.stringify(["50 موظفين", "دعم أولوية", "API", "تقارير مخصصة", "مساحة تخزين أكبر"]),
      sortOrder: 4,
    },
  });

  // Super Admin
  const ownerEmail = process.env.OWNER_EMAIL || "abuyowomar2@gmail.com";
  const ownerPassword = await hash("admin123", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: ownerEmail },
    update: {},
    create: {
      email: ownerEmail,
      passwordHash: ownerPassword,
      name: "السوبر أدمن",
      isSuperAdmin: true,
    },
  });
  console.log("✅ Super admin created:", superAdmin.email);

  // Demo organization
  const demoSellerEmail = "demo@chatcx.com";
  const demoPassword = await hash("demo1234", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoSellerEmail },
    update: {},
    create: {
      email: demoSellerEmail,
      passwordHash: demoPassword,
      name: "أحمد محمد",
    },
  });

  const demoOrg = await prisma.organization.upsert({
    where: { slug: "متجري-التجريبي" },
    update: {},
    create: {
      name: "متجري التجريبي",
      slug: "متجري-التجريبي",
    },
  });

  await prisma.organizationMember.upsert({
    where: { organizationId_userId: { organizationId: demoOrg.id, userId: demoUser.id } },
    update: {},
    create: {
      organizationId: demoOrg.id,
      userId: demoUser.id,
      role: "OWNER",
    },
  });

  // Trial subscription
  const trialEnd = new Date();
  trialEnd.setDate(trialEnd.getDate() + 14);

  await prisma.subscription.upsert({
    where: { id: `demo-sub-${demoOrg.id}` },
    update: {},
    create: {
      id: `demo-sub-${demoOrg.id}`,
      organizationId: demoOrg.id,
      planId: freePlan.id,
      status: "TRIALING",
      trialEndsAt: trialEnd,
      currentPeriodStart: new Date(),
      currentPeriodEnd: trialEnd,
    },
  });

  // Demo customers
  const customers = [];
  const customerData = [
    { name: "سارة أحمد", phone: "966555111222", email: "sara@example.com", city: "الرياض" },
    { name: "محمد العلي", phone: "966555333444", email: "mohammed@example.com", city: "جدة" },
    { name: "نورة خالد", phone: "966555555666", email: "noura@example.com", city: "الدمام" },
    { name: "فهد العنزي", phone: "966555777888", email: "fahad@example.com", city: "مكة" },
    { name: "لمى عبدالله", phone: "966555999000", email: "lama@example.com", city: "المدينة" },
  ];

  for (const c of customerData) {
    const customer = await prisma.customer.create({
      data: {
        organizationId: demoOrg.id,
        name: c.name,
        phone: c.phone,
        normalizedPhone: c.phone,
        email: c.email,
        city: c.city,
        source: "salla",
        firstSeenAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        totalOrders: Math.floor(Math.random() * 5) + 1,
        totalSpent: Math.floor(Math.random() * 5000) + 100,
      },
    });
    customers.push(customer);
  }

  // Demo tags
  const tags = [];
  const tagData = [
    { name: "عميل مميز", color: "#22c55e" },
    { name: "شكوى", color: "#ef4444" },
    { name: "استفسار", color: "#3b82f6" },
    { name: "طلب شراء", color: "#f59e0b" },
    { name: "متابعة", color: "#8b5cf6" },
  ];

  for (const t of tagData) {
    const tag = await prisma.tag.create({
      data: { organizationId: demoOrg.id, name: t.name, color: t.color },
    });
    tags.push(tag);
  }

  // Demo orders
  const statuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
  for (let i = 0; i < 5; i++) {
    const order = await prisma.order.create({
      data: {
        organizationId: demoOrg.id,
        customerId: customers[i].id,
        orderNumber: `ORD-${1000 + i}`,
        status: statuses[Math.floor(Math.random() * statuses.length)],
        total: Math.floor(Math.random() * 2000) + 50,
        subtotal: Math.floor(Math.random() * 1800) + 50,
        shippingAmount: Math.floor(Math.random() * 50) + 10,
        currency: "SAR",
        paymentMethod: ["مدى", "فيزا", "ماستركارد", "STC Pay"][Math.floor(Math.random() * 4)],
        orderedAt: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        name: `منتج ${i + 1}`,
        quantity: Math.floor(Math.random() * 3) + 1,
        unitPrice: order.total / 2,
        totalPrice: order.total,
      },
    });
  }

  // Demo conversations
  const conversationMessages = [
    { inbound: "السلام عليكم، عندي استفسار عن طلبي", outbound: "وعليكم السلام ورحمة الله، كيف أقدر أساعدك؟" },
    { inbound: "وين طلبي رقم ORD-1001؟", outbound: "أهلاً بك، خليني أتفقد طلبك حاليًا" },
    { inbound: "بغيت أغير عنوان الشحن", outbound: "تمام، ممكن ترسل لي العنوان الجديد؟" },
    { inbound: "شكراً، وصل الطلب", outbound: "العفو، نشكرك على ثقتك. في خدمتك دائمًا 🤍" },
    { inbound: "هل يتوفر عندكم منتج X?", outbound: "حاليًا المنتج متوفر. هل تحب أتأكد من الكمية؟" },
    { inbound: "كم وقت التوصيل للرياض؟", outbound: "التوصيل للرياض يستغرق 2-3 أيام عمل" },
    { inbound: "بغيت أستفسر عن سياسة الاسترجاع", outbound: "سياسة الاسترجاع عندنا تسمح بالاسترجاع خلال 7 أيام" },
    { inbound: "فيه مشكلة في الدفع ما يشتغل", outbound: "أنا آسف على الإزعاج. ممكن تجرب طريقة دفع ثانية؟" },
    { inbound: "أبي أضيف منتج للطلب", outbound: "للأسف ما نقدر نضيف منتج لطلب قائم. تقدر تلغي الطلب وتطلبه من جديد" },
    { inbound: "شكراً على الخدمة الممتازة", outbound: "شكراً لك! سعادتك هي هدفنا 🙏" },
  ];

  for (let i = 0; i < 10; i++) {
    const customerIdx = i % customers.length;
    const status = i < 6 ? "OPEN" : "CLOSED";
    const msgs = conversationMessages[i];

    const conv = await prisma.conversation.create({
      data: {
        organizationId: demoOrg.id,
        customerId: customers[customerIdx].id,
        channel: "whatsapp",
        source: "whatsapp",
        status: status as any,
        priority: i < 3 ? "high" : "normal",
        lastMessageAt: new Date(Date.now() - i * 60 * 60 * 1000),
        lastMessagePreview: msgs.inbound.substring(0, 50),
        unreadCount: i < 3 ? 1 : 0,
        assignedAgentId: i < 5 ? demoUser.id : null,
      },
    });

    await prisma.message.create({
      data: {
        organizationId: demoOrg.id,
        conversationId: conv.id,
        customerId: customers[customerIdx].id,
        direction: "INBOUND",
        source: "WHATSAPP",
        body: msgs.inbound,
        status: "READ",
        createdAt: new Date(Date.now() - (i * 60 + 5) * 60 * 1000),
      },
    });

    await prisma.message.create({
      data: {
        organizationId: demoOrg.id,
        conversationId: conv.id,
        senderId: demoUser.id,
        direction: "OUTBOUND",
        source: "SYSTEM",
        body: msgs.outbound,
        status: "READ",
        createdAt: new Date(Date.now() - i * 60 * 60 * 1000),
      },
    });
  }

  // Demo saved replies
  const savedReplies = [
    { title: "ترحيب", body: "أهلاً بك في {{store_name}}! كيف أقدر أساعدك اليوم؟", category: "ترحيب" },
    { title: "طلب الشحن", body: "طلبك رقم {{order_id}} تم شحنه. يمكنك تتبع الطلب عبر: {{tracking_url}}", category: "طلبات" },
    { title: "مدة التوصيل", body: "مدة التوصيل المتوقعة {{delivery_time}} أيام عمل.", category: "عام" },
    { title: "شكر", body: "شكراً لتواصلك مع {{store_name}}. في خدمتك دائمًا!", category: "عام" },
    { title: "استفسار عن طلب", body: "أهلاً {{customer_name}}، طلبك رقم {{order_id}} حالته: {{order_status}}", category: "طلبات" },
  ];

  for (const reply of savedReplies) {
    await prisma.savedReply.create({
      data: {
        organizationId: demoOrg.id,
        title: reply.title,
        body: reply.body,
        category: reply.category,
      },
    });
  }

  // Demo AI settings
  await prisma.aiSettings.upsert({
    where: { organizationId: demoOrg.id },
    update: {},
    create: {
      organizationId: demoOrg.id,
      isEnabled: true,
      tone: "friendly",
      storeName: "متجري التجريبي",
      storeDescription: "متجر إلكتروني متخصص في المنتجات المتنوعة",
      shippingPolicy: "الشحن لجميع مدن المملكة خلال 2-5 أيام عمل",
      returnPolicy: "يمكن استرجاع المنتجات خلال 7 أيام من الاستلام",
      deliveryTime: "2-5 أيام عمل",
    },
  });

  console.log("✅ Seed data created successfully!");
  console.log("📧 Demo login:", demoSellerEmail, "/ demo1234");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
