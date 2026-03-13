"use client";

import { useMemo, useState, useTransition } from "react";
import { routeRecordAction } from "@/app/regulator/actions";
import CategoryBadge from "@/components/CategoryBadge";
import ConfidenceScore from "@/components/ConfidenceScore";
import RecordSheet from "@/components/RecordSheet";
import RelativeTime from "@/components/RelativeTime";
import { Skeleton } from "@/components/ui/skeleton";

export default function RegulatorClient({ initialRecords, departments, reviewerId }) {
  const [records, setRecords] = useState(initialRecords);
  const [activeRecord, setActiveRecord] = useState(null);
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(() => records, [records]);

  async function onRoute(recordId, departmentId) {
    setRecords((prev) => prev.filter((item) => item.id !== recordId));
    setActiveRecord(null);
    startTransition(async () => {
      await routeRecordAction({ recordId, departmentId, reviewerId });
    });
  }

  if (!initialRecords) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Priority</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Escalation</th>
              <th className="px-4 py-3">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr key={record.id} className="cursor-pointer border-t border-slate-100 transition hover:-translate-y-0.5 hover:bg-blue-50/50" onClick={() => setActiveRecord(record)}>
                <td className="px-4 py-3"><CategoryBadge category={record.category} /></td>
                <td className="px-4 py-3">{record.priority}</td>
                <td className="px-4 py-3"><ConfidenceScore score={record.confidence * 100} /></td>
                <td className="px-4 py-3 text-slate-600">{record.request.source}</td>
                <td className="px-4 py-3 text-slate-700">{record.coreIssue}</td>
                <td className="px-4 py-3 text-slate-700">{record.escalationReason ?? "-"}</td>
                <td className="px-4 py-3"><RelativeTime value={record.request.submittedAt} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="p-8 text-center text-slate-500">No records available.</p>}
      </div>
      {isPending && <p className="mt-3 text-sm text-slate-500">Routing record...</p>}
      <RecordSheet record={activeRecord} onClose={() => setActiveRecord(null)} departments={departments} onRoute={onRoute} />
    </>
  );
}
