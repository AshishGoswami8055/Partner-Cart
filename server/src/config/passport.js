import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { env } from './env.js';
import { logger } from './logger.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';

let googleConfigured = false;

export const isGoogleOAuthConfigured = () => googleConfigured;

export const initPassport = () => {
  // We use Passport in stateless mode (no server-side session). Strategies
  // resolve a user, then our route handler issues JWT access + refresh tokens.
  if (env.google.clientId && env.google.clientSecret) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: env.google.clientId,
          clientSecret: env.google.clientSecret,
          callbackURL: env.google.callbackUrl,
          // include both userinfo scopes — we need the verified email
          scope: ['profile', 'email'],
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const googleId = profile.id;
            const email =
              profile.emails?.find((e) => e.verified)?.value ||
              profile.emails?.[0]?.value;
            const name = profile.displayName || email?.split('@')[0] || 'User';
            const avatarUrl = profile.photos?.[0]?.value;

            if (!email) {
              return done(new Error('Google account did not return an email'));
            }

            // 1. Already linked? Use that exact user (each Google account is
            //    tied to exactly one PartnerCart user via unique googleId).
            let user = await User.findOne({ googleId });

            if (!user) {
              // 2. Existing local account with the same email? Link it.
              const existing = await User.findOne({ email: email.toLowerCase() });
              if (existing) {
                if (existing.isBlocked) {
                  return done(null, false, { message: 'Account blocked' });
                }
                existing.googleId = googleId;
                if (existing.provider === 'local' && !existing.password) {
                  existing.provider = 'google';
                }
                if (!existing.avatar?.url && avatarUrl) {
                  existing.avatar = { url: avatarUrl };
                }
                existing.isEmailVerified = true;
                await existing.save();
                user = existing;
              } else {
                // 3. Brand new user — create one. No password is set, so this
                //    account can only sign in via Google going forward.
                user = await User.create({
                  name,
                  email: email.toLowerCase(),
                  googleId,
                  provider: 'google',
                  role: ROLES.CUSTOMER,
                  isEmailVerified: true,
                  avatar: avatarUrl ? { url: avatarUrl } : undefined,
                });
              }
            } else if (user.isBlocked) {
              return done(null, false, { message: 'Account blocked' });
            }

            return done(null, user);
          } catch (err) {
            return done(err);
          }
        }
      )
    );
    googleConfigured = true;
    logger.info('Google OAuth strategy registered');
  } else {
    logger.warn('Google OAuth not configured — set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to enable');
  }

  return passport;
};
