import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';

import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimit.js';
import { notFound, errorHandler } from './middleware/error.js';
import routes from './routes/index.js';
import { initPassport } from './config/passport.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', 1);

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
      contentSecurityPolicy: false,
    })
  );
  app.use(
    cors({
      origin: env.clientOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(compression());
  app.use(mongoSanitize());

  // Passport runs in stateless mode — no express-session required, since we
  // mint our own JWT access + refresh tokens after the OAuth callback.
  const passport = initPassport();
  app.use(passport.initialize());

  if (!env.isProd) app.use(morgan('dev'));

  app.use('/api/v1', generalLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};
