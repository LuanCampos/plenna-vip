type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  event: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

const isDevelopment = import.meta.env.DEV;

const formatLog = (entry: LogEntry): string => {
  const { level, event, data, timestamp } = entry;
  const dataStr = data ? ` ${JSON.stringify(data)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${event}${dataStr}`;
};

const createLogEntry = (
  level: LogLevel,
  event: string,
  data?: Record<string, unknown>
): LogEntry => ({
  level,
  event,
  data,
  timestamp: new Date().toISOString(),
});

const log = (level: LogLevel, event: string, data?: Record<string, unknown>) => {
  const entry = createLogEntry(level, event, data);

  // In development, log to console
  if (isDevelopment) {
    const formatted = formatLog(entry);
    switch (level) {
      case 'debug':
        console.debug(formatted);
        break;
      case 'info':
        console.info(formatted);
        break;
      case 'warn':
        console.warn(formatted);
        break;
      case 'error':
        console.error(formatted);
        break;
    }
  }

  // In production, you could send logs to a service
  // Example: sendToLogService(entry);
};

export const logger = {
  debug: (event: string, data?: Record<string, unknown>) => log('debug', event, data),
  info: (event: string, data?: Record<string, unknown>) => log('info', event, data),
  warn: (event: string, data?: Record<string, unknown>) => log('warn', event, data),
  error: (event: string, data?: Record<string, unknown>) => log('error', event, data),
};
