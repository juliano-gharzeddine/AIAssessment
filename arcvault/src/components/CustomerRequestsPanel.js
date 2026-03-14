"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { CATEGORY_LABELS, SOURCE_LABELS, STATUS_LABELS } from "@/lib/labels";
import { decodeHtmlEntities, smartDateTime } from "@/lib/utils";

function getCustomerStatus(record) {
  if (!record) return "PENDING";
  if (record.status === "RESOLVED") return "RESOLVED";
  return "PENDING";
}

function StatusBadge({ status }) {
  const tone = status === "RESOLVED" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700";
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${tone}`}>{STATUS_LABELS[status] ?? status}</span>;
}

function CustomerStatusDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const options = {
    ALL: "All statuses",
    PENDING: "Pending",
    RESOLVED: "Resolved",
  };

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-w-36 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
      >
        <span>{options[value]}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
          {Object.entries(options).map(([optionValue, optionLabel]) => (
            <button
              key={optionValue}
              type="button"
              onClick={() => {
                onChange(optionValue);
                setOpen(false);
              }}
              className="mt-1 flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm text-slate-700 hover:bg-slate-50"
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

export default function CustomerRequestsPanel({ initialRequests }) {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  const requests = useMemo(() => {
    return initialRequests.filter((request) => {
      const requestStatus = getCustomerStatus(request.processedRecord);
      if (status !== "ALL" && requestStatus !== status) return false;

      if (!keyword.trim()) return true;
      const text = `${request.rawMessage} ${request.processedRecord?.coreIssue ?? ""} ${request.processedRecord?.summary ?? ""}`.toLowerCase();
      return text.includes(keyword.toLowerCase());
    });
  }, [initialRequests, keyword, status]);

  return (
    <div id="my-requests" className="scroll-mt-32 rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Your Requests</h2>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              placeholder="Filter by keyword"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
            <CustomerStatusDropdown value={status} onChange={setStatus} />
          </div>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {requests.map((request) => {
          const customerStatus = getCustomerStatus(request.processedRecord);
          return (
            <div key={request.id} className="px-6 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-slate-600">{SOURCE_LABELS[request.source] ?? request.source}</p>
                <StatusBadge status={customerStatus} />
              </div>
              <p className="mt-2 whitespace-pre-wrap break-words text-sm text-slate-800">{decodeHtmlEntities(request.rawMessage).slice(0, 140)}{decodeHtmlEntities(request.rawMessage).length > 140 ? "..." : ""}</p>
              <p className="mt-2 text-xs text-slate-500">Submitted {smartDateTime(request.submittedAt)}</p>
              {request.processedRecord?.status === "RESOLVED" && request.processedRecord.updatedAt && (
                <p className="mt-1 text-xs text-emerald-700">Resolved {smartDateTime(request.processedRecord.updatedAt)}</p>
              )}
              <p className="mt-1 text-xs text-slate-600">
                {request.processedRecord
                  ? `${CATEGORY_LABELS[request.processedRecord.category] ?? request.processedRecord.category} • ${STATUS_LABELS[customerStatus] ?? customerStatus}`
                  : "Processing..."}
              </p>
            </div>
          );
        })}
        {!requests.length && <p className="px-6 py-8 text-sm text-slate-500">No requests found for the selected filters.</p>}
      </div>
    </div>
  );
}
