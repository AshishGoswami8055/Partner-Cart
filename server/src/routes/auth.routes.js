import { Router } from 'express';
import passport from 'passport';
import * as ctrl from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { isGoogleOAuthConfigured } from '../config/passport.js';
import { env } from '../config/env.js';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  verifyOtpSchema,
  resetPasswordSchema,
  updatePasswordSchema,
} from '../validations/auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), ctrl.register);
router.post('/login', authLimiter, validate(loginSchema), ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', authenticate, ctrl.logout);
router.get('/me', authenticate, ctrl.me);

// Forgot-password OTP flow
router.post('/forgot-password', authLimiter, validate(forgotPasswordSchema), ctrl.sendForgotOtp);
router.post('/verify-forgot-otp', authLimiter, validate(verifyOtpSchema), ctrl.verifyForgotOtp);
router.post('/reset-password', authLimiter, validate(resetPasswordSchema), ctrl.resetPassword);

// Change-password OTP flow (authenticated)
router.post('/change-password/send-otp', authenticate, ctrl.sendChangePasswordOtp);
router.patch('/update-password', authenticate, validate(updatePasswordSchema), ctrl.updatePassword);

// ── Google OAuth ─────────────────────────────────────────────────────────────
// `/auth/google` kicks off the consent screen.
// `/auth/google/callback` is hit by Google after the user accepts.
// Both are guarded with a friendly 503 when the strategy isn't configured.
const googleGuard = (req, res, next) => {
  if (!isGoogleOAuthConfigured()) {
    return res.redirect(`${env.oauth.failureRedirect}&reason=not_configured`);
  }
  next();
};

router.get(
  '/google',
  googleGuard,
  passport.authenticate('google', { session: false, scope: ['profile', 'email'] })
);

router.get(
  '/google/callback',
  googleGuard,
  passport.authenticate('google', {
    session: false,
    failureRedirect: env.oauth.failureRedirect,
  }),
  ctrl.googleCallback
);

export default router;
