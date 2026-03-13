"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { routeRecordAction } from "@/app/regulator/actions";
import CategoryBadge from "@/components/CategoryBadge";
import ConfidenceScore from "@/components/ConfidenceScore";
import RecordSheet from "@/components/RecordSheet";
import RelativeTime from "@/components/RelativeTime";
import { Skeleton } from "@/components/ui/skeleton";

function FilterDropdown({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-blue-200 hover:bg-blue-50"
      >
        <span>{value || label}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <button
            type="button"
            className="block w-full px-3 py-2 text-left text-xs text-slate-600 hover:bg-slate-50"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            All {label}
          </button>
          {options.map((option) => (
            <button
              key={option}
              type="button"
              className="block w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function RegulatorClient({ initialRecords, departments, reviewerId }) {
  const [records, setRecords] = useState(initialRecords);
  const [activeRecord, setActiveRecord] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [sortBy, setSortBy] = useState("submittedAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [isPending, startTransition] = useTransition();

  const rows = useMemo(() => {
    const filtered = records.filter((record) => {
      if (categoryFilter && record.category !== categoryFilter) return false;
      if (priorityFilter && record.priority !== priorityFilter) return false;
      if (statusFilter && record.status !== statusFilter) return false;
      if (sourceFilter && record.request.source !== sourceFilter) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      let result = 0;
      if (sortBy === "confidence") {
        result = a.confidence - b.confidence;
      } else if (sortBy === "submittedAt") {
        result = new Date(a.request.submittedAt).getTime() - new Date(b.request.submittedAt).getTime();
      } else if (sortBy === "priority") {
        const ranking = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        result = (ranking[a.priority] ?? 0) - (ranking[b.priority] ?? 0);
      }

      return sortDirection === "asc" ? result : -result;
    });
  }, [records, categoryFilter, priorityFilter, statusFilter, sourceFilter, sortBy, sortDirection]);

  async function onRoute(recordId, departmentId) {
    setRecords((prev) => prev.filter((item) => item.id !== recordId));
    setActiveRecord(null);
    startTransition(async () => {
      await routeRecordAction({ recordId, departmentId, reviewerId });
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

  if (!initialRecords) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <FilterDropdown label="Category" value={categoryFilter} options={["BUG_REPORT", "FEATURE_REQUEST", "BILLING_ISSUE", "TECHNICAL_QUESTION", "INCIDENT_OUTAGE"]} onChange={setCategoryFilter} />
        <FilterDropdown label="Priority" value={priorityFilter} options={["HIGH", "MEDIUM", "LOW"]} onChange={setPriorityFilter} />
        <FilterDropdown label="Status" value={statusFilter} options={["PENDING", "AUTO_ROUTED", "PENDING_REVIEW", "MANUALLY_ROUTED", "RESOLVED"]} onChange={setStatusFilter} />
        <FilterDropdown label="Source" value={sourceFilter} options={["EMAIL", "WEB_FORM", "SUPPORT_PORTAL"]} onChange={setSourceFilter} />
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("priority")} className="flex items-center gap-1 hover:text-blue-600">Priority <ArrowUpDown className="h-3.5 w-3.5" /></button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("confidence")} className="flex items-center gap-1 hover:text-blue-600">Confidence <ArrowUpDown className="h-3.5 w-3.5" /></button>
              </th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3">Issue</th>
              <th className="px-4 py-3">Escalation</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("submittedAt")} className="flex items-center gap-1 hover:text-blue-600">Submitted <ArrowUpDown className="h-3.5 w-3.5" /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr
                key={record.id}
                className="cursor-pointer border-t border-slate-100 transition hover:-translate-y-0.5 hover:bg-blue-50/40"
                onClick={() => setActiveRecord(record)}
              >
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
        {!rows.length && <p className="p-8 text-center text-slate-500">No records available for selected filters.</p>}
      </div>
      {isPending && <p className="mt-3 text-sm text-slate-500">Routing record...</p>}
      <RecordSheet record={activeRecord} onClose={() => setActiveRecord(null)} departments={departments} onRoute={onRoute} />
    </>
  );
}
