import { LoadingScreen } from "@/components/v2/LoadingScreen";

/**
 * Loading affiché pendant les transitions entre pages /admin/*.
 * Rendu dans la zone de contenu (la sidebar Admin reste visible).
 */
export default function AdminLoading() {
  return <LoadingScreen />;
}
