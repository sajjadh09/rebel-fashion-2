import type { ListingStatus, OrderStatus } from "@/lib/types";

const styles: Record<ListingStatus | OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
  paid: "bg-sky-50 text-sky-800 ring-sky-200",
  shipped: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
};

export function StatusBadge({ status }: { status: ListingStatus | OrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ring-1 ${styles[status]}`}>
      {status}
    </span>
  );
}
