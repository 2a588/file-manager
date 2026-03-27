import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from '../../config/config';

class Logger {
  private logPath: string;

  constructor() {
    this.logPath = config.logs.path;
    if (!existsSync(this.logPath)) {
      mkdirSync(this.logPath, { recursive: true });
    }
  }

  private formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] ${message}`;
  }

  private writeToFile(level: string, message: string) {
    const date = new Date().toISOString().split('T')[0];
    const logFile = join(this.logPath, `scan-${date}.log`);
    const formatted = this.formatMessage(level, message);
    try {
      appendFileSync(logFile, formatted + '\n');
    } catch {
      console.error('写入日志失败');
    }
  }

  info(message: string) {
    const formatted = this.formatMessage('INFO', message);
    console.log(formatted);
    this.writeToFile('INFO', message);
  }

  error(message: string) {
    const formatted = this.formatMessage('ERROR', message);
    console.error(formatted);
    this.writeToFile('ERROR', message);
  }

  warn(message: string) {
    const formatted = this.formatMessage('WARN', message);
    console.warn(formatted);
    this.writeToFile('WARN', message);
  }
}

export const logger = new Logger();
