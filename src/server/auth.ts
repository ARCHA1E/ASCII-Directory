import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

interface TokenPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

// Simple in-memory rate limiter for login attempts
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function verifyAdminPassword(password: string): boolean {
  if (!password || typeof password !== 'string') return false;
  return password.trim() === config.adminPassword.trim();
}

export function generateSessionToken(): string {
  return jwt.sign({ role: 'admin' }, config.jwtSecret, { expiresIn: '7d' });
}

export function verifySessionToken(token: string): boolean {
  try {
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    return payload && payload.role === 'admin';
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
  const record = failedAttempts.get(ip) || { count: 0, lastAttempt: now };
  record.count += 1;
  record.lastAttempt = now;
  failedAttempts.set(ip, record);
}

export function recordSuccessfulLogin(ip: string): void {
  failedAttempts.delete(ip);
}

export function extractToken(req: Request): string | null {
  // 1. Check HTTP-only cookie
  if (req.cookies && req.cookies[config.sessionCookieName]) {
    return req.cookies[config.sessionCookieName];
  }
  // 2. Check Authorization Header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const token = extractToken(req);
  if (!token || !verifySessionToken(token)) {
    res.status(401).json({ error: 'UNAUTHORIZED: Access denied. Valid session required.' });
    return;
  }
  next();
}
