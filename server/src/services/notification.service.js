import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { parsePagination, buildMeta } from '../utils/pagination.js';
import { sendNotificationEmail } from './email.service.js';
import { emitToUser } from '../sockets/emit.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

const PREF_KEY_BY_TYPE = {
  order: 'orderEmails',
  promo: 'promoEmails',
  chat: 'chatEmails',
  vendor: 'vendorEmails',
  system: 'systemEmails',
};

/**
 * Single source-of-truth for delivering a notification:
 *   1. Persists it.
 *   2. Pushes it to the user via socket.io (real-time bell).
 *   3. Emails the user if their notification preferences allow it.
 *
 * Existing call-sites that already use Notification.create directly keep
 * working — but new code should go through createAndDeliver().
 */
export const createAndDeliver = async ({ user, type, title, body, link, data, email = true }) => {
  if (!user) return null;
  const notification = await Notification.create({ user, type, title, body, link, data });

  emitToUser(String(user), 'notification:new', notification);

  if (email) {
    try {
      const userDoc = await User.findById(user).select('email name notificationPrefs').lean();
      const prefKey = PREF_KEY_BY_TYPE[type] || 'systemEmails';
      const allowed = userDoc?.notificationPrefs?.[prefKey] !== false;
      if (userDoc?.email && allowed) {
        const linkAbs = link
          ? link.startsWith('http')
            ? link
            : `${env.clientOrigin.split(',')[0].trim()}${link}`
          : null;
        await sendNotificationEmail(userDoc.email, {
          title,
          body,
          link: linkAbs,
        });
      }
    } catch (err) {
      logger.error(`[notification email] ${err.message}`);
    }
  }

  return notification;
};

export const list = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query);
  const filter = { user: userId };
  if (query.unread === 'true') filter.isRead = false;
  const [items, total, unread] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ user: userId, isRead: false }),
  ]);
  return { items, meta: buildMeta({ page, limit }, total), unread };
};

export const markRead = async (userId, id) =>
  Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

export const markAllRead = async (userId) => {
  await Notification.updateMany(
    { user: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};
