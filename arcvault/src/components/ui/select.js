import { cn } from "@/lib/utils";

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "w-full rounded-xl bg-white px-3 py-2 text-sm text-slate-900 shadow-sm ring-1 ring-slate-200 outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-400",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
