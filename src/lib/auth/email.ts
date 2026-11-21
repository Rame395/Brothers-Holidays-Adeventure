import "server-only";
import nodemailer from "nodemailer";

function getSiteOrigin(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(
    /\/+$/,
    ""
  );
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  if (!host || !user || !pass) return null;

  const port = Number.parseInt(process.env.SMTP_PORT || "465", 10);
  const secure = process.env.SMTP_SECURE !== "false";
  const from =
    process.env.EMAIL_FROM?.trim() ||
    `BROTHERS Holidays Adventure <${user}>`;

  return { host, port, secure, user, pass, from };
}

async function sendEmailMessage(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
  previewUrl?: string;
}): Promise<void> {
  const smtp = getSmtpConfig();

  if (!smtp) {
    console.info("\n┌─────────────────────────────────────────────────────────────────────────");
    console.info("│ [AUTH EMAIL PREVIEW — SMTP not configured]");
    console.info(`│ To:      ${params.to}`);
    console.info(`│ Subject: ${params.subject}`);
    if (params.previewUrl) {
      console.info(`│ Action:  ${params.previewUrl}`);
    } else {
      console.info(`│ Body:    ${params.text}`);
    }
    console.info("└─────────────────────────────────────────────────────────────────────────\n");
    return;
  }

  const transporter = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: {
      user: smtp.user,
      pass: smtp.pass,
    },
  });

  await transporter.sendMail({
    from: smtp.from,
    to: params.to,
    subject: params.subject,
    html: params.html,
    text: params.text,
  });
}

function wrapEmailHtml(title: string, bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background:#071317; color:#f4f7f8; padding:32px 16px;">
    <div style="max-width:560px; margin:0 auto; background:#0c1e24; border:1px solid #c59a4a66; border-radius:12px; padding:32px;">
      <p style="margin:0 0 8px; font-size:11px; letter-spacing:3px; text-transform:uppercase; color:#e8b765;">BROTHERS Holidays Adventure</p>
      <h1 style="margin:0 0 18px; font-size:22px; color:#ffffff; font-weight:600;">${title}</h1>
      <div style="font-size:14px; line-height:1.65; color:#d2e0e3;">
        ${bodyHtml}
      </div>
      <hr style="border:none; border-top:1px solid #ffffff1a; margin:24px 0 16px;" />
      <p style="margin:0; font-size:11px; color:#8ba0a5;">
        Thamel, Kathmandu 44600, Nepal · Govt. Regd. 58177/068/069<br/>
        If you did not trigger this request, secure your account immediately or contact support.
      </p>
    </div>
  </div>`;
}

export async function sendVerificationEmail(params: {
  to: string;
  fullName: string;
  rawToken: string;
}): Promise<void> {
  const verifyUrl = `${getSiteOrigin()}/verify-email?token=${encodeURIComponent(
    params.rawToken
  )}`;
  const subject = "Verify your email — BROTHERS Holidays Adventure";
  const text = `Hello ${params.fullName},\n\nVerify your email address by visiting:\n${verifyUrl}\n\nThis link expires in 30 minutes and can be used once.`;
  const html = wrapEmailHtml(
    "Confirm Your Traveler Account",
    `<p>Namaste ${escapeHtml(params.fullName)},</p>
     <p>Click the button below to verify your email address and activate your BROTHERS Holidays traveler portal. Past bookings or inquiries linked to your email will appear inside once verified.</p>
     <p style="margin:24px 0;">
       <a href="${verifyUrl}" style="display:inline-block; background:#d99f38; color:#071317; font-weight:700; text-decoration:none; padding:12px 24px; border-radius:8px;">Verify Email Address</a>
     </p>
     <p style="font-size:12px; color:#9bb0b5;">Or copy this link into your browser (expires in 30 minutes):<br/>${escapeHtml(verifyUrl)}</p>`
  );

  await sendEmailMessage({
    to: params.to,
    subject,
    html,
    text,
    previewUrl: verifyUrl,
  });
}

export async function sendPasswordResetEmail(params: {
  to: string;
  name: string;
  rawToken: string;
  portal: "admin" | "customer";
}): Promise<void> {
  const path =
    params.portal === "admin" ? "/admin/reset-password" : "/reset-password";
  const resetUrl = `${getSiteOrigin()}${path}?token=${encodeURIComponent(
    params.rawToken
  )}`;
  const subject =
    params.portal === "admin"
      ? "Admin Password Reset Request — BROTHERS Holidays"
      : "Reset your password — BROTHERS Holidays Adventure";
  const text = `Hello ${params.name},\n\nUse this single-use link to set a new passphrase (expires in 30 minutes):\n${resetUrl}\n\nAll active sessions will be signed out after your passphrase changes.`;
  const html = wrapEmailHtml(
    "Password Reset Request",
    `<p>Hello ${escapeHtml(params.name)},</p>
     <p>A password reset was requested for your account. Use the button below to choose a new passphrase (minimum 12 characters). All active sessions will be signed out automatically once changed.</p>
     <p style="margin:24px 0;">
       <a href="${resetUrl}" style="display:inline-block; background:#d99f38; color:#071317; font-weight:700; text-decoration:none; padding:12px 24px; border-radius:8px;">Reset Passphrase</a>
     </p>
     <p style="font-size:12px; color:#9bb0b5;">Expires in 30 minutes. Link:<br/>${escapeHtml(resetUrl)}</p>`
  );

  await sendEmailMessage({
    to: params.to,
    subject,
    html,
    text,
    previewUrl: resetUrl,
  });
}

export async function sendSecurityAlertEmail(params: {
  to: string;
  name: string;
  eventTitle: string;
  details: string;
}): Promise<void> {
  const subject = `Security Alert: ${params.eventTitle} — BROTHERS Holidays`;
  const text = `Hello ${params.name},\n\nSecurity notification: ${params.eventTitle}\n${params.details}\n\nIf this wasn't you, reset your passphrase and log out of all devices immediately.`;
  const html = wrapEmailHtml(
    escapeHtml(params.eventTitle),
    `<p>Hello ${escapeHtml(params.name)},</p>
     <p>${escapeHtml(params.details)}</p>
     <p style="margin-top:18px; color:#f3c87c;">If you did not perform this action, change your passphrase and revoke all active sessions immediately.</p>`
  );

  await sendEmailMessage({
    to: params.to,
    subject,
    html,
    text,
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
