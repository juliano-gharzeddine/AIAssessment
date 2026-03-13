"use client";

import { useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import RecordCard from "@/components/RecordCard";

export default function DashboardClient({ initialRecords }) {
  const [records, setRecords] = useState(initialRecords);

  const sortedRecords = useMemo(() => {
    const ranking = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return [...records].sort((a, b) => (ranking[b.priority] ?? 0) - (ranking[a.priority] ?? 0));
  }, [records]);

  const stats = useMemo(
    () => ({
      total: records.length,
      pending: records.filter((record) => record.status !== "RESOLVED").length,
      resolved: records.filter((record) => record.status === "RESOLVED").length,
    }),
    [records],
  );

  const statCards = [
    { label: "Total Assigned", value: stats.total, tone: "from-indigo-500 to-blue-500" },
    { label: "Pending", value: stats.pending, tone: "from-amber-500 to-orange-500" },
    { label: "Resolved", value: stats.resolved, tone: "from-emerald-500 to-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-slate-500">{card.label}</p>
              <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${card.tone}`} />
            </div>
            <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        <AnimatePresence initial={false}>
          {sortedRecords.map((record) => (
            <RecordCard key={record.id} record={record} onResolved={(id) => setRecords((prev) => prev.filter((item) => item.id !== id))} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
