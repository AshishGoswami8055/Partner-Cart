import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

mongoose.set('strictQuery', true);

export const connectDb = async () => {
  try {
    await mongoose.connect(env.mongoUri, {
      autoIndex: !env.isProd,
    });
    logger.info(`MongoDB connected: ${mongoose.connection.host}`);
  } catch (err) {
    logger.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  try {
    const { User } = await import('../models/User.js');
    try {
      await User.collection.dropIndex('googleId_1');
    } catch (dropErr) {
      const msg = dropErr?.message ?? String(dropErr);
      const benign =
        dropErr?.codeName === 'IndexNotFound' ||
        /index not found|ns not found/i.test(msg);
      if (!benign) logger.warn(`users googleId_1 index drop skipped: ${msg}`);
    }
    await User.syncIndexes();
  } catch (idxErr) {
    logger.warn(`User.syncIndexes: ${idxErr.message}`);
  }
};
