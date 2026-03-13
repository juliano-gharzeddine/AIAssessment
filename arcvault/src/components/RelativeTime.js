import { relativeTime } from "@/lib/utils";

export default function RelativeTime({ value }) {
  return <span className="text-sm text-slate-500">{relativeTime(value)}</span>;
}
