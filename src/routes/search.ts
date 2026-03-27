import { Router } from 'express';
import { db } from '../services/database';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
  const { q, type, tag } = req.query;

  if (tag) {
    const files = db.searchByTag(tag as string);
    return res.json({ success: true, data: files });
  }

  if (type) {
    const files = db.searchByType(type as string);
    return res.json({ success: true, data: files });
  }

  if (q) {
    const files = db.searchFiles(q as string);
    return res.json({ success: true, data: files });
  }

  res.status(400).json({ success: false, message: '请提供搜索条件: q, type, 或 tag' });
});

searchRouter.get('/tags', (_req, res) => {
  const tags = db.getAllTags();
  res.json({ success: true, data: tags });
});

searchRouter.get('/tags/:tagName', (req, res) => {
  const { tagName } = req.params;
  const files = db.searchByTag(tagName);
  res.json({ success: true, data: files });
});
