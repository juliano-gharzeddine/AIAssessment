import { PRIORITY_LABELS } from "@/lib/labels";

const styles = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-green-100 text-green-700 border-green-200",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[priority] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {PRIORITY_LABELS[priority] ?? priority}
    </span>
  );
}
