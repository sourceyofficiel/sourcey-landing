import { redirect } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Logo } from "@/components/ui/Logo";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/login?next=/admin");
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <AdminSidebar
        user={{ email: admin.email, fullName: admin.fullName }}
      />

      <div className="flex min-h-screen flex-1 flex-col md:pl-64">
        {/* Top bar mobile */}
        <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 md:hidden">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo />
            <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wider text-rose-700">
              Admin
            </span>
          </Link>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
