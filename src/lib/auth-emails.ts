/**
 * Templates des 4 emails d'authentification.
 *
 * Charte : envoi via Resend, expéditeur "Sourcey <noreply@sourcey.fr>",
 * design simple (texte + un bouton CTA), pas de tracking pixel.
 *
 * Chaque fonction de cette lib :
 *   1. Construit le HTML + texte de l'email
 *   2. Appelle sendEmail() de @/lib/email (qui wrap Resend)
 *   3. Log mais NE THROW JAMAIS — un email raté ne doit pas casser le flow
 */

import { sendEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://sourcey.fr";
const FROM = "Sourcey <noreply@sourcey.fr>";

/* ============================================================
   TEMPLATE WRAPPER — style cohérent pour les 4 emails
   ============================================================ */

function emailLayout(opts: {
  title: string;
  body: string;
  ctaUrl?: string;
  ctaLabel?: string;
  footer?: string;
}) {
  return `
<!DOCTYPE html>
<html lang="fr">
  <body style="margin:0;padding:0;background:#f6f7fb;font-family:'Helvetica Neue',Arial,sans-serif;color:#1c2333;">
    <div style="max-width:560px;margin:32px auto;padding:0 20px;">
      <div style="text-align:center;padding:16px 0;">
        <a href="${SITE_URL}" style="font-size:20px;font-weight:800;letter-spacing:-0.02em;color:#1c2333;text-decoration:none;">Sourcey</a>
      </div>
      <div style="background:#fff;border-radius:16px;padding:32px 28px;border:1px solid #e7e9f0;">
        <h1 style="margin:0 0 16px 0;font-size:22px;font-weight:800;line-height:1.25;color:#0e1535;">${opts.title}</h1>
        <div style="font-size:14.5px;line-height:1.6;color:#3d4859;">${opts.body}</div>
        ${
          opts.ctaUrl && opts.ctaLabel
            ? `<div style="text-align:center;margin:28px 0 8px 0;">
                <a href="${opts.ctaUrl}" style="display:inline-block;background:#386BFF;color:#fff;text-decoration:none;padding:13px 26px;border-radius:12px;font-weight:700;font-size:14.5px;">${opts.ctaLabel}</a>
              </div>`
            : ""
        }
        ${
          opts.footer
            ? `<p style="margin:24px 0 0 0;font-size:12.5px;color:#8590a3;line-height:1.5;">${opts.footer}</p>`
            : ""
        }
      </div>
      <p style="text-align:center;color:#8590a3;font-size:11.5px;margin:20px 0;line-height:1.5;">
        Sourcey — Sourcing en Chine géré pour toi · <a href="${SITE_URL}" style="color:#8590a3;">sourcey.fr</a>
      </p>
    </div>
  </body>
</html>
`.trim();
}

/* ============================================================
   1. CONFIRMATION D'INSCRIPTION (email_verify)
   ============================================================ */

export async function sendEmailVerification(opts: {
  to: string;
  fullName?: string | null;
  token: string; // token URL-safe en clair
}) {
  const url = `${SITE_URL}/auth/verify-email?token=${encodeURIComponent(opts.token)}`;
  const html = emailLayout({
    title: "Confirme ton adresse email",
    body: `
      <p>Salut ${escapeHtml(opts.fullName ?? "")},</p>
      <p>Bienvenue sur Sourcey ! Pour activer ton compte et commencer à sourcer
      en Chine en toute tranquillité, confirme ton adresse email en cliquant
      sur le bouton ci-dessous.</p>
      <p>Le lien expire dans <strong>24 heures</strong>.</p>
    `,
    ctaUrl: url,
    ctaLabel: "Confirmer mon adresse email",
    footer: `Si tu n'es pas à l'origine de cette inscription, ignore simplement
      cet email — aucun compte ne sera créé. Lien direct si le bouton ne
      fonctionne pas :<br><a href="${url}" style="color:#386BFF;word-break:break-all;">${url}</a>`,
  });

  return sendEmail({
    to: opts.to,
    subject: "Confirme ton adresse email — Sourcey",
    html,
    replyTo: "hello@sourcey.fr",
  });
}

/* ============================================================
   2. CODE 2FA (totp_email)
   ============================================================ */

export async function sendTwoFactorCode(opts: {
  to: string;
  fullName?: string | null;
  code: string; // 6 chiffres en clair
}) {
  const html = emailLayout({
    title: "Ton code de connexion Sourcey",
    body: `
      <p>Salut ${escapeHtml(opts.fullName ?? "")},</p>
      <p>Pour finaliser ta connexion, saisis ce code à 6 chiffres sur la page
      de vérification :</p>
      <div style="text-align:center;margin:24px 0;">
        <div style="display:inline-block;font-family:'JetBrains Mono','Courier New',monospace;font-size:36px;font-weight:800;letter-spacing:0.32em;color:#0e1535;background:#f3f6ff;padding:18px 28px 18px 32px;border-radius:14px;border:1px solid #e0e8ff;">${opts.code}</div>
      </div>
      <p>Ce code expire dans <strong>10 minutes</strong>.</p>
    `,
    footer: `Si tu n'as pas essayé de te connecter, on te recommande de
      <strong>changer ton mot de passe immédiatement</strong> — quelqu'un a
      probablement deviné tes identifiants. Réponds à cet email pour qu'on
      regarde avec toi.`,
  });

  return sendEmail({
    to: opts.to,
    subject: `Sourcey — ${opts.code} est ton code de connexion`,
    html,
    replyTo: "hello@sourcey.fr",
  });
}

/* ============================================================
   3. RESET PASSWORD (password_reset)
   ============================================================ */

export async function sendPasswordResetEmail(opts: {
  to: string;
  fullName?: string | null;
  token: string;
}) {
  const url = `${SITE_URL}/auth/reset-password?token=${encodeURIComponent(opts.token)}`;
  const html = emailLayout({
    title: "Réinitialise ton mot de passe",
    body: `
      <p>Salut ${escapeHtml(opts.fullName ?? "")},</p>
      <p>Tu as demandé à réinitialiser ton mot de passe Sourcey. Clique sur le
      bouton ci-dessous pour choisir un nouveau mot de passe.</p>
      <p>Le lien expire dans <strong>1 heure</strong>. Il ne peut être utilisé
      qu'une seule fois.</p>
    `,
    ctaUrl: url,
    ctaLabel: "Choisir un nouveau mot de passe",
    footer: `Si tu n'as pas demandé cette réinitialisation, ignore simplement
      cet email — ton mot de passe actuel reste valide. Si tu reçois plusieurs
      emails de ce type sans en être à l'origine, contacte-nous immédiatement
      à hello@sourcey.fr.`,
  });

  return sendEmail({
    to: opts.to,
    subject: "Réinitialise ton mot de passe — Sourcey",
    html,
    replyTo: "hello@sourcey.fr",
  });
}

/* ============================================================
   4. CONFIRMATION CHANGEMENT MOT DE PASSE
   ============================================================ */

export async function sendPasswordChangedEmail(opts: {
  to: string;
  fullName?: string | null;
}) {
  const html = emailLayout({
    title: "Ton mot de passe a été modifié",
    body: `
      <p>Salut ${escapeHtml(opts.fullName ?? "")},</p>
      <p>On confirme que ton mot de passe Sourcey vient d'être modifié. À
      partir de maintenant, utilise le nouveau mot de passe pour te connecter.</p>
      <p style="background:#fff5f5;border-left:3px solid #ef4444;padding:12px 14px;border-radius:6px;color:#7f1d1d;font-size:13.5px;">
        <strong>Ce n'est pas toi ?</strong> Réponds immédiatement à cet email
        ou écris à <a href="mailto:hello@sourcey.fr" style="color:#7f1d1d;">hello@sourcey.fr</a>.
        On bloquera ton compte le temps de vérifier.
      </p>
    `,
  });

  return sendEmail({
    to: opts.to,
    subject: "Ton mot de passe Sourcey a été modifié",
    html,
    replyTo: "hello@sourcey.fr",
  });
}

/* ============================================================
   UTILS
   ============================================================ */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
