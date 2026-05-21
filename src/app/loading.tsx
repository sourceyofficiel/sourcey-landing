import { LoadingScreen } from "@/components/v2/LoadingScreen";

/**
 * Loading screen global — affiché par Next.js pendant les transitions de
 * routes (server components qui attendent leurs données, navigations
 * client-side, etc.).
 *
 * Hérité par toutes les routes qui n'ont pas leur propre loading.tsx.
 */
export default function Loading() {
  return <LoadingScreen />;
}
