import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getCustomer, updateCustomer } from "@/server/services/customer-service";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const customer = await getCustomer(params.id, orgId);
  if (!customer) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: customer });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const orgId = session.user.organizations?.[0]?.id;
  if (!orgId) {
    return NextResponse.json({ success: false, error: "No organization" }, { status: 400 });
  }

  const body = await req.json();
  const customer = await updateCustomer(params.id, orgId, body);

  if (!customer) {
    return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: customer });
}
