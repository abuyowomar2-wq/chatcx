import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const clientId = process.env.SALLA_CLIENT_ID;
  const redirectUri = process.env.SALLA_REDIRECT_URI;

  if (!clientId) {
    return NextResponse.json({ success: false, error: "Salla client ID not configured" }, { status: 500 });
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri || "",
    response_type: "code",
    scope: "public,offline_access,orders.read,products.read,customers.read,store.read",
    state: session.user.organizations?.[0]?.id || "",
  });

  const authUrl = `https://accounts.salla.sa/oauth2/auth?${params}`;

  return NextResponse.json({ success: true, data: { url: authUrl } });
}
