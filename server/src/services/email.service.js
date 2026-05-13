import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

/**
 * Mailer with two transports:
 *  1. Real SMTP transport when MAIL_HOST + MAIL_USER + MAIL_PASS are configured.
 *  2. JSON / console transport in dev, so flows still work without credentials.
 *
 * Falls back gracefully if SMTP fails so a misconfigured mailer never breaks
 * authentication or signup.
 */
let transporter = null;
let mode = 'console';

const buildTransporter = () => {
  const { host, port, user, pass, secure } = env.mail;
  if (host && user && pass) {
    mode = 'smtp';
    return nodemailer.createTransport({
      host,
      port: Number(port) || 587,
      secure: secure ?? Number(port) === 465,
      auth: { user, pass },
    });
  }
  mode = 'console';
  return nodemailer.createTransport({ jsonTransport: true });
};

export const getTransporter = () => {
  if (!transporter) transporter = buildTransporter();
  return transporter;
};

const wrap = (title, body) => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:'Inter','Helvetica Neue',Arial,sans-serif;color:#0f0f0f;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
            <tr>
              <td style="background:#0f0f0f;color:#ffffff;padding:24px 32px;">
                <div style="font-size:20px;font-weight:700;letter-spacing:-0.01em;">PartnerCart</div>
                <div style="font-size:12px;color:#ffffffaa;letter-spacing:0.18em;text-transform:uppercase;margin-top:4px;">Local marketplace · Premium</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">${body}</td>
            </tr>
            <tr>
              <td style="background:#fafafa;padding:20px 32px;color:#666;font-size:12px;line-height:1.6;border-top:1px solid #eee;">
                You received this email because of activity on your PartnerCart account.<br />
                If this wasn't you, please reset your password immediately.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const tplOtp = ({ code, purpose, minutes }) =>
  wrap(
    `Your PartnerCart code`,
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">Verification code</h1>
    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.55;">
      Use this one-time code to ${purpose}. The code expires in ${minutes} minutes.
    </p>
    <div style="margin:24px 0;padding:18px 20px;background:#0f0f0f;color:#ffffff;border-radius:12px;font-family:'JetBrains Mono','SFMono-Regular',Consolas,monospace;font-size:30px;font-weight:700;letter-spacing:8px;text-align:center;">
      ${code}
    </div>
    <p style="margin:0;color:#666;font-size:13px;line-height:1.55;">
      Never share this code with anyone. PartnerCart will never ask for it.
    </p>`
  );

const tplLoginAlert = ({ name, ip, userAgent, time }) =>
  wrap(
    `New sign-in to your account`,
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">New sign-in detected</h1>
    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.55;">
      Hi ${name || 'there'}, your PartnerCart account was just signed into.
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px 0;color:#666;font-size:13px;">When</td><td style="padding:8px 0;text-align:right;font-size:13px;">${time}</td></tr>
      <tr><td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #eee;">IP address</td><td style="padding:8px 0;text-align:right;font-size:13px;border-top:1px solid #eee;">${ip || 'unknown'}</td></tr>
      <tr><td style="padding:8px 0;color:#666;font-size:13px;border-top:1px solid #eee;">Device</td><td style="padding:8px 0;text-align:right;font-size:13px;border-top:1px solid #eee;">${(userAgent || 'unknown').slice(0, 80)}</td></tr>
    </table>
    <p style="margin:0;color:#666;font-size:13px;line-height:1.55;">
      If this was you, no action is needed. If not, reset your password and contact support.
    </p>`
  );

const tplPasswordChanged = ({ name, time, ip }) =>
  wrap(
    `Your password was changed`,
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">Password updated</h1>
    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.55;">
      Hi ${name || 'there'}, your PartnerCart password was just changed at ${time} from ${ip || 'an unknown IP'}.
      All other sessions have been signed out automatically for your safety.
    </p>
    <p style="margin:0;color:#666;font-size:13px;line-height:1.55;">
      Didn't make this change? Reset your password right away and review your account activity.
    </p>`
  );

const tplWelcome = ({ name }) =>
  wrap(
    `Welcome to PartnerCart`,
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">Welcome, ${name || 'friend'}!</h1>
    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.55;">
      Your PartnerCart account is live. Discover local stores, support independent vendors,
      and enjoy fast, multi-vendor checkout in one place.
    </p>
    <p style="margin:0;color:#666;font-size:13px;line-height:1.55;">
      Tip: complete your profile and pin your delivery location for the best recommendations.
    </p>`
  );

const tplGenericNotification = ({ title, body, link }) =>
  wrap(
    title,
    `
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:600;">${title}</h1>
    <p style="margin:0 0 18px;color:#444;font-size:14px;line-height:1.6;">${body || ''}</p>
    ${
      link
        ? `<a href="${link}" style="display:inline-block;background:#0f0f0f;color:#ffffff;padding:10px 18px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:500;">Open PartnerCart</a>`
        : ''
    }
    `
  );

export const send = async ({ to, subject, html, text }) => {
  if (!to) return null;
  try {
    const tx = getTransporter();
    const info = await tx.sendMail({
      from: env.mail.from,
      to,
      subject,
      html,
      text: text || subject,
    });
    if (mode === 'console') {
      logger.info(`[mail:console] to=${to} subject="${subject}"`);
    } else {
      logger.info(`[mail:smtp] sent to=${to} id=${info.messageId}`);
    }
    return info;
  } catch (err) {
    logger.error(`[mail] failed: ${err.message}`);
    return null;
  }
};

export const sendOtpEmail = (to, { code, purpose, minutes = 10 }) =>
  send({
    to,
    subject: `Your PartnerCart code: ${code}`,
    html: tplOtp({ code, purpose, minutes }),
    text: `Your PartnerCart verification code is ${code}. It expires in ${minutes} minutes.`,
  });

export const sendLoginAlertEmail = (to, payload) =>
  send({
    to,
    subject: `New sign-in to your PartnerCart account`,
    html: tplLoginAlert(payload),
  });

export const sendPasswordChangedEmail = (to, payload) =>
  send({
    to,
    subject: `Your PartnerCart password was changed`,
    html: tplPasswordChanged(payload),
  });

export const sendWelcomeEmail = (to, payload) =>
  send({
    to,
    subject: `Welcome to PartnerCart`,
    html: tplWelcome(payload),
  });

export const sendNotificationEmail = (to, payload) =>
  send({
    to,
    subject: payload.title || 'Update from PartnerCart',
    html: tplGenericNotification(payload),
  });

export const mailerMode = () => mode;
