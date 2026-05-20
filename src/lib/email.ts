/**
 * Email adapter — abstracts Resend so the rest of the app doesn't care
 * if email is real or mocked.
 *
 * When `RESEND_API_KEY` is set, emails are sent via Resend.
 * Without it, emails are logged to the console (dev / demo mode).
 */

export const EMAIL_ENABLED = Boolean(process.env.RESEND_API_KEY);

const RESEND_URL = "https://api.resend.com/emails";
const FROM_ADDRESS =
  process.env.EMAIL_FROM ?? "Sourcey <hello@sourcey.fr>";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "hello@sourcey.fr";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  /** Optional plain-text fallback */
  text?: string;
  replyTo?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<boolean> {
  if (!EMAIL_ENABLED) {
    console.info("[email.sendEmail mock]", {
      to: payload.to,
      subject: payload.subject,
      preview: payload.html.slice(0, 100),
    });
    return true;
  }
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        reply_to: payload.replyTo ?? REPLY_TO,
      }),
    });
    if (!res.ok) {
      console.error("[email.sendEmail]", res.status, await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error("[email.sendEmail]", e);
    return false;
  }
}

// ============================================================
// TEMPLATES
// ============================================================

const baseStyle = `font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #0f172a;`;
const buttonStyle = `display: inline-block; background: #2563eb; color: white; padding: 12px 24px; border-radius: 999px; text-decoration: none; font-weight: 700; margin: 16px 0;`;
const footerStyle = `margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px;`;

function shell(content: string, opts: { footer?: string } = {}): string {
  return `<!doctype html><html><body style="margin:0; background: #f8fafc;"><div style="${baseStyle}">${content}<div style="${footerStyle}">${opts.footer ?? "Sourcey · Sourcing francophone depuis la Chine"}</div></div></body></html>`;
}

export function welcomeEmail({
  to,
  fullName,
  loginUrl,
}: {
  to: string;
  fullName?: string;
  loginUrl: string;
}): Promise<boolean> {
  const name = fullName ?? to.split("@")[0];
  return sendEmail({
    to,
    subject: "Bienvenue chez Sourcey 👋",
    html: shell(`
      <h1 style="font-size: 24px; font-weight: 800;">Hello ${name},</h1>
      <p>On est ravi de t'avoir sur Sourcey. Ton compte est créé.</p>
      <p>Pour démarrer :</p>
      <ol style="line-height: 1.7;">
        <li>Connecte-toi à ton dashboard</li>
        <li>Décris ton premier produit dans Match IA, ou parcours le catalogue</li>
        <li>L'agent te répondra sous 2h en moyenne</li>
      </ol>
      <a href="${loginUrl}" style="${buttonStyle}">Ouvrir mon dashboard →</a>
      <p style="color: #64748b; font-size: 13px;">Si tu as la moindre question, réponds directement à cet email — c'est un humain qui lit.</p>
    `),
  });
}

export function magicLinkEmail({
  to,
  url,
}: {
  to: string;
  url: string;
}): Promise<boolean> {
  return sendEmail({
    to,
    subject: "🔐 Ton lien de connexion Sourcey",
    html: shell(`
      <h1 style="font-size: 22px; font-weight: 800;">Clique pour te connecter</h1>
      <p>Lien valide 10 minutes. Si tu n'as rien demandé, ignore ce mail.</p>
      <a href="${url}" style="${buttonStyle}">Me connecter →</a>
      <p style="color: #64748b; font-size: 12px;">Ou copie ce lien :<br/><code style="background:#f1f5f9; padding:4px 8px; border-radius:4px; word-break:break-all;">${url}</code></p>
    `),
  });
}

export function newMessageNotification({
  to,
  agentName,
  preview,
  threadUrl,
}: {
  to: string;
  agentName: string;
  preview: string;
  threadUrl: string;
}): Promise<boolean> {
  return sendEmail({
    to,
    subject: `💬 ${agentName} t'a répondu sur Sourcey`,
    html: shell(`
      <h1 style="font-size: 20px; font-weight: 800;">Nouveau message de ${agentName}</h1>
      <blockquote style="border-left: 3px solid #2563eb; padding: 12px 16px; margin: 16px 0; background: #f8fafc; color: #334155;">
        ${preview}
      </blockquote>
      <a href="${threadUrl}" style="${buttonStyle}">Lire & répondre →</a>
    `),
  });
}

export function enterpriseLeadNotification({
  to,
  companyName,
  contactName,
  email,
  monthlyVolume,
  budgetRange,
  message,
}: {
  to: string;
  companyName: string;
  contactName: string;
  email: string;
  monthlyVolume?: string | null;
  budgetRange?: string | null;
  message?: string | null;
}): Promise<boolean> {
  return sendEmail({
    to,
    subject: `🔥 Nouveau lead Entreprise : ${companyName}`,
    replyTo: email,
    html: shell(`
      <h1 style="font-size: 22px; font-weight: 800;">${companyName}</h1>
      <p><strong>Contact :</strong> ${contactName} · <a href="mailto:${email}">${email}</a></p>
      <p><strong>Volume mensuel :</strong> ${monthlyVolume ?? "—"}<br/>
      <strong>Budget :</strong> ${budgetRange ?? "—"}</p>
      ${message ? `<div style="background:#f8fafc; padding:16px; border-radius:8px; margin-top:16px;"><strong>Brief :</strong><br/>${message.replace(/\n/g, "<br/>")}</div>` : ""}
      <p style="margin-top: 24px;">Recontacte sous 24h pour rester dans le SLA.</p>
    `),
  });
}
