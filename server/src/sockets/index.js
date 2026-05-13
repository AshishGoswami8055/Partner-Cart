import { Server } from 'socket.io';
import { verifyAccessToken } from '../utils/token.js';
import { User } from '../models/User.js';
import { setIo } from './emit.js';
import { logger } from '../config/logger.js';
import { Conversation } from '../models/Conversation.js';
import { ROLES } from '../constants/index.js';
import { env } from '../config/env.js';

export const initSockets = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.clientOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    },
  });
  setIo(io);

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) return next(new Error('Unauthorized'));
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.sub).lean();
      if (!user || user.isBlocked) return next(new Error('Unauthorized'));
      socket.user = {
        id: String(user._id),
        role: user.role,
        vendorId: user.vendor ? String(user.vendor) : null,
      };
      next();
    } catch {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { id: userId, role, vendorId } = socket.user;
    socket.join(`user:${userId}`);
    if (role === ROLES.VENDOR && vendorId) socket.join(`vendor:${vendorId}`);
    if (role === ROLES.ADMIN) socket.join('admin');

    logger.debug(`Socket connected: ${userId} (${role})`);

    socket.on('chat:join', async ({ conversationId }) => {
      const conversation = await Conversation.findById(conversationId).lean();
      if (!conversation) return;
      const allowed =
        (role === ROLES.CUSTOMER && String(conversation.customer) === userId) ||
        (role === ROLES.VENDOR && String(conversation.vendor) === vendorId) ||
        role === ROLES.ADMIN;
      if (!allowed) return;
      socket.join(`conversation:${conversationId}`);
    });

    socket.on('chat:leave', ({ conversationId }) => {
      socket.leave(`conversation:${conversationId}`);
    });

    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        userId,
        isTyping: !!isTyping,
      });
    });

    socket.on('disconnect', () => {
      logger.debug(`Socket disconnected: ${userId}`);
    });
  });

  return io;
};
