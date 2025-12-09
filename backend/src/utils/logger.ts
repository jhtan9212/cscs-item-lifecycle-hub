/**
 * Structured logging utility
 * Following Node.js best practices for logging
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  [key: string]: any;
}

class Logger {
  private formatMessage(level: LogLevel, message: string, meta?: any): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta?: any): void {
    const entry = this.formatMessage(level, message, meta);
    const logString = JSON.stringify(entry);
    
    switch (level) {
      case 'error':
        console.error(logString);
        break;
      case 'warn':
        console.warn(logString);
        break;
      case 'debug':
        if (process.env.NODE_ENV === 'development') {
          console.debug(logString);
        }
        break;
      default:
        console.log(logString);
    }
  }

  info(message: string, meta?: any): void {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any): void {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any): void {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any): void {
    this.log('debug', message, meta);
  }
}

export const logger = new Logger();
