"use client";

import { useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { routeRecordAction } from "@/app/regulator/actions";
import CategoryBadge from "@/components/CategoryBadge";
import ConfidenceScore from "@/components/ConfidenceScore";
import RecordSheet from "@/components/RecordSheet";
import RelativeTime from "@/components/RelativeTime";
import PriorityBadge from "@/components/PriorityBadge";
import { CATEGORY_LABELS, PRIORITY_LABELS, SOURCE_LABELS, STATUS_LABELS } from "@/lib/labels";

const FILTERS = {
  category: CATEGORY_LABELS,
  priority: PRIORITY_LABELS,
  status: STATUS_LABELS,
  source: SOURCE_LABELS,
};

function FilterSelect({ name, label, options, value, onChange }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(name, e.target.value)}
      className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
    >
      <option value="">{label}</option>
      {Object.entries(options).map(([optionValue, optionLabel]) => (
        <option key={optionValue} value={optionValue}>{optionLabel}</option>
      ))}
      {value ? <option value="">Clear</option> : null}
    </select>
  );
}

export default function RegulatorClient({ initialRecords, departments }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [records, setRecords] = useState(initialRecords);
  const [activeRecord, setActiveRecord] = useState(null);
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isPending, startTransition] = useTransition();

  const filters = {
    category: searchParams.get("category") ?? "",
    priority: searchParams.get("priority") ?? "",
    status: searchParams.get("status") ?? "",
    source: searchParams.get("source") ?? "",
  };

  const rows = useMemo(() => {
    const filtered = records.filter((record) => {
      if (filters.category && record.category !== filters.category) return false;
      if (filters.priority && record.priority !== filters.priority) return false;
      if (filters.status && record.status !== filters.status) return false;
      if (filters.source && record.request.source !== filters.source) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      let result = 0;
      if (sortBy === "confidence") result = a.confidence - b.confidence;
      if (sortBy === "submittedAt") result = new Date(a.request.submittedAt).getTime() - new Date(b.request.submittedAt).getTime();
      if (sortBy === "priority") {
        const ranking = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        result = (ranking[a.priority] ?? 0) - (ranking[b.priority] ?? 0);
      }
      return sortDirection === "asc" ? result : -result;
    });
  }, [records, filters, sortBy, sortDirection]);

  function setFilter(name, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(name);
    else params.set(name, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onRoute(recordId, departmentId, reviewNotes) {
    const department = departments.find((item) => item.id === departmentId);
    setRecords((prev) => prev.filter((item) => item.id !== recordId));
    setActiveRecord(null);
    startTransition(async () => {
      await routeRecordAction({ recordId, departmentId, reviewNotes });
      if (department) {
        setToast(`Routed to ${department.name} successfully`);
        setTimeout(() => setToast(""), 2500);
      }
    });
  }

  function toggleSort(column) {
    if (sortBy === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDirection("desc");
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <FilterSelect name="category" label={filters.category ? CATEGORY_LABELS[filters.category] : "Category"} options={FILTERS.category} value={filters.category} onChange={setFilter} />
        <FilterSelect name="priority" label={filters.priority ? PRIORITY_LABELS[filters.priority] : "Priority"} options={FILTERS.priority} value={filters.priority} onChange={setFilter} />
        <FilterSelect name="status" label={filters.status ? STATUS_LABELS[filters.status] : "Status"} options={FILTERS.status} value={filters.status} onChange={setFilter} />
        <FilterSelect name="source" label={filters.source ? SOURCE_LABELS[filters.source] : "Source"} options={FILTERS.source} value={filters.source} onChange={setFilter} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th><th className="px-4 py-3"><button onClick={() => toggleSort("priority")} className="flex items-center gap-1 hover:text-blue-600">Priority <ArrowUpDown className="h-3.5 w-3.5" /></button></th><th className="px-4 py-3"><button onClick={() => toggleSort("confidence")} className="flex items-center gap-1 hover:text-blue-600">Confidence <ArrowUpDown className="h-3.5 w-3.5" /></button></th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Issue</th><th className="px-4 py-3">Escalation</th><th className="px-4 py-3"><button onClick={() => toggleSort("submittedAt")} className="flex items-center gap-1 hover:text-blue-600">Submitted <ArrowUpDown className="h-3.5 w-3.5" /></button></th><th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {rows.map((record) => (
                <motion.tr key={record.id} initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }} className="border-t border-slate-100 hover:bg-blue-50/40">
                  <td className="px-4 py-3"><CategoryBadge category={record.category} /></td>
                  <td className="px-4 py-3"><PriorityBadge priority={record.priority} /></td>
                  <td className="px-4 py-3"><ConfidenceScore score={record.confidence * 100} /></td>
                  <td className="px-4 py-3 text-slate-600">{SOURCE_LABELS[record.request.source] ?? record.request.source}</td>
                  <td className="px-4 py-3 text-slate-700">{record.coreIssue}</td>
                  <td className="px-4 py-3 text-slate-700">{record.escalationReason ?? "-"}</td>
                  <td className="px-4 py-3"><RelativeTime value={record.request.submittedAt} /></td>
                  <td className="px-4 py-3"><button onClick={() => setActiveRecord(record)} className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium hover:bg-slate-50">Route</button></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {!rows.length && <p className="p-8 text-center text-slate-500">No records available for selected filters.</p>}
      </div>
      {isPending && <p className="mt-3 text-sm text-slate-500">Routing record...</p>}
      {toast && <div className="fixed bottom-5 right-5 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-xl">{toast}</div>}
      <RecordSheet record={activeRecord} onClose={() => setActiveRecord(null)} departments={departments} onRoute={onRoute} />
    </>
  );
}
