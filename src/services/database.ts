import Database from 'better-sqlite3';
import { mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';
import { config } from '../../config/config';

class DatabaseService {
  private db: Database;

  constructor() {
    const dbPath = config.database.path;
    const dbDir = dirname(dbPath);
    if (!existsSync(dbDir)) {
      mkdirSync(dbDir, { recursive: true });
    }
    this.db = new Database(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL');
    this.initTables();
  }

  private initTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT NOT NULL,
        original_path TEXT NOT NULL UNIQUE,
        relative_path TEXT NOT NULL,
        file_type TEXT NOT NULL,
        mime_type TEXT,
        file_extension TEXT,
        file_size INTEGER,
        parent_folder TEXT,
        folder_hierarchy TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        modified_at DATETIME,
        scanned_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tags (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        tag_type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_tags (
        file_id INTEGER NOT NULL,
        tag_id INTEGER NOT NULL,
        PRIMARY KEY (file_id, tag_id),
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      )
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS scan_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        root_path TEXT NOT NULL,
        scan_type TEXT,
        files_found INTEGER DEFAULT 0,
        files_added INTEGER DEFAULT 0,
        files_skipped INTEGER DEFAULT 0,
        errors TEXT,
        started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        status TEXT DEFAULT 'running'
      )
    `);

    // 创建文件统计表
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS file_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        file_id INTEGER NOT NULL,
        action_type TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE
      )
    `);

    // 创建索引
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_file_stats_file_id ON file_stats(file_id)`);
    this.db.exec(`CREATE INDEX IF NOT EXISTS idx_file_stats_created_at ON file_stats(created_at)`);
  }

  insertFile(fileData: {
    filename: string;
    originalPath: string;
    relativePath: string;
    fileType: string;
    mimeType: string;
    extension: string;
    size: number;
    parentFolder: string;
    folderHierarchy: string[];
    modifiedAt: string;
  }) {
    const stmt = this.db.prepare(`
      INSERT INTO files (filename, original_path, relative_path, file_type,
                         mime_type, file_extension, file_size, parent_folder,
                         folder_hierarchy, modified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      fileData.filename,
      fileData.originalPath,
      fileData.relativePath,
      fileData.fileType,
      fileData.mimeType,
      fileData.extension,
      fileData.size,
      fileData.parentFolder,
      JSON.stringify(fileData.folderHierarchy),
      fileData.modifiedAt
    );
  }

  getOrCreateTag(name: string, type: string): number {
    const existing = this.db.prepare('SELECT id FROM tags WHERE name = ?').get(name) as { id: number } | undefined;
    if (existing) return existing.id;

    const result = this.db.prepare('INSERT INTO tags (name, tag_type) VALUES (?, ?)').run(name, type);
    return Number(result.lastInsertRowid);
  }

  addFileTag(fileId: number, tagId: number) {
    this.db.prepare('INSERT OR IGNORE INTO file_tags (file_id, tag_id) VALUES (?, ?)').run(fileId, tagId);
  }

  fileExists(originalPath: string): boolean {
    const result = this.db.prepare('SELECT id FROM files WHERE original_path = ?').get(originalPath);
    return !!result;
  }

  insertScanLog(rootPath: string, scanType: string): number {
    const result = this.db.prepare(
      'INSERT INTO scan_logs (root_path, scan_type) VALUES (?, ?)'
    ).run(rootPath, scanType);
    return Number(result.lastInsertRowid);
  }

  updateScanLog(id: number, data: {
    filesFound?: number;
    filesAdded?: number;
    filesSkipped?: number;
    errors?: string;
    status?: string;
  }) {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.filesFound !== undefined) { fields.push('files_found = ?'); values.push(data.filesFound); }
    if (data.filesAdded !== undefined) { fields.push('files_added = ?'); values.push(data.filesAdded); }
    if (data.filesSkipped !== undefined) { fields.push('files_skipped = ?'); values.push(data.filesSkipped); }
    if (data.errors !== undefined) { fields.push('errors = ?'); values.push(data.errors); }
    if (data.status !== undefined) { fields.push('status = ?'); values.push(data.status); }

    if (data.status === 'completed' || data.status === 'failed') {
      fields.push('completed_at = CURRENT_TIMESTAMP');
    }

    if (fields.length === 0) return;

    values.push(id);
    this.db.prepare(`UPDATE scan_logs SET ${fields.join(', ')} WHERE id = ?`).run(...values);
  }

  getAllFiles() {
    return this.db.prepare('SELECT * FROM files ORDER BY scanned_at DESC').all();
  }

  getFileById(id: number) {
    return this.db.prepare('SELECT * FROM files WHERE id = ?').get(id);
  }

  searchFiles(keyword: string) {
    return this.db.prepare(`
      SELECT * FROM files
      WHERE filename LIKE ? OR relative_path LIKE ?
      ORDER BY scanned_at DESC
    `).all(`%${keyword}%`, `%${keyword}%`);
  }

  searchByTag(tagName: string) {
    return this.db.prepare(`
      SELECT f.* FROM files f
      JOIN file_tags ft ON f.id = ft.file_id
      JOIN tags t ON ft.tag_id = t.id
      WHERE t.name = ?
      ORDER BY f.scanned_at DESC
    `).all(tagName);
  }

  searchByType(fileType: string) {
    return this.db.prepare('SELECT * FROM files WHERE file_type = ? ORDER BY scanned_at DESC').all(fileType);
  }

  getAllTags() {
    return this.db.prepare('SELECT * FROM tags ORDER BY name').all();
  }

  deleteFile(id: number) {
    this.db.prepare('DELETE FROM files WHERE id = ?').run(id);
  }

  getStats() {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM files').get() as any).count;
    const byType = this.db.prepare('SELECT file_type, COUNT(*) as count FROM files GROUP BY file_type').all();
    return { total, byType };
  }

  // 记录文件点击
  recordFileClick(fileId: number): void {
    const stmt = this.db.prepare('INSERT INTO file_stats (file_id, action_type) VALUES (?, ?)');
    stmt.run(fileId, 'click');
  }

  // 记录文件播放
  recordFilePlay(fileId: number): void {
    const stmt = this.db.prepare('INSERT INTO file_stats (file_id, action_type) VALUES (?, ?)');
    stmt.run(fileId, 'play');
  }

  // 获取单个文件统计
  getFileStats(fileId: number): { clicks: number, plays: number } {
    const clicks = this.db.prepare('SELECT COUNT(*) as count FROM file_stats WHERE file_id = ? AND action_type = ?').get(fileId, 'click') as any;
    const plays = this.db.prepare('SELECT COUNT(*) as count FROM file_stats WHERE file_id = ? AND action_type = ?').get(fileId, 'play') as any;
    return { clicks: clicks.count, plays: plays.count };
  }

  // 获取总体统计
  getOverallStats(): { totalClicks: number, totalPlays: number, todayClicks: number, todayPlays: number } {
    const totalClicks = (this.db.prepare('SELECT COUNT(*) as count FROM file_stats WHERE action_type = ?').get('click') as any).count;
    const totalPlays = (this.db.prepare('SELECT COUNT(*) as count FROM file_stats WHERE action_type = ?').get('play') as any).count;
    const todayClicks = (this.db.prepare("SELECT COUNT(*) as count FROM file_stats WHERE action_type = ? AND date(created_at) = date('now')").get('click') as any).count;
    const todayPlays = (this.db.prepare("SELECT COUNT(*) as count FROM file_stats WHERE action_type = ? AND date(created_at) = date('now')").get('play') as any).count;
    return { totalClicks, totalPlays, todayClicks, todayPlays };
  }

  // 获取热门文件
  getTopFiles(limit: number = 10): any[] {
    return this.db.prepare(`
      SELECT f.*, 
        SUM(CASE WHEN fs.action_type = 'click' THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN fs.action_type = 'play' THEN 1 ELSE 0 END) as plays
      FROM files f
      LEFT JOIN file_stats fs ON f.id = fs.file_id
      GROUP BY f.id
      ORDER BY (clicks + plays) DESC
      LIMIT ?
    `).all(limit);
  }

  // 获取按类型统计
  getStatsByType(): any[] {
    return this.db.prepare(`
      SELECT f.file_type,
        SUM(CASE WHEN fs.action_type = 'click' THEN 1 ELSE 0 END) as clicks,
        SUM(CASE WHEN fs.action_type = 'play' THEN 1 ELSE 0 END) as plays
      FROM files f
      LEFT JOIN file_stats fs ON f.id = fs.file_id
      GROUP BY f.file_type
    `).all();
  }

  // 分页获取文件
  getFilesWithPagination(page: number = 1, pageSize: number = 10): { files: any[], total: number } {
    const total = (this.db.prepare('SELECT COUNT(*) as count FROM files').get() as any).count;
    const offset = (page - 1) * pageSize;
    const files = this.db.prepare('SELECT * FROM files ORDER BY scanned_at DESC LIMIT ? OFFSET ?').all(pageSize, offset);
    return { files, total };
  }
}

export const db = new DatabaseService();
