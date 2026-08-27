import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config();

const defaultSecret = crypto.randomBytes(32).toString('hex');

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  host: process.env.HOST || '0.0.0.0',
  nodeEnv: process.env.NODE_ENV || 'development',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123',
  jwtSecret: process.env.JWT_SECRET || defaultSecret,
  sessionCookieName: 'retro_sess',
  dataDir: process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.resolve(process.cwd(), 'data'),
  dataFile: process.env.DATA_FILE 
    ? path.resolve(process.env.DATA_FILE) 
    : path.resolve(process.env.DATA_DIR || path.resolve(process.cwd(), 'data'), 'directory.json'),
  backupDir: path.resolve(process.env.DATA_DIR || path.resolve(process.cwd(), 'data'), 'backups'),
};

if (!process.env.ADMIN_PASSWORD) {
  console.warn('\x1b[33m[SECURITY NOTICE]\x1b[0m ADMIN_PASSWORD environment variable not set. Using default: "admin123". Please configure a strong password before production deployment.');
}
