export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
  userId?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory

  private formatMessage(level: LogLevel, message: string, data?: any, component?: string): string {
    const timestamp = new Date().toISOString();
    const componentInfo = component ? `[${component}]` : '';
    const dataInfo = data ? ` | Data: ${JSON.stringify(data)}` : '';
    return `${timestamp} ${level} ${componentInfo} ${message}${dataInfo}`;
  }

  private addLog(level: LogLevel, message: string, data?: any, component?: string): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      component
    };

    this.logs.push(logEntry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // In a real application, you would send logs to a server
    // For now, we'll store them in localStorage for persistence
    try {
      localStorage.setItem('urlShortenerLogs', JSON.stringify(this.logs));
    } catch (error) {
      // If localStorage is full, clear old logs and try again
      this.logs = this.logs.slice(-500);
      try {
        localStorage.setItem('urlShortenerLogs', JSON.stringify(this.logs));
      } catch (e) {
        // If still fails, just keep logs in memory
      }
    }
  }

  debug(message: string, data?: any, component?: string): void {
    this.addLog(LogLevel.DEBUG, message, data, component);
  }

  info(message: string, data?: any, component?: string): void {
    this.addLog(LogLevel.INFO, message, data, component);
  }

  warn(message: string, data?: any, component?: string): void {
    this.addLog(LogLevel.WARN, message, data, component);
  }

  error(message: string, data?: any, component?: string): void {
    this.addLog(LogLevel.ERROR, message, data, component);
  }

  getLogs(level?: LogLevel, component?: string): LogEntry[] {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = filteredLogs.filter(log => log.level === level);
    }
    
    if (component) {
      filteredLogs = filteredLogs.filter(log => log.component === component);
    }
    
    return filteredLogs;
  }

  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem('urlShortenerLogs');
    } catch (error) {
      // Ignore localStorage errors
    }
  }

  // Load logs from localStorage on initialization
  loadLogs(): void {
    try {
      const storedLogs = localStorage.getItem('urlShortenerLogs');
      if (storedLogs) {
        this.logs = JSON.parse(storedLogs);
      }
    } catch (error) {
      this.warn('Failed to load logs from localStorage', { error }, 'Logger');
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Load existing logs on initialization
logger.loadLogs();

export default logger; 