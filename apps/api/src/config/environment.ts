import dotenv from 'dotenv';

dotenv.config();

export const environment = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://visitour:password@localhost:5432/visitour',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    expiry: process.env.JWT_EXPIRY || '7d',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(','),
  },
  ws: {
    url: process.env.WS_URL || 'http://localhost:3000',
  },
  isDevelopment: process.env.NODE_ENV !== 'production',
  isProduction: process.env.NODE_ENV === 'production',
};

