import nodemailer from 'nodemailer';

function parseSmtpPort() {
  const parsed = Number(process.env.RESEND_SMTP_PORT || '465');
  return Number.isFinite(parsed) ? parsed : 465;
}

function buildTransport() {
  const host = process.env.RESEND_SMTP_HOST || 'smtp.resend.com';
  const port = parseSmtpPort();
  const secure = process.env.RESEND_SMTP_SECURE
    ? process.env.RESEND_SMTP_SECURE === 'true'
    : port === 465;
  const user = process.env.RESEND_SMTP_USER || 'resend';
  const pass = process.env.RESEND_SMTP_PASS;

  if (!pass) {
    throw new Error('RESEND_SMTP_PASS manquant. Configurez le mot de passe SMTP Resend.');
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

export class EmailService {
  static async sendPasswordResetEmail(params: {
    to: string;
    recipientName?: string;
    resetLink: string;
  }) {
    const from = process.env.EMAIL_FROM;
    if (!from) {
      throw new Error('EMAIL_FROM manquant. Exemple: CineConnect <noreply@votre-domaine.com>');
    }

    const transporter = buildTransport();
    const displayName = params.recipientName?.trim() || 'utilisateur';

    const text = [
      `Bonjour ${displayName},`,
      '',
      'Vous avez demandé la réinitialisation de votre mot de passe CineConnect.',
      'Cliquez sur ce lien pour définir un nouveau mot de passe :',
      params.resetLink,
      '',
      'Ce lien expire dans 1 heure.',
      'Si vous n\'êtes pas à l\'origine de cette demande, ignorez simplement cet email.',
    ].join('\n');

    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.5;color:#111827;max-width:560px;margin:auto;">
        <h2 style="margin-bottom:12px;">Réinitialisation du mot de passe</h2>
        <p>Bonjour ${displayName},</p>
        <p>Vous avez demandé la réinitialisation de votre mot de passe CineConnect.</p>
        <p>
          <a href="${params.resetLink}" style="display:inline-block;padding:10px 16px;background:#111827;color:#ffffff;text-decoration:none;border-radius:6px;">
            Réinitialiser mon mot de passe
          </a>
        </p>
        <p>Ce lien expire dans <strong>1 heure</strong>.</p>
        <p style="color:#6b7280;font-size:14px;">Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.</p>
      </div>
    `;

    await transporter.sendMail({
      from,
      to: params.to,
      subject: 'CineConnect - Réinitialisation de mot de passe',
      text,
      html,
    });
  }
}
