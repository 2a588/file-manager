import { readdir, stat } from 'fs/promises';
import { join, relative, extname, basename, dirname } from 'path';
import { db } from './database';
import { logger } from './logger';
import { getFileType, getMimeType } from '../utils/fileType';

interface ScanResult {
  totalFiles: number;
  addedFiles: number;
  skippedFiles: number;
  errors: string[];
}

class ScannerService {
  private rootPath: string;
  private result: ScanResult;
  private scanLogId: number | null = null;

  constructor(rootPath: string) {
    this.rootPath = rootPath;
    this.result = {
      totalFiles: 0,
      addedFiles: 0,
      skippedFiles: 0,
      errors: [],
    };
  }

  async scan(scanType: string = 'full'): Promise<ScanResult> {
    logger.info(`开始扫描目录: ${this.rootPath}`);
    this.scanLogId = db.insertScanLog(this.rootPath, scanType);

    try {
      await this.scanDirectory(this.rootPath);

      db.updateScanLog(this.scanLogId, {
        filesFound: this.result.totalFiles,
        filesAdded: this.result.addedFiles,
        filesSkipped: this.result.skippedFiles,
        errors: this.result.errors.length > 0 ? JSON.stringify(this.result.errors) : undefined,
        status: 'completed',
      });

      logger.info(`扫描完成: 总计${this.result.totalFiles}个文件，新增${this.result.addedFiles}个，跳过${this.result.skippedFiles}个`);
    } catch (error) {
      if (this.scanLogId) {
        db.updateScanLog(this.scanLogId, { status: 'failed', errors: String(error) });
      }
      logger.error(`扫描失败: ${error}`);
      throw error;
    }

    return this.result;
  }

  private async scanDirectory(dirPath: string) {
    try {
      const entries = await readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = join(dirPath, entry.name);

        if (entry.isDirectory()) {
          await this.scanDirectory(fullPath);
        } else if (entry.isFile()) {
          await this.processFile(fullPath);
        }
      }
    } catch (error) {
      const errorMsg = `扫描目录失败: ${dirPath} - ${error}`;
      logger.error(errorMsg);
      this.result.errors.push(errorMsg);
    }
  }

  private async processFile(filePath: string) {
    this.result.totalFiles++;

    try {
      if (db.fileExists(filePath)) {
        this.result.skippedFiles++;
        return;
      }

      const fileStat = await stat(filePath);
      const extension = extname(filePath).toLowerCase().slice(1);
      const filename = basename(filePath);
      const relativePath = relative(this.rootPath, filePath);
      const parentFolder = basename(dirname(filePath));
      const folderHierarchy = this.getFolderHierarchy(relativePath);
      const fileType = getFileType(extension);
      const mimeType = getMimeType(extension);

      if (!fileType) {
        this.result.skippedFiles++;
        return;
      }

      const result = db.insertFile({
        filename,
        originalPath: filePath,
        relativePath,
        fileType,
        mimeType,
        extension,
        size: fileStat.size,
        parentFolder,
        folderHierarchy,
        modifiedAt: fileStat.mtime.toISOString(),
      });

      const fileId = Number(result.lastInsertRowid);
      await this.addTags(fileId, folderHierarchy, extension, fileType);

      this.result.addedFiles++;
      logger.info(`已添加: ${relativePath}`);
    } catch (error) {
      const errorMsg = `处理文件失败: ${filePath} - ${error}`;
      logger.error(errorMsg);
      this.result.errors.push(errorMsg);
    }
  }

  private getFolderHierarchy(relativePath: string): string[] {
    const parts = relativePath.split(/[/\\]/);
    return parts.slice(0, -1);
  }

  private async addTags(fileId: number, folders: string[], extension: string, fileType: string) {
    for (const folder of folders) {
      if (folder) {
        const tagId = db.getOrCreateTag(folder, 'folder');
        db.addFileTag(fileId, tagId);
      }
    }

    const typeTagId = db.getOrCreateTag(extension, 'filetype');
    db.addFileTag(fileId, typeTagId);

    const categoryTagId = db.getOrCreateTag(fileType, 'category');
    db.addFileTag(fileId, categoryTagId);
  }
}

export const createScanner = (rootPath: string) => new ScannerService(rootPath);
