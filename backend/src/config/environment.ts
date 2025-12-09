import dotenv from 'dotenv';

dotenv.config();

interface Config {
  port: number;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string;
  databaseUrl: string;
  jwtSecret: string;
  jwtExpiresIn: string;
}

/**
 * Validates and returns environment configuration
 * Throws error if required environment variables are missing
 */
function validateConfig(): Config {
  const requiredEnvVars = {
    DATABASE_URL: process.env.DATABASE_URL,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}`
    );
  }

  const nodeEnv = (process.env.NODE_ENV || 'development') as Config['nodeEnv'];
  if (!['development', 'production', 'test'].includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}. Must be development, production, or test`);
  }

  return {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv,
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    databaseUrl: process.env.DATABASE_URL!,
    jwtSecret: process.env.JWT_SECRET!,
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  };
}

export const config = validateConfig();
