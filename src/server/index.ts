import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';
import { systemRouter } from './routes/system.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Disable X-Powered-By header to prevent fingerprinting
app.disable('x-powered-by');

// Security Headers Middleware
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com;"
  );
  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Trust proxy for Cloudflare / reverse proxy setups
app.set('trust proxy', 1);

// Mount API routes
app.use('/api', apiRouter);
app.use('/api/system', systemRouter);

// Static client assets serving
const clientDistPath = path.resolve(process.cwd(), 'dist/client');
const clientSrcPath = path.resolve(process.cwd(), 'src/client');

if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else if (fs.existsSync(clientSrcPath)) {
  app.use(express.static(clientSrcPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientSrcPath, 'index.html'));
  });
}

app.listen(config.port, config.host, () => {
  console.log(`
\x1b[32m╔════════════════════════════════════════════════════════════════════╗
║                   ASCII DIRECTORY GATEWAY v1.0                     ║
║              1980s CRT Terminal Monospace System                   ║
╠════════════════════════════════════════════════════════════════════╣
║  [+] Server running at: http://${config.host === '0.0.0.0' ? 'localhost' : config.host}:${config.port}                     ║
║  [+] Data Store:        ${config.dataFile.padEnd(42)} ║
║  [+] Mode:              ${config.nodeEnv.toUpperCase().padEnd(42)} ║
╚════════════════════════════════════════════════════════════════════╝\x1b[0m
`);
});
