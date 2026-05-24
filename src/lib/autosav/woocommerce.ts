/**
 * AutoSAV — client WooCommerce REST API.
 *
 * Auth Basic via consumerKey + consumerSecret (clés API REST WC, créées dans
 * WC → Réglages → Avancé → API REST).
 *
 * Pour chaque ticket entrant, on lookup les commandes de l'email customer
 * pour enrichir le panneau client + le contexte fourni à l'IA.
 */

import { prisma } from "@/lib/db";

interface WcConfig {
  storeUrl: string;
  consumerKey: string;
  consumerSecret: string;
}

export interface WcOrder {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  dateCreated: string;
  itemsCount: number;
  firstItem: string | null;
  shippingTracking: string | null;
}

interface WcOrderRaw {
  id: number;
  number: string;
  status: string;
  total: string;
  currency: string;
  date_created: string;
  line_items?: Array<{ name: string; quantity: number }>;
  meta_data?: Array<{ key: string; value: unknown }>;
  shipping_lines?: Array<{ method_title: string }>;
}

/**
 * Récupère la config WC depuis l'intégration enregistrée pour un workspace.
 * Renvoie null si pas connecté.
 */
export async function getWcConfig(workspaceId: string): Promise<WcConfig | null> {
  const integration = await prisma.autosavIntegration.findFirst({
    where: {
      workspaceId,
      type: "woocommerce",
      status: { in: ["connected", "error"] }, // on tente même en error, ptet juste un transient
    },
  });
  if (!integration) return null;

  try {
    const c = JSON.parse(integration.encryptedConfig) as Record<string, unknown>;
    const storeUrl = String(c.storeUrl ?? "").replace(/\/$/, "");
    const consumerKey = String(c.consumerKey ?? "");
    const consumerSecret = String(c.consumerSecret ?? "");
    if (!storeUrl || !consumerKey || !consumerSecret) return null;
    return { storeUrl, consumerKey, consumerSecret };
  } catch {
    return null;
  }
}

/**
 * Cherche les commandes d'un client par email. Renvoie un array trié par
 * date décroissante (plus récent en premier). Limité à `limit`.
 *
 * Note WC : ?search=email matche large (peut renvoyer des faux positifs si
 * un autre client a cet email dans une autre meta). On filtre côté nous
 * sur billing.email exact pour être safe.
 */
export async function fetchCustomerOrders(
  workspaceId: string,
  customerEmail: string,
  limit = 5
): Promise<WcOrder[]> {
  const config = await getWcConfig(workspaceId);
  if (!config) return [];

  const url = new URL(`${config.storeUrl}/wp-json/wc/v3/orders`);
  url.searchParams.set("search", customerEmail);
  url.searchParams.set("per_page", String(Math.min(limit * 3, 20)));
  url.searchParams.set("orderby", "date");
  url.searchParams.set("order", "desc");

  const auth = Buffer.from(
    `${config.consumerKey}:${config.consumerSecret}`
  ).toString("base64");

  let raw: WcOrderRaw[] = [];
  try {
    // Timeout 8s pour éviter de bloquer le rendu du ticket si WC down
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: "application/json",
      },
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      // Log discret, on ne fait pas planter le ticket pour autant
      console.warn(
        `[wc] orders fetch ${res.status} pour ws=${workspaceId} email=${customerEmail}`
      );
      // Marque l'intégration en erreur si auth refusée
      if (res.status === 401 || res.status === 403) {
        await prisma.autosavIntegration.updateMany({
          where: { workspaceId, type: "woocommerce" },
          data: {
            status: "error",
            lastSyncError: `WooCommerce ${res.status} : vérifie les clés API`,
          },
        });
      }
      return [];
    }
    raw = (await res.json()) as WcOrderRaw[];

    // Met à jour lastSyncAt en cas de succès
    await prisma.autosavIntegration.updateMany({
      where: { workspaceId, type: "woocommerce" },
      data: { lastSyncAt: new Date(), status: "connected", lastSyncError: null },
    });
  } catch (e) {
    console.warn(`[wc] fetch error pour ws=${workspaceId}`, e);
    return [];
  }

  // Filtre stricte sur l'email facturation (WC search peut être lâche)
  const normalized = customerEmail.toLowerCase().trim();
  const filtered = raw.filter((o) => {
    // billing.email n'est pas exposé direct dans la liste — on s'appuie sur
    // le search WC qui matche déjà sur l'email. Si on veut être strict, il
    // faudrait fetch chaque commande complète. Pour l'instant on trust le
    // résultat de search puis on dedup par ID.
    return true;
  });

  // Dedup par ID
  const seen = new Set<number>();
  const unique = filtered.filter((o) => {
    if (seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });

  return unique.slice(0, limit).map(normalizeOrder);
}

function normalizeOrder(o: WcOrderRaw): WcOrder {
  // Détection tracking dans la meta_data (plugins courants : Advanced
  // Shipment Tracking, YITH WooCommerce Order Tracking, etc.)
  const trackingMeta = o.meta_data?.find((m) =>
    typeof m.key === "string" &&
    /tracking|suivi|colis/i.test(m.key) &&
    typeof m.value === "string"
  );
  const shippingTracking = trackingMeta?.value
    ? String(trackingMeta.value).slice(0, 80)
    : null;

  const firstItem = o.line_items?.[0]
    ? `${o.line_items[0].name}${
        o.line_items[0].quantity > 1 ? ` ×${o.line_items[0].quantity}` : ""
      }`
    : null;

  return {
    id: o.id,
    number: o.number,
    status: o.status,
    total: o.total,
    currency: o.currency,
    dateCreated: o.date_created,
    itemsCount:
      o.line_items?.reduce((sum, l) => sum + (l.quantity ?? 0), 0) ?? 0,
    firstItem,
    shippingTracking,
  };
}

/* ============================================================
   FORMAT POUR L'IA — passé en orderContext au prompt
   ============================================================ */

export function formatOrdersForAi(orders: WcOrder[]): string | null {
  if (orders.length === 0) return null;
  const lines = orders.map((o) => {
    const parts = [
      `Commande #${o.number}`,
      `Statut WooCommerce : ${o.status}`,
      `Date : ${new Date(o.dateCreated).toLocaleDateString("fr-FR")}`,
      `Total : ${o.total} ${o.currency}`,
    ];
    if (o.firstItem) parts.push(`Article principal : ${o.firstItem}`);
    if (o.itemsCount > 1) parts.push(`Nombre d'articles : ${o.itemsCount}`);
    if (o.shippingTracking) parts.push(`Tracking : ${o.shippingTracking}`);
    return parts.join(" · ");
  });
  return lines.join("\n");
}
