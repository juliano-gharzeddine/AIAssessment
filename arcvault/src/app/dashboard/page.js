import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import DashboardClient from "@/components/DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "DEPARTMENT") redirect("/login");

  const records = await db.processedRecord.findMany({
    where: {
      departmentId: session.user.departmentId,
      status: { in: ["AUTO_ROUTED", "MANUALLY_ROUTED", "RESOLVED"] },
    },
    include: { request: true },
    orderBy: { processedAt: "desc" },
  });

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        title="ArcVault"
        subtitle={session.user.departmentSlug ?? "Department"}
        items={[
          {
            href: "/dashboard",
            label: "My Queue",
            count: records.filter((r) => r.status !== "RESOLVED").length,
            isActive: ({ pathname }) => pathname === "/dashboard",
          },
        ]}
        footer={<p className="px-2 text-xs text-slate-500">{session.user.name}</p>}
      />
      <main className="flex-1 px-8 py-8">
        <PageHeader title="Department Queue" subtitle="Prioritized support records assigned to your team." />
        <DashboardClient initialRecords={records} />
      </main>
    </div>
  );
}
