import { formatEnum } from "@/lib/utils";

const styles = {
  BUG_REPORT: "bg-rose-100 text-rose-700",
  FEATURE_REQUEST: "bg-indigo-100 text-indigo-700",
  BILLING_ISSUE: "bg-cyan-100 text-cyan-700",
  TECHNICAL_QUESTION: "bg-violet-100 text-violet-700",
  INCIDENT_OUTAGE: "bg-orange-100 text-orange-700",
};

export default function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[category] ?? "bg-slate-100 text-slate-600"}`}>
      {formatEnum(category)}
    </span>
  );
}
