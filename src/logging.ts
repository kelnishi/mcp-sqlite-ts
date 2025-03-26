import winston from 'winston';

// Base logger configuration
const loggerOptions = {
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp, service }) => {
      return `${timestamp} [${service}] ${level}: ${message}`;
    })
  ),
  defaultMeta: { service: 'default' },
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
};

// Create the default logger
const defaultLogger = winston.createLogger(loggerOptions);

// Logger factory function (equivalent to logging.getLogger)
function getLogger(name: string) {
  return defaultLogger.child({ service: name });
}

export default getLogger;