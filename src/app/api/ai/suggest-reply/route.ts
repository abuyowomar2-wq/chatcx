import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { suggestReply } from "@/server/services/ai-service";

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
  const { conversationId, customerMessage } = body;

  if (!conversationId || !customerMessage) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }

  try {
    const suggestion = await suggestReply(orgId, conversationId, customerMessage);
    return NextResponse.json({ success: true, data: { suggestion } });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
