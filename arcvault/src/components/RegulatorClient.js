"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, Check, ChevronDown } from "lucide-react";
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

const STATUS_TONES = {
  PENDING: "bg-amber-50 text-amber-700 border-amber-200",
  AUTO_ROUTED: "bg-sky-50 text-sky-700 border-sky-200",
  PENDING_REVIEW: "bg-indigo-50 text-indigo-700 border-indigo-200",
  MANUALLY_ROUTED: "bg-violet-50 text-violet-700 border-violet-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function FilterDropdown({ name, placeholder, options, value, onChange, toneMap }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const selectedLabel = value ? options[value] : placeholder;
  const selectedTone = toneMap?.[value] ?? "border-slate-200 bg-white text-slate-700";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex min-w-36 items-center justify-between gap-2 rounded-xl border px-3 py-1.5 text-xs font-medium ${value ? selectedTone : "border-slate-200 bg-white text-slate-700"}`}
      >
        <span>{selectedLabel}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange(name, "");
              setOpen(false);
            }}
            className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50"
          >
            <span>{placeholder}</span>
            {!value && <Check className="h-3.5 w-3.5" />}
          </button>
          {Object.entries(options).map(([optionValue, optionLabel]) => (
            <button
              type="button"
              key={optionValue}
              onClick={() => {
                onChange(name, optionValue);
                setOpen(false);
              }}
              className={`mt-1 flex w-full items-center justify-between rounded-lg border px-2 py-1.5 text-left text-xs ${toneMap?.[optionValue] ?? "border-transparent text-slate-700 hover:bg-slate-50"}`}
            >
              <span>{optionLabel}</span>
              {value === optionValue && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortIndicator({ active, direction }) {
  if (!active) {
    return <ArrowDown className="h-3.5 w-3.5 opacity-40" />;
  }

  return direction === "asc" ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
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
  const rowRef = useRef(null);

  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);

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

  useEffect(() => {
    if (!rowRef.current) return;
    const nodes = rowRef.current.querySelectorAll("tbody tr");
    nodes.forEach((node, index) => {
      node.animate(
        [
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ],
        { duration: 320, delay: index * 35, easing: "ease-out", fill: "both" },
      );
    });
  }, [rows.length]);

  function setFilter(name, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value) params.delete(name);
    else params.set(name, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function onRoute(recordId, departmentId, reviewNotes) {
    const department = departments.find((item) => item.id === departmentId);
    setRecords((prev) =>
      prev.map((item) =>
        item.id === recordId
          ? {
              ...item,
              status: "MANUALLY_ROUTED",
              departmentId,
              reviewedAt: new Date().toISOString(),
              reviewNotes: reviewNotes?.trim() || null,
            }
          : item,
      ),
    );
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
        <FilterDropdown name="category" placeholder="Category" options={FILTERS.category} value={filters.category} onChange={setFilter} />
        <FilterDropdown name="priority" placeholder="Priority" options={FILTERS.priority} value={filters.priority} onChange={setFilter} />
        <FilterDropdown name="status" placeholder="Status" options={FILTERS.status} value={filters.status} onChange={setFilter} toneMap={STATUS_TONES} />
        <FilterDropdown name="source" placeholder="Source" options={FILTERS.source} value={filters.source} onChange={setFilter} />
      </div>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm" ref={rowRef}>
        <table className="min-w-[1100px] w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">CATEGORY</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("priority")} className="flex items-center gap-1 hover:text-blue-600">
                  PRIORITY <SortIndicator active={sortBy === "priority"} direction={sortDirection} />
                </button>
              </th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("confidence")} className="flex items-center gap-1 hover:text-blue-600">
                  CONFIDENCE <SortIndicator active={sortBy === "confidence"} direction={sortDirection} />
                </button>
              </th>
              <th className="px-4 py-3">SOURCE</th>
              <th className="px-4 py-3">ISSUE</th>
              <th className="px-4 py-3">ESCALATION</th>
              <th className="px-4 py-3">ROUTED TO</th>
              <th className="px-4 py-3">
                <button onClick={() => toggleSort("submittedAt")} className="flex items-center gap-1 hover:text-blue-600">
                  SUBMITTED <SortIndicator active={sortBy === "submittedAt"} direction={sortDirection} />
                </button>
              </th>
              <th className="px-4 py-3">ACTION</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((record) => (
              <tr key={record.id} onClick={() => setActiveRecord(record)} className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-blue-50/40">
                <td className="px-4 py-3"><CategoryBadge category={record.category} /></td>
                <td className="px-4 py-3"><PriorityBadge priority={record.priority} /></td>
                <td className="px-4 py-3"><ConfidenceScore score={record.confidence * 100} /></td>
                <td className="px-4 py-3 text-slate-600">{SOURCE_LABELS[record.request.source] ?? record.request.source}</td>
                <td className="px-4 py-3 text-slate-700">{record.coreIssue}</td>
                <td className="px-4 py-3 text-slate-700">{record.escalationReason || "-"}</td>
                <td className="px-4 py-3">
                  {record.department?.name ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      {record.department.name}
                    </span>
                  ) : record.status === "PENDING_REVIEW" ? (
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                      Unassigned
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
                <td className="px-4 py-3"><RelativeTime value={record.request.submittedAt} /></td>
                <td className="px-4 py-3">
                  {record.status === "PENDING_REVIEW" ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveRecord(record);
                      }}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700"
                    >
                      Route
                    </button>
                  ) : record.status === "AUTO_ROUTED" || record.status === "MANUALLY_ROUTED" ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        setActiveRecord(record);
                      }}
                      className="rounded-lg border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Force Route
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">-</span>
                  )}
                </td>
              </tr>
            ))}
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
