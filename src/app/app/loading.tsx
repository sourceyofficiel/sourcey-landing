import { LoadingScreen } from "@/components/v2/LoadingScreen";

/**
 * Loading affiché pendant les transitions entre pages /app/*.
 * Rendu dans la zone de contenu (la sidebar AppShell reste visible).
 */
export default function AppLoading() {
  return <LoadingScreen />;
}
