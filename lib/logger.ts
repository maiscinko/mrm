// ⚓ ANCHOR: STRUCTURED_LOGGING
// REASON: Clean, conditional logging that doesn't pollute production
// PATTERN: Log levels (debug, info, warn, error), enabled only in dev
// PRODUCTION: Logs disabled by default, only errors sent to monitoring
// BENEFIT: Better debugging in dev, clean production, future-ready for Sentry/LogRocket

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel
  prefix: string
}

class Logger {
  private config: LoggerConfig

  constructor(prefix: string = 'App') {
    this.config = {
      // Only enable in development
      enabled: process.env.NODE_ENV === 'development',
      level: (process.env.NEXT_PUBLIC_LOG_LEVEL as LogLevel) || 'debug',
      prefix,
    }
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error']
    const currentLevelIndex = levels.indexOf(this.config.level)
    const requestedLevelIndex = levels.indexOf(level)

    return requestedLevelIndex >= currentLevelIndex
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): string {
    const timestamp = new Date().toISOString()
    return `[${timestamp}] [${this.config.prefix}] [${level.toUpperCase()}] ${message}`
  }

  debug(message: string, ...args: any[]) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', message), ...args)
    }
  }

  info(message: string, ...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message), ...args)
    }
  }

  warn(message: string, ...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message), ...args)
    }
  }

  error(message: string, ...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args)
    }

    // TODO: Send to error monitoring service (Sentry, LogRocket, etc)
    // Example: Sentry.captureException(new Error(message), { extra: args })
  }
}

// Export pre-configured loggers for different modules
export const authLogger = new Logger('Auth')
export const onboardingLogger = new Logger('Onboarding')
export const apiLogger = new Logger('API')

// Default export
export default Logger
