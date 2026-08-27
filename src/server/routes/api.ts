import { Router, Request, Response } from 'express';
import { storage } from '../storage.js';
import { 
  verifyAdminPassword, 
  generateSessionToken, 
  extractToken, 
  verifySessionToken, 
  requireAuth,
  checkLoginRateLimit,
  recordFailedLogin,
  recordSuccessfulLogin
} from '../auth.js';
import { config } from '../config.js';

export const apiRouter = Router();

// Public: Get directory data
apiRouter.get('/directory', async (_req: Request, res: Response) => {
  try {
    const data = await storage.getData();
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve directory data', details: err.message });
  }
});

// Public: Check auth status
apiRouter.get('/auth/status', (req: Request, res: Response) => {
  const token = extractToken(req);
  const authenticated = !!(token && verifySessionToken(token));
  res.json({ authenticated });
});

// Public: Login
apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const { allowed, remainingWaitSec } = checkLoginRateLimit(clientIp);

  if (!allowed) {
    res.status(429).json({ 
      error: `RATE LIMIT EXCEEDED: Too many failed attempts. Try again in ${remainingWaitSec}s.` 
    });
    return;
  }

  const { password } = req.body;
  if (!password || typeof password !== 'string') {
    recordFailedLogin(clientIp);
    res.status(400).json({ error: 'Password required' });
    return;
  }

  if (verifyAdminPassword(password)) {
    recordSuccessfulLogin(clientIp);
    const token = generateSessionToken();
    res.cookie(config.sessionCookieName, token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    res.json({ success: true, message: 'AUTHENTICATION ACCEPTED. Welcome Admin.', token });
  } else {
    recordFailedLogin(clientIp);
    res.status(401).json({ error: 'ACCESS DENIED: Invalid credentials.' });
  }
});

// Public / Auth: Logout
apiRouter.post('/auth/logout', (_req: Request, res: Response) => {
  res.clearCookie(config.sessionCookieName);
  res.json({ success: true, message: 'SESSION TERMINATED.' });
});

// Authenticated: Add Entry
apiRouter.post('/entries', requireAuth, async (req: Request, res: Response) => {
  try {
    const { categoryId, title, url, description, target, tags } = req.body;
    if (!categoryId || !title || !url) {
      res.status(400).json({ error: 'categoryId, title, and url are required' });
      return;
    }

    const entry = await storage.addEntry(categoryId, { title, url, description, target, tags });
    if (!entry) {
      res.status(404).json({ error: 'Target category not found' });
      return;
    }

    const data = await storage.getData();
    res.status(201).json({ success: true, entry, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add entry', details: err.message });
  }
});

// Authenticated: Update Entry
apiRouter.put('/entries/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id;
    const updates = req.body;
    const entry = await storage.updateEntry(entryId, updates);
    if (!entry) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const data = await storage.getData();
    res.json({ success: true, entry, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update entry', details: err.message });
  }
});

// Authenticated: Move Entry
apiRouter.post('/entries/:id/move', requireAuth, async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id;
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be "up" or "down"' });
      return;
    }

    const data = await storage.moveEntry(entryId, direction);
    if (!data) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to move entry', details: err.message });
  }
});

// Authenticated: Delete Entry
apiRouter.delete('/entries/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const entryId = req.params.id;
    const deleted = await storage.deleteEntry(entryId);
    if (!deleted) {
      res.status(404).json({ error: 'Entry not found' });
      return;
    }

    const data = await storage.getData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete entry', details: err.message });
  }
});

// Authenticated: Add Category
apiRouter.post('/categories', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name, icon } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Category name is required' });
      return;
    }

    const category = await storage.addCategory(name, icon);
    const data = await storage.getData();
    res.status(201).json({ success: true, category, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add category', details: err.message });
  }
});

// Authenticated: Update Category
apiRouter.put('/categories/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const updates = req.body;
    const category = await storage.updateCategory(categoryId, updates);
    if (!category) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const data = await storage.getData();
    res.json({ success: true, category, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update category', details: err.message });
  }
});

// Authenticated: Move Category
apiRouter.post('/categories/:id/move', requireAuth, async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const { direction } = req.body;
    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be "up" or "down"' });
      return;
    }

    const data = await storage.moveCategory(categoryId, direction);
    if (!data) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to move category', details: err.message });
  }
});

// Authenticated: Delete Category
apiRouter.delete('/categories/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const categoryId = req.params.id;
    const deleted = await storage.deleteCategory(categoryId);
    if (!deleted) {
      res.status(404).json({ error: 'Category not found' });
      return;
    }

    const data = await storage.getData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete category', details: err.message });
  }
});

// Authenticated: Update Settings
apiRouter.put('/settings', requireAuth, async (req: Request, res: Response) => {
  try {
    const data = await storage.updateSettings(req.body);
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update settings', details: err.message });
  }
});

// Authenticated: Full Import
apiRouter.post('/import', requireAuth, async (req: Request, res: Response) => {
  try {
    const importedData = req.body;
    if (!importedData || !Array.isArray(importedData.categories)) {
      res.status(400).json({ error: 'Invalid directory dataset format' });
      return;
    }
    const data = await storage.saveData(importedData);
    res.json({ success: true, message: 'Dataset successfully imported and persisted.', data });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to import data', details: err.message });
  }
});
