import crypto from 'crypto';
import { Otp, OTP_PURPOSE } from '../models/Otp.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

const PURPOSE_LABEL = {
  [OTP_PURPOSE.FORGOT_PASSWORD]: 'reset your password',
  [OTP_PURPOSE.CHANGE_PASSWORD]: 'confirm a password change',
  [OTP_PURPOSE.VERIFY_EMAIL]: 'verify your email',
};

const generateNumericCode = (length = env.otp.length) => {
  const max = 10 ** length;
  const n = crypto.randomInt(0, max);
  return String(n).padStart(length, '0');
};

const hashCode = (code) => crypto.createHash('sha256').update(code).digest('hex');

/**
 * Create a new OTP for {email, purpose}, invalidating any previous ones.
 * Returns { code, otp } — the raw code is meant to be emailed once and never stored.
 */
export const issueOtp = async ({ email, userId, purpose, ip, userAgent }) => {
  if (!Object.values(OTP_PURPOSE).includes(purpose)) {
    throw ApiError.badRequest('Unknown OTP purpose');
  }

  await Otp.deleteMany({ email, purpose, consumedAt: null });

  const code = generateNumericCode();
  const otp = await Otp.create({
    email,
    user: userId || null,
    purpose,
    codeHash: hashCode(code),
    expiresAt: new Date(Date.now() + env.otp.ttlMinutes * 60_000),
    ip,
    userAgent,
  });

  return { code, otp, label: PURPOSE_LABEL[purpose] };
};

/**
 * Verify a code without consuming it. Returns the OTP doc when valid.
 * Increments attempts on every wrong submission and locks the doc when max
 * attempts is reached.
 */
export const checkOtp = async ({ email, purpose, code }) => {
  const otp = await Otp.findOne({ email, purpose, consumedAt: null }).sort({ createdAt: -1 });
  if (!otp) throw ApiError.badRequest('No active code — please request a new one');
  if (otp.expiresAt < new Date()) throw ApiError.badRequest('Code expired — request a new one');
  if (otp.attempts >= env.otp.maxAttempts) {
    throw ApiError.badRequest('Too many attempts — request a new code');
  }

  if (otp.codeHash !== hashCode(String(code).trim())) {
    otp.attempts += 1;
    await otp.save();
    throw ApiError.badRequest('Invalid code');
  }
  return otp;
};

/**
 * Verify and consume an OTP. Returns the matched OTP doc.
 */
export const consumeOtp = async (params) => {
  const otp = await checkOtp(params);
  otp.consumedAt = new Date();
  await otp.save();
  return otp;
};

/**
 * Verify a code and mint a short-lived single-use token a client can submit
 * later (e.g. with a new password). Used so we don't have to keep the code
 * in browser memory while the user types a new password.
 */
export const verifyAndIssueToken = async ({ email, purpose, code }) => {
  const otp = await checkOtp({ email, purpose, code });
  const token = crypto.randomBytes(32).toString('hex');
  otp.issuedToken = crypto.createHash('sha256').update(token).digest('hex');
  otp.issuedTokenExpiresAt = new Date(Date.now() + 15 * 60_000);
  otp.consumedAt = new Date();
  await otp.save();
  return token;
};

export const consumeIssuedToken = async ({ email, purpose, token }) => {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const otp = await Otp.findOne({
    email,
    purpose,
    issuedToken: tokenHash,
    issuedTokenExpiresAt: { $gt: new Date() },
  });
  if (!otp) throw ApiError.badRequest('Verification expired — please verify the code again');
  otp.issuedToken = null;
  otp.issuedTokenExpiresAt = null;
  await otp.save();
  return otp;
};
