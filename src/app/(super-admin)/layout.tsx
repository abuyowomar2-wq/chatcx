import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";

export default async function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user || !session.user.isSuperAdmin || session.user.email !== process.env.OWNER_EMAIL) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-950" dir="rtl">
      <div className="flex w-64 flex-col fixed inset-y-0 right-0">
        <SuperAdminSidebar />
      </div>
      <div className="flex flex-col flex-1 mr-64">
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
