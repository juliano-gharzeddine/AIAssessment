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
    const filters = {
      ...(params?.category ? { category: params.category } : {}),
      ...(params?.priority ? { priority: params.priority } : {}),
      ...(params?.status ? { status: params.status } : {}),
    };
  
    const where = view === "pending" ? { status: "PENDING_REVIEW" } : filters;

  const [pendingCount, records, departments] = await Promise.all([
    db.processedRecord.count({ where: { status: "PENDING_REVIEW" } }),
    db.processedRecord.findMany({
      where,
      include: { request: true, department: true },
      orderBy: { processedAt: "desc" },
    }),
    db.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar
        title="ArcVault"
        subtitle="Regulator"
        items={[{ href: "/regulator", label: "Pending Review", count: pendingCount }, { href: "/regulator?view=all", label: "All Records" }]}
        footer={<p className="px-2 text-xs text-slate-300">{session.user.email}</p>}
      />
      <main className="flex-1 px-8 py-8">
        <PageHeader title={view === "all" ? "All Records" : "Pending Review"} subtitle="Review AI-enriched records and route them manually." />
        {view === "all" && (
          <form className="mb-4 flex flex-wrap gap-2 rounded-xl bg-white p-3 shadow-sm">
            <input type="hidden" name="view" value="all" />
            <select name="category" className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><option value="">Category</option><option value="BUG_REPORT">Bug Report</option><option value="FEATURE_REQUEST">Feature Request</option><option value="BILLING_ISSUE">Billing Issue</option><option value="TECHNICAL_QUESTION">Technical Question</option><option value="INCIDENT_OUTAGE">Incident Outage</option></select>
            <select name="priority" className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><option value="">Priority</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="LOW">Low</option></select>
            <select name="status" className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><option value="">Status</option><option value="PENDING">Pending</option><option value="AUTO_ROUTED">Auto Routed</option><option value="PENDING_REVIEW">Pending Review</option><option value="MANUALLY_ROUTED">Manually Routed</option><option value="RESOLVED">Resolved</option></select>
            <button className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white">Apply</button>
          </form>
        )}
        <RegulatorClient initialRecords={records} departments={departments} reviewerId={session.user.id} />
      </main>
    </div>
  );
}
