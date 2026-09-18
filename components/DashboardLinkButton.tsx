import Link from "next/link";

export default function DashboardLinkButton() {
  return (
    <Link
      href="/admin/dashboard"
      className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-black text-white font-semibold rounded-lg text-sm hover:bg-brand-black-soft transition-colors"
    >
      Dashboard
    </Link>
  );
}
