"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const winston_1 = __importDefault(require("winston"));
// Base logger configuration
const loggerOptions = {
    level: 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(({ level, message, timestamp, service }) => {
        return `${timestamp} [${service}] ${level}: ${message}`;
    })),
    defaultMeta: { service: 'default' },
    transports: [
        new winston_1.default.transports.Console(),
        new winston_1.default.transports.File({ filename: 'error.log', level: 'error' }),
        new winston_1.default.transports.File({ filename: 'combined.log' })
    ]
};
// Create the default logger
const defaultLogger = winston_1.default.createLogger(loggerOptions);
// Logger factory function (equivalent to logging.getLogger)
function getLogger(name) {
    return defaultLogger.child({ service: name });
}
exports.default = getLogger;
