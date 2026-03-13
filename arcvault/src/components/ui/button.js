import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
