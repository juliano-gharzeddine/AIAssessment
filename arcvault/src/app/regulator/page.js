import { auth } from "@/lib/auth";
import db from "@/lib/db";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import PageHeader from "@/components/PageHeader";
import RegulatorClient from "@/components/RegulatorClient";

export default async function RegulatorPage({ searchParams }) {
  const session = await auth();
  if (!session || session.user.role !== "REGULATOR") redirect("/login");

  const params = await searchParams;
  const view = params?.view === "all" ? "all" : "pending";
  const pendingWhere = {
    status: "PENDING_REVIEW",
    OR: [{ confidence: { lt: 0.7 } }, { escalationFlag: true }],
  };

  const where = view === "pending" ? pendingWhere : {};

  const [pendingCount, records, departments] = await Promise.all([
    db.processedRecord.count({ where: pendingWhere }),
    db.processedRecord.findMany({
      where,
      include: { request: true, department: true },
      orderBy: { processedAt: "desc" },
    }),
    db.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar
        title="ArcVault"
        subtitle="Regulator"
        items={[
          {
            href: "/regulator",
            label: "Pending Review",
            count: pendingCount,
            isActive: ({ pathname, search }) => pathname === "/regulator" && search.get("view") !== "all",
          },
          {
            href: "/regulator?view=all",
            label: "All Records",
            isActive: ({ pathname, search }) => pathname === "/regulator" && search.get("view") === "all",
          },
        ]}
        footer={<p className="px-2 text-xs text-slate-500">{session.user.email}</p>}
      />
      <main className="flex-1 px-8 py-8">
        <PageHeader title={view === "all" ? "All Records" : "Pending Review"} subtitle="Review AI-enriched records and route uncertain or flagged records." />
        <RegulatorClient initialRecords={records} departments={departments} />
      </main>
    </div>
  );
}
