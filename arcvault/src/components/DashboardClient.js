"use client";

import { useMemo, useState } from "react";
import RecordCard from "@/components/RecordCard";

export default function DashboardClient({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords);

  const stats = useMemo(() => ({
    total: records.length,
    pending: records.filter((record) => record.status !== "RESOLVED").length,
    resolved: records.filter((record) => record.status === "RESOLVED").length,
  }), [records]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Total assigned</p><p className="text-2xl font-bold text-slate-900">{stats.total}</p></div>
        <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Pending</p><p className="text-2xl font-bold text-slate-900">{stats.pending}</p></div>
        <div className="rounded-xl bg-white p-4 shadow-sm"><p className="text-xs text-slate-500">Resolved</p><p className="text-2xl font-bold text-slate-900">{stats.resolved}</p></div>
      </div>

      <div className="grid gap-4">
        {records.map((record) => (
          <RecordCard key={record.id} record={record} onResolved={(id) => setRecords((prev) => prev.map((item) => (item.id === id ? { ...item, status: "RESOLVED" } : item)))} />
        ))}
      </div>
    </div>
  );
}
