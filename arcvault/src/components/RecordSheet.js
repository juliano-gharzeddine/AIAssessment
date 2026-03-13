"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import CategoryBadge from "@/components/CategoryBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { SOURCE_LABELS, STATUS_LABELS } from "@/lib/labels";

export default function RecordSheet({ record, onClose, departments, onRoute }) {
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [reviewNotes, setReviewNotes] = useState("");

  if (!record) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/20" onClick={onClose}>
      <div className="absolute right-0 top-0 h-full w-full max-w-xl translate-x-0 overflow-y-auto bg-white p-6 shadow-2xl transition-transform" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-semibold text-slate-900">Route Record</h3>
        <div className="mt-3 flex gap-2"><CategoryBadge category={record.category} /><PriorityBadge priority={record.priority} /></div>
        <div className="mt-4 space-y-3 text-sm text-slate-600">
          <p><span className="font-medium text-slate-800">Source:</span> {SOURCE_LABELS[record.request.source] ?? record.request.source}</p>
          <p><span className="font-medium text-slate-800">Status:</span> {STATUS_LABELS[record.status] ?? record.status}</p>
          <p><span className="font-medium text-slate-800">Core Issue:</span> {record.coreIssue}</p>
          <p><span className="font-medium text-slate-800">Escalation Reason:</span> {record.escalationReason ?? "None"}</p>
          <p><span className="font-medium text-slate-800">Summary:</span> {record.summary}</p>
          <p><span className="font-medium text-slate-800">Raw Message:</span></p>
          <p className="rounded-lg bg-slate-100 p-3">{record.request.rawMessage}</p>
        </div>

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
          <Button className="w-full" onClick={() => onRoute(record.id, departmentId, reviewNotes)}>Route to Department</Button>
        </div>
      </div>
    </div>
  );
}
