import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { requireUser } from "@/lib/auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
          <Link href="/dashboard" className="font-semibold text-emerald-900">Undangan</Link>
          <nav className="flex flex-1 items-center gap-4 text-sm text-stone-600">
            <Link href="/dashboard" className="hover:text-stone-900">Undangan saya</Link>
            {user.role === "admin" && (
              <Link href="/dashboard/admin/new" className="hover:text-stone-900">Buat undangan</Link>
            )}
          </nav>
          <span className="hidden text-sm text-stone-500 sm:block">
            {user.name}{user.role === "admin" && " · admin"}
          </span>
          <form action={logout}>
            <button className="rounded-lg border border-stone-300 px-3 py-1.5 text-sm hover:bg-stone-50">Keluar</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
