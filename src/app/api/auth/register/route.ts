import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/server/db/prisma";
import { z } from "zod";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  storeName: z.string().min(2),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const errorMessage = (parsed.error as any)?.issues?.[0]?.message || (parsed.error as any)?.message || "بيانات غير صالحة";
      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }

    const { email, password, name, storeName } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "البريد الإلكتروني مستخدم بالفعل" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(password, 12);

    const slug = storeName
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 50) + "-" + Date.now().toString(36);

    const user = await prisma.$transaction(async (tx: any) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          name,
        },
      });

      const org = await tx.organization.create({
        data: {
          name: storeName,
          slug,
        },
      });

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: newUser.id,
          role: "OWNER",
        },
      });

      const trialPlan = await tx.plan.findFirst({
        where: { slug: "free-trial" },
      });

      if (trialPlan) {
        const trialEndsAt = new Date();
        trialEndsAt.setDate(trialEndsAt.getDate() + 14);

        await tx.subscription.create({
          data: {
            organizationId: org.id,
            planId: trialPlan.id,
            status: "TRIALING",
            trialEndsAt,
            currentPeriodStart: new Date(),
            currentPeriodEnd: trialEndsAt,
          },
        });
      }

      return newUser;
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: user.id, email: user.email, name: user.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "حدث خطأ أثناء التسجيل" },
      { status: 500 }
    );
  }
}
