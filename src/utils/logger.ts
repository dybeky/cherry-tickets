import * as winston from 'winston';
import * as path from 'path';
import DailyRotateFile from 'winston-daily-rotate-file';

const C = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m'
};

class Logger {
  private winstonLogger: winston.Logger;
  private isLogging: boolean = false; // Recursion guard
  private lastError: string = '';
  private errorCount: number = 0;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    const fileTransport = new DailyRotateFile({
      dirname: logDir,
      filename: 'bot-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '100m',
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level.toUpperCase()} ${message}`;
        })
      )
    });

    this.winstonLogger = winston.createLogger({
      level: process.env.DEBUG === 'true' ? 'debug' : 'info',
      transports: [fileTransport],
      exitOnError: false
    });

    fileTransport.on('error', () => {
    });
  }

  private time(): string {
    return new Date().toTimeString().split(' ')[0];
  }

  private safeConsoleLog(message: string): void {
    // Guard against recursion from console errors
    if (this.isLogging) return;

    this.isLogging = true;
    try {
      process.stdout.write(message + '\n');
    } catch {
      // Ignore EPIPE and other write errors
    } finally {
      this.isLogging = false;
    }
  }

  private safeConsoleError(message: string): void {
    if (this.isLogging) return;

    this.isLogging = true;
    try {
      process.stderr.write(message + '\n');
    } catch {
      // Ignore EPIPE and other write errors
    } finally {
      this.isLogging = false;
    }
  }

  info(msg: string): void {
    this.safeConsoleLog(`${C.gray}[${this.time()}]${C.reset} ${C.green}INFO${C.reset} ${msg}`);
    // Only write ticket-related info to file
    if (msg.includes('Ticket') || msg.includes('Setup') || msg.includes('initialized') || msg.includes('loaded')) {
      try {
        this.winstonLogger.info(msg);
      } catch {
        // Ignore logging errors
      }
    }
  }

  warn(msg: string): void {
    this.safeConsoleLog(`${C.gray}[${this.time()}]${C.reset} ${C.yellow}WARN${C.reset} ${msg}`);
    try {
      this.winstonLogger.warn(msg);
    } catch {
      // Ignore logging errors
    }
  }

  error(msg: string, err?: Error): void {
    // Guard against recursion
    if (this.isLogging) return;

    const errMsg = err?.message || '';
    const fullMsg = errMsg ? `${msg}: ${errMsg}` : msg;

    // Deduplicate - don't spam same error
    if (fullMsg === this.lastError) {
      this.errorCount++;
      if (this.errorCount > 3) return; // Max 3 same errors
    } else {
      this.lastError = fullMsg;
      this.errorCount = 1;
    }

    this.safeConsoleError(`${C.gray}[${this.time()}]${C.reset} ${C.red}ERROR${C.reset} ${fullMsg}`);

    try {
      this.winstonLogger.error(fullMsg);
    } catch {
      // Ignore logging errors
    }
  }

  debug(msg: string): void {
    // Debug only to console, never to file
    if (process.env.DEBUG === 'true') {
      this.safeConsoleLog(`${C.gray}[${this.time()}] DEBUG ${msg}${C.reset}`);
    }
  }

  startup(): void {
    this.safeConsoleLog(`\n${C.cyan}${'─'.repeat(40)}${C.reset}`);
    this.safeConsoleLog(`${C.cyan}${C.bold}  Unturned Ticket Bot${C.reset}`);
    this.safeConsoleLog(`${C.gray}  ${this.time()} | Node ${process.version}${C.reset}`);
    this.safeConsoleLog(`${C.cyan}${'─'.repeat(40)}${C.reset}\n`);

    try {
      this.winstonLogger.info(`=== BOT STARTUP ${new Date().toISOString()} ===`);
    } catch {
      // Ignore logging errors
    }
  }

  validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (!process.env.DISCORD_TOKEN) errors.push('DISCORD_TOKEN not set');
    if (!process.env.CLIENT_ID) errors.push('CLIENT_ID not set');
    if (errors.length > 0) this.warn(`Config: ${errors.join(', ')}`);
    return { valid: errors.length === 0, errors };
  }

  command(name: string, userId: string): void {
    this.info(`/${name} by ...${userId.slice(-4)}`);
  }

  ticket(action: string, id: number | string, userId: string): void {
    this.info(`Ticket #${id} ${action}`);
  }

  discordError(action: string, err: Error): void {
    this.error(`Discord ${action}`, err);
  }
}

export default new Logger();
export { Logger };
