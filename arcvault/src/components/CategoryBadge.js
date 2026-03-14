import { CATEGORY_LABELS } from "@/lib/labels";

const style = "border-slate-300 bg-slate-100 text-slate-700";

export default function CategoryBadge({ category }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style}`}>
      {CATEGORY_LABELS[category] ?? category}
    </span>
  );
}
