import { redirect } from "next/navigation";

/**
 * /autosav redirige vers / — la landing AutoSAV est désormais la home principale.
 * Cette redirection garde compatible les anciens liens qui pointaient vers /autosav.
 */
export default function AutosavRedirect() {
  redirect("/");
}
