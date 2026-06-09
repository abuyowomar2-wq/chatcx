import { NextResponse } from "next/server";
import { handleSallaOAuthCallback } from "@/integrations/salla";
import { createAuditLog } from "@/server/services/audit-log-service";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/integrations?error=salla_denied", process.env.APP_URL || "http://localhost:3000"));
  }

  if (!code || !state) {
    return NextResponse.json({ success: false, error: "Missing parameters" }, { status: 400 });
  }

  try {
    const result = await handleSallaOAuthCallback(code, state);

    await createAuditLog({
      organizationId: state,
      action: "CONNECT_SALLA",
      entityType: "SALLA_CONNECTION",
    });

    return NextResponse.redirect(new URL("/integrations?success=salla_connected", process.env.APP_URL || "http://localhost:3000"));
  } catch (err: any) {
    console.error("Salla callback error:", err);
    return NextResponse.redirect(new URL(`/integrations?error=${encodeURIComponent(err.message)}`, process.env.APP_URL || "http://localhost:3000"));
  }
}
