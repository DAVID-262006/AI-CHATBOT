import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  // ✅ OpenRouter API key (correct one)
  openrouterApiKey: process.env.OPENROUTER_API_KEY,

  databaseUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',

  // Allow all for now (fix CORS issue in production)
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

// ✅ Validate required env variables
if (!config.openrouterApiKey) {
  throw new Error('OPENROUTER_API_KEY is not set in .env file');
}
