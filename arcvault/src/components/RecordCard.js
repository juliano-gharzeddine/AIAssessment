"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { markResolvedAction } from "@/app/dashboard/actions";
import CategoryBadge from "@/components/CategoryBadge";
import PriorityBadge from "@/components/PriorityBadge";
import RelativeTime from "@/components/RelativeTime";
import { Button } from "@/components/ui/button";

const borderByPriority = {
  HIGH: "border-l-red-200",
  MEDIUM: "border-l-amber-200",
  LOW: "border-l-green-200",
};

export default function RecordCard({ record, onResolved }) {
  const [expanded, setExpanded] = useState(false);
  const [pending, startTransition] = useTransition();
  const detailsRef = useRef(null);

  useEffect(() => {
    if (!detailsRef.current || !expanded) return;

    detailsRef.current.animate(
      [
        { opacity: 0, transform: "translateY(-8px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 260, easing: "ease-out", fill: "both" },
    );
  }, [expanded]);

  function resolve() {
    startTransition(async () => {
      await markResolvedAction(record.id);
      onResolved(record.id);
    });
  }

  return (
    <article
      className={`rounded-3xl border border-slate-200 border-l-4 ${borderByPriority[record.priority]} bg-white p-5 shadow-sm transition-shadow hover:shadow-md`}
    >
      <button className="w-full text-left" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2"><PriorityBadge priority={record.priority} /><CategoryBadge category={record.category} /></div>
          <RelativeTime value={record.processedAt} />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-slate-900">{record.coreIssue}</h3>
        <p className="mt-1 text-sm text-slate-600">{record.urgencySignal}</p>
      </button>

      {expanded && (
        <div ref={detailsRef} className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-sm text-slate-600">
          <p><span className="font-medium text-slate-800">Routing Reason:</span> {record.routingReason ?? "N/A"}</p>
          <p><span className="font-medium text-slate-800">Summary:</span> {record.summary}</p>
          <p><span className="font-medium text-slate-800">Message:</span> {record.request.rawMessage}</p>
          {record.status !== "RESOLVED" && (
            <Button onClick={resolve} disabled={pending} className="mt-2 rounded-xl">{pending ? "Resolving..." : "Mark as Resolved"}</Button>
          )}
        </div>
      )}
    </article>
  );
}
