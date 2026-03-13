import { CATEGORY_LABELS } from "@/lib/labels";

const styles = {
  BUG_REPORT: "bg-red-100 text-red-700 border-red-200",
  FEATURE_REQUEST: "bg-purple-100 text-purple-700 border-purple-200",
  BILLING_ISSUE: "bg-blue-100 text-blue-700 border-blue-200",
  TECHNICAL_QUESTION: "bg-cyan-100 text-cyan-700 border-cyan-200",
  INCIDENT_OUTAGE: "bg-orange-100 text-orange-700 border-orange-200",
};

export default function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[category] ?? "bg-slate-100 text-slate-600 border-slate-200"}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
