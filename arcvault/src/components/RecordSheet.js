"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import CategoryBadge from "@/components/CategoryBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/labels";
import { decodeHtmlEntities, hasDisplayableIdentifiers } from "@/lib/utils";


const IDENTIFIER_LABELS = {
  accountId: "Account ID",
  invoiceNumber: "Invoice Number",
  errorCode: "Error Code",
  userId: "User ID",
};

function formatIdentifierKey(key) {
  if (IDENTIFIER_LABELS[key]) return IDENTIFIER_LABELS[key];
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function RecordSheet({ record, onClose, departments, onRoute }) {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [reviewNotes, setReviewNotes] = useState("");

  if (!record) return null;

  const canRoute = record.status !== "RESOLVED";
  const identifierEntries = hasDisplayableIdentifiers(record.identifiers) ? Object.entries(record.identifiers) : [];
  const isPendingReview = record.status === "PENDING_REVIEW";

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/20" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-xl translate-x-0 overflow-y-auto bg-white p-6 shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-slate-900">Record Details</h3>
        <div className="mt-3 flex gap-2"><CategoryBadge category={record.category} /><PriorityBadge priority={record.priority} /></div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p><span className="font-medium text-slate-800">Source:</span> {SOURCE_LABELS[record.request.source] ?? record.request.source}</p>
          <p><span className="font-medium text-slate-800">Status:</span> {STATUS_LABELS[record.status] ?? record.status}</p>
          <p><span className="font-medium text-slate-800">Core Issue:</span> {record.coreIssue}</p>
          {record.escalationReason && <p><span className="font-medium text-slate-800">Escalation Reason:</span> {record.escalationReason}</p>}
          {identifierEntries.length > 0 && (
            <div>
              <p className="font-medium text-slate-800">Identifiers:</p>
              <div className="mt-2 space-y-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3">
                {identifierEntries.map(([key, value]) => (
                  <p key={key} className="text-slate-700">
                    <span className="font-medium text-slate-800">{formatIdentifierKey(key)}:</span>{" "}
                    <span>{String(value)}</span>
                  </p>
                ))}
              </div>
            </div>
          )}
          <p><span className="font-medium text-slate-800">Summary:</span> {record.summary}</p>
          <p><span className="font-medium text-slate-800">Raw Message:</span></p>
          <p className="max-h-56 overflow-y-auto whitespace-pre-wrap break-words rounded-lg bg-slate-100 p-3">{decodeHtmlEntities(record.request.rawMessage)}</p>
        </div>

        {canRoute ? (
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-4">
            <Select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
              {departments.map((department) => <option key={department.id} value={department.id}>{department.name}</option>)}
            </Select>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Optional review notes"
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none ring-blue-500 focus:ring-2"
            />
            <Button className="w-full" onClick={() => onRoute(record.id, departmentId, reviewNotes)}>{isPendingReview ? "Route to Department" : "Force Route to Department"}</Button>
          </div>
        ) : (
          <p className="mt-6 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
            Resolved records cannot be routed again.
          </p>
        )}
      </div>
    </div>
  );
}
