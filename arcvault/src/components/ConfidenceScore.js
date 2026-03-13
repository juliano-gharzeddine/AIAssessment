export default function ConfidenceScore({ score }) {
  const pct = Math.round(score);
  const tone = pct >= 70 ? "text-green-700" : pct >= 50 ? "text-amber-700" : "text-red-700";
  const bar = pct >= 70 ? "bg-green-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex min-w-28 items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${bar}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-medium ${tone}`}>{pct}%</span>
    </div>
  );
}
