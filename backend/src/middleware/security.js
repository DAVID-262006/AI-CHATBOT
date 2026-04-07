import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import { config } from '../config/config.js';

export const securityMiddleware = (app) => {
  app.use(helmet());

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use(limiter);
};