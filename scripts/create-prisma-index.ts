import * as fs from "fs";
import * as path from "path";

const dir = path.resolve("src/generated/prisma");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

const indexContent = `export { PrismaClient } from "./client";
export * from "./enums";
export * from "./models";
export type {
  User, Organization, OrganizationMember, Invitation,
  SallaConnection, WhatsAppConnection, Customer, CustomerIdentity,
  Conversation, Message, MessageAttachment, InternalNote,
  Tag, CustomerTag, ConversationTag, Order, OrderItem, Product,
  SavedReply, WhatsAppTemplate, Automation, AutomationRun,
  AiSettings, KnowledgeBaseArticle, Plan, Subscription,
  Invoice, Payment, ClientRequest, Notification,
  WebhookEvent, IntegrationError, AuditLog, ApiUsage, MessageQuotaUsage,
} from "./browser";
`;

fs.writeFileSync(path.join(dir, "index.ts"), indexContent);
console.log("✅ Created prisma index.ts");
