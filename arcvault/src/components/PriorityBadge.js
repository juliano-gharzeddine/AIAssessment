import { formatEnum } from "@/lib/utils";

const styles = {
  HIGH: "bg-red-100 text-red-700",
  MEDIUM: "bg-amber-100 text-amber-700",
  LOW: "bg-green-100 text-green-700",
};

export default function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${styles[priority] ?? "bg-slate-100 text-slate-600"}`}>
      {formatEnum(priority)}
    </span>
  );
}
