import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { logger } from '../config/logger.js';

const REFRESH_COOKIE = 'pc_rt';

const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: env.cookie.secure || env.isProd,
  sameSite: env.isProd ? 'none' : 'lax',
  domain: env.cookie.domain,
  path: '/api/v1/auth',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const setRefreshCookie = (res, token) =>
  res.cookie(REFRESH_COOKIE, token, refreshCookieOptions());

const clearRefreshCookie = (res) =>
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions(), maxAge: 0 });

const requestCtx = (req) => ({ userAgent: req.get('user-agent'), ip: req.ip });

export const register = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body, requestCtx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.created(res, { user, accessToken }, 'Account created');
});

export const login = asyncHandler(async (req, res) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body, requestCtx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.ok(res, { user, accessToken }, 'Logged in');
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE] || req.body?.refreshToken;
  const { user, accessToken, refreshToken } = await authService.refresh(token, requestCtx(req));
  setRefreshCookie(res, refreshToken);
  return ApiResponse.ok(res, { user, accessToken }, 'Token refreshed');
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.[REFRESH_COOKIE];
  if (req.user && token) await authService.logout(req.user.id, token);
  clearRefreshCookie(res);
  return ApiResponse.ok(res, null, 'Logged out');
});

export const me = asyncHandler(async (req, res) => {
  if (!req.user) throw ApiError.unauthorized();
  const user = await User.findById(req.user.id).populate('vendor');
  return ApiResponse.ok(res, { user });
});

// ── Forgot password (OTP) ───────────────────────────────────────────────────
export const sendForgotOtp = asyncHandler(async (req, res) => {
  const code = await authService.sendForgotPasswordOtp(req.body.email, requestCtx(req));
  if (code && !env.isProd) {
    logger.info(`[dev] Forgot-password OTP for ${req.body.email}: ${code}`);
  }
  return ApiResponse.ok(res, null, "If that email exists, we've sent a verification code");
});

export const verifyForgotOtp = asyncHandler(async (req, res) => {
  const token = await authService.verifyForgotPasswordOtp(req.body.email, req.body.code);
  return ApiResponse.ok(res, { token }, 'Code verified — set a new password');
});

export const resetPassword = asyncHandler(async (req, res) => {
  await authService.resetPasswordWithToken(
    req.body.email,
    req.body.token,
    req.body.password,
    requestCtx(req)
  );
  return ApiResponse.ok(res, null, 'Password reset successful — please login');
});

// ── Change password (authenticated, OTP) ────────────────────────────────────
export const sendChangePasswordOtp = asyncHandler(async (req, res) => {
  const email = await authService.sendChangePasswordOtp(req.user.id, requestCtx(req));
  if (!env.isProd) logger.info(`[dev] Change-password OTP sent to ${email}`);
  return ApiResponse.ok(res, { email }, "We've sent a verification code to your email");
});

export const updatePassword = asyncHandler(async (req, res) => {
  await authService.changePasswordWithOtp(req.user.id, req.body, requestCtx(req));
  clearRefreshCookie(res);
  return ApiResponse.ok(res, null, 'Password updated — please login again');
});

// Called by passport-google-oauth20 after a successful round-trip. The user
// is on req.user, courtesy of `passport.authenticate(... session: false)`.
// We mint our own JWT tokens, set the refresh cookie, and bounce the browser
// back to the SPA which finishes the handshake.
export const googleCallback = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.redirect(env.oauth.failureRedirect);
  }
  const { accessToken, refreshToken } = await authService.issueTokensForUser(
    req.user._id,
    requestCtx(req)
  );
  setRefreshCookie(res, refreshToken);
  const url = new URL(env.oauth.successRedirect);
  url.searchParams.set('token', accessToken);
  return res.redirect(url.toString());
});
