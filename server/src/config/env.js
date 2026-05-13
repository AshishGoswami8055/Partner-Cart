import dotenv from 'dotenv';
dotenv.config();

const required = (key, fallback) => {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT || 5000),

  mongoUri: required('MONGODB_URI', 'mongodb://127.0.0.1:27017/partnercart'),

  jwt: {
    accessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN || undefined,
    secure: process.env.COOKIE_SECURE === 'true',
  },

  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackUrl:
      process.env.GOOGLE_CALLBACK_URL ||
      'http://localhost:5000/api/v1/auth/google/callback',
  },

  oauth: {
    successRedirect:
      process.env.OAUTH_SUCCESS_REDIRECT || 'http://localhost:5173/auth/callback',
    failureRedirect:
      process.env.OAUTH_FAILURE_REDIRECT ||
      'http://localhost:5173/auth/login?oauth=failed',
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
  },

  mail: {
    from: process.env.MAIL_FROM || 'PartnerCart <noreply@partnercart.io>',
    host: process.env.MAIL_HOST || '',
    port: process.env.MAIL_PORT || 587,
    user: process.env.MAIL_USER || '',
    pass: process.env.MAIL_PASS || '',
    secure: process.env.MAIL_SECURE === 'true',
    notifyFromAlerts: process.env.MAIL_NOTIFY_ON_LOGIN !== 'false',
  },

  otp: {
    length: Number(process.env.OTP_LENGTH || 6),
    ttlMinutes: Number(process.env.OTP_TTL_MINUTES || 10),
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  },
};
