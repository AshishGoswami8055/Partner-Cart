import { User } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashRefreshToken,
  randomToken,
} from '../utils/token.js';
import { env } from '../config/env.js';
import { ROLES } from '../constants/index.js';
import { OTP_PURPOSE } from '../models/Otp.js';
import * as otpService from './otp.service.js';
import {
  sendOtpEmail,
  sendLoginAlertEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from './email.service.js';

const refreshExpiryMs = () => {
  const m = env.jwt.refreshExpires.match(/^(\d+)([smhd])$/);
  if (!m) return 30 * 24 * 60 * 60 * 1000;
  const n = Number(m[1]);
  return n * { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[m[2]];
};

const formatDate = (d = new Date()) =>
  d.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' });

const issueTokens = async (user, { userAgent, ip } = {}) => {
  const payload = { sub: String(user._id), role: user.role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ ...payload, jti: randomToken(16) });

  user.refreshTokens.push({
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshExpiryMs()),
    userAgent,
    ip,
  });
  user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > new Date() && !t.revokedAt);
  user.lastLoginAt = new Date();
  user.lastLoginIp = ip;
  user.lastLoginUserAgent = userAgent;
  await user.save();

  return { accessToken, refreshToken };
};

const fireLoginAlert = (user, { ip, userAgent } = {}) => {
  if (!env.mail.notifyFromAlerts) return;
  if (!user?.email) return;
  // Fire and forget — never block the login response on email delivery.
  sendLoginAlertEmail(user.email, {
    name: user.name,
    ip,
    userAgent,
    time: formatDate(),
  }).catch(() => {});
};

// Same flow as login(), but for users authenticated by an external provider
// (e.g. Google). We never see their password, so we just mint our own tokens.
export const issueTokensForUser = async (userId, ctx = {}) => {
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) throw ApiError.notFound('User');
  if (user.isBlocked) throw ApiError.forbidden('Account blocked');
  const tokens = await issueTokens(user, ctx);
  fireLoginAlert(user, ctx);
  return { user, ...tokens };
};

export const register = async (data, ctx = {}) => {
  const exists = await User.findOne({ email: data.email });
  if (exists) throw ApiError.conflict('Email already registered');

  const user = await User.create({
    name: data.name,
    email: data.email,
    password: data.password,
    phone: data.phone,
    role: ROLES.CUSTOMER,
  });

  const fresh = await User.findById(user._id).select('+refreshTokens +password');
  const tokens = await issueTokens(fresh, ctx);

  sendWelcomeEmail(user.email, { name: user.name }).catch(() => {});
  fireLoginAlert(user, ctx);

  return { user, ...tokens };
};

export const login = async ({ email, password }, ctx = {}) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.isBlocked) throw ApiError.forbidden('Account blocked');
  const ok = await user.comparePassword(password);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  const tokens = await issueTokens(user, ctx);
  fireLoginAlert(user, ctx);
  return { user, ...tokens };
};

export const refresh = async (refreshToken, ctx = {}) => {
  if (!refreshToken) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const user = await User.findById(payload.sub).select('+refreshTokens +password');
  if (!user || user.isBlocked) throw ApiError.unauthorized('User unavailable');

  const tokenHash = hashRefreshToken(refreshToken);
  const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash);

  if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
    user.refreshTokens = [];
    await user.save();
    throw ApiError.unauthorized('Refresh token reuse detected — sessions revoked');
  }

  stored.revokedAt = new Date();
  const tokens = await issueTokens(user, ctx);
  return { user, ...tokens };
};

export const logout = async (userId, refreshToken) => {
  if (!refreshToken) return;
  const user = await User.findById(userId).select('+refreshTokens');
  if (!user) return;
  const tokenHash = hashRefreshToken(refreshToken);
  const stored = user.refreshTokens.find((t) => t.tokenHash === tokenHash);
  if (stored) {
    stored.revokedAt = new Date();
    await user.save();
  }
};

// ── OTP-driven forgot / change password flows ───────────────────────────────

/**
 * Public endpoint — never reveal whether the email exists. We always tell the
 * caller "if the email is on file we sent a code". When it does exist we
 * actually issue + email an OTP.
 */
export const sendForgotPasswordOtp = async (email, ctx = {}) => {
  const user = await User.findOne({ email });
  if (!user) return null;
  if (user.isBlocked) return null;

  const { code } = await otpService.issueOtp({
    email: user.email,
    userId: user._id,
    purpose: OTP_PURPOSE.FORGOT_PASSWORD,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  await sendOtpEmail(user.email, {
    code,
    purpose: 'reset your password',
    minutes: env.otp.ttlMinutes,
  });
  return code;
};

export const verifyForgotPasswordOtp = async (email, code) => {
  const user = await User.findOne({ email });
  if (!user) throw ApiError.badRequest('Invalid code');
  const token = await otpService.verifyAndIssueToken({
    email: user.email,
    purpose: OTP_PURPOSE.FORGOT_PASSWORD,
    code,
  });
  return token;
};

export const resetPasswordWithToken = async (email, token, password, ctx = {}) => {
  const user = await User.findOne({ email }).select('+password +refreshTokens');
  if (!user) throw ApiError.badRequest('Invalid request');
  await otpService.consumeIssuedToken({
    email: user.email,
    purpose: OTP_PURPOSE.FORGOT_PASSWORD,
    token,
  });
  user.password = password;
  user.refreshTokens = [];
  await user.save();

  sendPasswordChangedEmail(user.email, {
    name: user.name,
    time: formatDate(),
    ip: ctx.ip,
  }).catch(() => {});
  return user;
};

/**
 * Authenticated user requests an OTP delivered to their email so they can
 * confirm a password change. Doesn't change the password yet.
 */
export const sendChangePasswordOtp = async (userId, ctx = {}) => {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound('User');

  const { code } = await otpService.issueOtp({
    email: user.email,
    userId: user._id,
    purpose: OTP_PURPOSE.CHANGE_PASSWORD,
    ip: ctx.ip,
    userAgent: ctx.userAgent,
  });

  await sendOtpEmail(user.email, {
    code,
    purpose: 'confirm a password change',
    minutes: env.otp.ttlMinutes,
  });
  return user.email;
};

/**
 * Authenticated change password. Requires both the current password AND a
 * valid OTP that we just emailed. All other refresh tokens are revoked.
 */
export const changePasswordWithOtp = async (userId, { currentPassword, newPassword, otp }, ctx = {}) => {
  const user = await User.findById(userId).select('+password +refreshTokens');
  if (!user) throw ApiError.notFound('User');

  if (user.provider === 'local') {
    if (!currentPassword) throw ApiError.badRequest('Current password is required');
    const ok = await user.comparePassword(currentPassword);
    if (!ok) throw ApiError.unauthorized('Current password is incorrect');
  }

  await otpService.consumeOtp({
    email: user.email,
    purpose: OTP_PURPOSE.CHANGE_PASSWORD,
    code: otp,
  });

  user.password = newPassword;
  user.refreshTokens = [];
  await user.save();

  sendPasswordChangedEmail(user.email, {
    name: user.name,
    time: formatDate(),
    ip: ctx.ip,
  }).catch(() => {});

  return user;
};
