import { Router } from 'express';
import { db } from '../services/database';

export const searchRouter = Router();

searchRouter.get('/', (req, res) => {
  const { q, type, tag } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;

  let result: { files: any[], total: number };

  if (tag) {
    result = db.searchByTagPaginated(tag as string, page, pageSize);
  } else if (type) {
    result = db.searchByTypePaginated(type as string, page, pageSize);
  } else if (q) {
    result = db.searchFilesPaginated(q as string, page, pageSize);
  } else {
    return res.status(400).json({ success: false, message: '请提供搜索条件: q, type, 或 tag' });
  }

  res.json({
    success: true,
    data: result.files,
    pagination: {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    },
  });
});

searchRouter.get('/tags', (_req, res) => {
  const tags = db.getAllTags();
  res.json({ success: true, data: tags });
});

searchRouter.get('/tags/:tagName', (req, res) => {
  const { tagName } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const pageSize = parseInt(req.query.pageSize as string) || 10;
  const result = db.searchByTagPaginated(tagName, page, pageSize);
  res.json({
    success: true,
    data: result.files,
    pagination: {
      page,
      pageSize,
      total: result.total,
      totalPages: Math.ceil(result.total / pageSize),
    },
  });
});
