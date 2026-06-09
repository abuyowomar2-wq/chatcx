import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { SallaIntegrationService } from "@/integrations/salla";
import { createAuditLog } from "@/server/services/audit-log-service";

export async function POST() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const sallaService = new SallaIntegrationService(orgId);
  await sallaService.disconnect();

  await createAuditLog({
    organizationId: orgId,
    userId: session.user.id,
    action: "DISCONNECT_SALLA",
    entityType: "SALLA_CONNECTION",
  });

  return NextResponse.json({ success: true });
}
