import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-white via-primary-50/30 to-white">
      <div className="pointer-events-none absolute -top-32 left-1/2 -z-10 h-[480px] w-[900px] -translate-x-1/2 rounded-full bg-primary-200/30 blur-[120px]" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-neutral-200/60 bg-white/80 px-5 py-3 backdrop-blur">
        <Link
          href="/"
          aria-label="Retour à l'accueil Sourcey"
          className="inline-flex items-center gap-2 rounded-lg p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          <Logo />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Retour
        </Link>
      </header>

      <main className="relative mx-auto flex min-h-[calc(100vh-58px)] w-full max-w-md flex-col justify-center px-5 py-12">
        {children}
      </main>
    </div>
  );
}
