import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, ROLE_VALUES } from '../constants/index.js';

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    userAgent: String,
    ip: String,
    revokedAt: Date,
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: { type: String, trim: true },
    password: {
      type: String,
      minlength: 6,
      select: false,
      // Required only when this user authenticates with email/password.
      required: function requiredIfLocal() {
        return this.provider === 'local';
      },
    },
    provider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local',
      index: true,
    },
    // Google's stable account identifier (the OAuth `sub` claim).
    // Omit for local-only users — do NOT default to null or unique index rejects many rows.
    // Uniqueness is enforced via partial index below (string googleId only).
    googleId: { type: String },
    role: {
      type: String,
      enum: ROLE_VALUES,
      default: ROLES.CUSTOMER,
      index: true,
    },
    avatar: { url: String, publicId: String },
    isBlocked: { type: Boolean, default: false, index: true },
    isEmailVerified: { type: Boolean, default: false },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: { type: [Number], index: '2dsphere' }, // [lng, lat]
    },
    refreshTokens: { type: [refreshTokenSchema], default: [], select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    lastLoginAt: Date,
    lastLoginIp: { type: String, default: null },
    lastLoginUserAgent: { type: String, default: null },
    notificationPrefs: {
      orderEmails: { type: Boolean, default: true },
      promoEmails: { type: Boolean, default: true },
      chatEmails: { type: Boolean, default: true },
      systemEmails: { type: Boolean, default: true },
      vendorEmails: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

userSchema.index({ googleId: 1 }, { unique: true, partialFilterExpression: { googleId: { $type: 'string' } } });

userSchema.pre('save', async function preSave(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = function comparePassword(plain) {
  if (!this.password) return false;
  return bcrypt.compare(plain, this.password);
};

userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject({ virtuals: true });
  delete obj.password;
  delete obj.refreshTokens;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpires;
  delete obj.__v;
  return obj;
};

export const User = mongoose.model('User', userSchema);
