import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from './config.js';

interface TokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

// In-memory rate limiter with automatic pruning
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_FAILED_MAP_SIZE = 10000;

// Periodic cleanup every 10 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of failedAttempts.entries()) {
    if (now - record.lastAttempt > 10 * 60 * 1000) {
      failedAttempts.delete(ip);
    }
  }
}, 10 * 60 * 1000).unref();

export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;

  const suppliedBuf = Buffer.from(password.trim(), 'utf-8');
  const expectedBuf = Buffer.from(config.adminPassword.trim(), 'utf-8');

  // Prevent timing leaks by using constant-time comparison
  if (suppliedBuf.length !== expectedBuf.length) {
    // Perform dummy timing-safe comparison against itself
    crypto.timingSafeEqual(suppliedBuf, suppliedBuf);
    return false;
  }

  return crypto.timingSafeEqual(suppliedBuf, expectedBuf);
}

export function generateSessionToken(): string {
  return jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return !!(payload && payload.role === 'admin');
  } catch {
    return false;
  }
}

export function checkLoginRateLimit(ip: string): { allowed: boolean; remainingWaitSec?: number } {
  const now = Date.now();
  const record = failedAttempts.get(ip);
  if (!record) return { allowed: true };

  // Reset after 5 minutes
  if (now - record.lastAttempt > 5 * 60 * 1000) {
    failedAttempts.delete(ip);
    return { allowed: true };
  }

  if (record.count >= 10) {
    const remainingWaitSec = Math.ceil((record.lastAttempt + 5 * 60 * 1000 - now) / 1000);
    return { allowed: false, remainingWaitSec };
  }

  return { allowed: true };
}

export function recordFailedLogin(ip: string): void {
  const now = Date.now();
  if (failedAttempts.size >= MAX_FAILED_MAP_SIZE) {
    const oldestKey = failedAttempts.keys().next().value;
    if (oldestKey) failedAttempts.delete(oldestKey);
  }
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip: string): void {
  failedAttempts.delete(ip);
}

export function extractToken(req: Request): string | null {
  if (req.cookies && req.cookies[config.sessionCookieName]) {
    return req.cookies[config.sessionCookieName];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token || !verifySessionToken(token)) {
    res.status(401).json({ error: 'UNAUTHORIZED: Access denied. Valid admin session required.' });
    return;
  }
  next();
}
