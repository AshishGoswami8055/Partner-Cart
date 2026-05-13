import mongoose from 'mongoose';

export const OTP_PURPOSE = Object.freeze({
  FORGOT_PASSWORD: 'forgot_password',
  CHANGE_PASSWORD: 'change_password',
  VERIFY_EMAIL: 'verify_email',
});

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    purpose: {
      type: String,
      enum: Object.values(OTP_PURPOSE),
      required: true,
      index: true,
    },
    codeHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
    consumedAt: { type: Date, default: null },
    issuedToken: { type: String, default: null, index: true },
    issuedTokenExpiresAt: { type: Date, default: null },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model('Otp', otpSchema);
