import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/token.js';
import { User } from '../models/User.js';

export const authenticate = async (req, _res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) throw ApiError.unauthorized('Missing access token');

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.isBlocked) throw ApiError.forbidden('Account blocked');

    req.user = {
      id: String(user._id),
      role: user.role,
      vendorId: user.vendor ? String(user.vendor) : null,
      email: user.email,
      name: user.name,
    };
    next();
  } catch (err) {
    if (err?.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token expired'));
    }
    if (err?.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Invalid access token'));
    }
    next(err);
  }
};

export const optionalAuth = async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).lean();
    if (user && !user.isBlocked) {
      req.user = {
        id: String(user._id),
        role: user.role,
        vendorId: user.vendor ? String(user.vendor) : null,
        email: user.email,
        name: user.name,
      };
    }
  } catch {
    /* swallow */
  }
  next();
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.includes(req.user.role)) return next(ApiError.forbidden('Insufficient role'));
  next();
};
