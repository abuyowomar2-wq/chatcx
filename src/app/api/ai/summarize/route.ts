import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { summarizeConversation } from "@/server/services/ai-service";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const body = await req.json();
  const { conversationId } = body;

  if (!conversationId) {
    return NextResponse.json({ success: false, error: "Missing conversationId" }, { status: 400 });
  }

  const summary = await summarizeConversation(orgId, conversationId);
  return NextResponse.json({ success: true, data: { summary } });
}
