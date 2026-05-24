/**
 * AutoSAV — synchronisation IMAP.
 *
 * Pour chaque intégration de type 'ionos' (et plus tard 'gmail'/'outlook' en
 * fallback IMAP), on se connecte à la boîte INBOX, on lit les emails reçus
 * depuis le dernier sync (ou les 7 derniers jours au premier sync), et on
 * upserte des AutosavTicket en DB.
 *
 * Idempotent : si un UID IMAP a déjà été importé (externalId = `imap-<host>-<uid>`),
 * on ne crée pas de doublon.
 */

import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { prisma } from "@/lib/db";

interface ImapConfig {
  email: string;
  password: string;
  imapHost: string;
  imapPort?: number;
}

interface SyncResult {
  fetched: number;
  created: number;
  skipped: number;
  errors: number;
}

/**
 * Synchronise une intégration IMAP (récupère les nouveaux mails et crée des
 * tickets). Renvoie un résumé.
 */
export async function syncImapIntegration(
  workspaceId: string,
  integrationId: string
): Promise<SyncResult> {
  const integration = await prisma.autosavIntegration.findFirst({
    where: { id: integrationId, workspaceId },
  });
  if (!integration) {
    throw new Error("Intégration introuvable");
  }

  const config = parseConfig(integration.encryptedConfig);
  if (!config.email || !config.password || !config.imapHost) {
    throw new Error("Configuration IMAP incomplète");
  }

  const lastSyncAt = integration.lastSyncAt;
  // Premier sync : on remonte 7 jours en arrière. Sinon depuis le dernier sync.
  const since = lastSyncAt
    ? new Date(lastSyncAt.getTime() - 5 * 60 * 1000) // marge de 5 min
    : new Date(Date.now() - 7 * 24 * 3600 * 1000);

  const client = new ImapFlow({
    host: config.imapHost,
    port: config.imapPort ?? 993,
    secure: true,
    auth: { user: config.email, pass: config.password },
    logger: false,
  });

  const result: SyncResult = { fetched: 0, created: 0, skipped: 0, errors: 0 };

  try {
    await client.connect();
    const lock = await client.getMailboxLock("INBOX");
    try {
      // Cherche les messages reçus depuis `since`
      const uids = await client.search({ since }, { uid: true });
      const uidList = Array.isArray(uids) ? uids : [];
      result.fetched = uidList.length;

      // Limite hard à 50 mails par sync pour éviter timeouts Vercel (60s sur Hobby)
      const toProcess = uidList.slice(-50);

      for (const uid of toProcess) {
        try {
          await processMessage(client, uid, workspaceId, integration, result);
        } catch (e) {
          console.error(`[imap-sync] uid=${uid}`, e);
          result.errors++;
        }
      }
    } finally {
      lock.release();
    }
    await client.logout();

    await prisma.autosavIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncAt: new Date(),
        lastSyncError: null,
        status: "connected",
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    await prisma.autosavIntegration.update({
      where: { id: integration.id },
      data: {
        lastSyncError: message.slice(0, 500),
        status: "error",
      },
    });
    try {
      await client.logout();
    } catch {
      /* déjà fermé */
    }
    throw e;
  }

  return result;
}

/**
 * Récupère un message par UID, parse, crée le ticket si nouveau.
 */
async function processMessage(
  client: ImapFlow,
  uid: number,
  workspaceId: string,
  integration: { id: string; type: string },
  result: SyncResult
): Promise<void> {
  const externalId = `imap-${integration.id}-${uid}`;

  // Skip si déjà importé
  const existing = await prisma.autosavTicket.findUnique({
    where: { workspaceId_externalId: { workspaceId, externalId } },
    select: { id: true },
  });
  if (existing) {
    result.skipped++;
    return;
  }

  // Téléchargement du message
  const msg = await client.fetchOne(
    String(uid),
    { source: true, envelope: true, internalDate: true },
    { uid: true }
  );
  if (!msg || !msg.source) {
    result.errors++;
    return;
  }

  const parsed = await simpleParser(msg.source);

  const fromAddr = parsed.from?.value?.[0];
  if (!fromAddr?.address) {
    // Pas d'expéditeur exploitable : skip silencieux (notifs système, etc.)
    result.skipped++;
    return;
  }

  const customerEmail = fromAddr.address.toLowerCase().trim();
  const customerName = fromAddr.name?.trim() || null;
  const subject = parsed.subject?.trim() || "(sans objet)";
  const body =
    parsed.text?.trim() ||
    stripHtml(parsed.html || "") ||
    "(message vide)";

  // Détection basique de spam (filtre minimal : on garde large, l'IA fera le tri ensuite)
  const looksLikeSpam = isLikelyAutomated(subject, customerEmail);

  await prisma.autosavTicket.create({
    data: {
      workspaceId,
      externalId,
      channel: "email",
      customerEmail,
      customerName,
      subject,
      body: body.slice(0, 50000), // hard cap pour éviter d'exploser la row
      status: looksLikeSpam ? "spam" : "pending",
      priority: "medium",
      category: "general",
      unread: true,
      receivedAt: parsed.date ?? msg.internalDate ?? new Date(),
    },
  });
  result.created++;
}

/* ============================================================
   UTILITAIRES
   ============================================================ */

function parseConfig(serialized: string): ImapConfig {
  try {
    const c = JSON.parse(serialized) as Record<string, unknown>;
    return {
      email: String(c.email ?? ""),
      password: String(c.password ?? ""),
      imapHost: String(c.imapHost ?? ""),
      imapPort:
        typeof c.imapPort === "number"
          ? c.imapPort
          : c.imapPort
            ? parseInt(String(c.imapPort), 10)
            : undefined,
    };
  } catch {
    throw new Error("Configuration JSON invalide");
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isLikelyAutomated(subject: string, email: string): boolean {
  const s = subject.toLowerCase();
  const e = email.toLowerCase();
  if (e.startsWith("noreply") || e.startsWith("no-reply")) return true;
  if (e.startsWith("notification") || e.startsWith("mailer-daemon")) return true;
  if (/^(re:|fwd:)?\s*(newsletter|promo|promotion|offre)/i.test(s)) return true;
  return false;
}
