import winston, { format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors, json } = format;

const isProduction = process.env.NODE_ENV? process.env.NODE_ENV === 'production' : true;

// Console format: colored, human-readable
const consoleFormat = combine(
    colorize(),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    printf(({ level, message, timestamp, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `${timestamp} [${level}]: ${stack || message} ${metaStr}`;
    })
);

// File format: structured JSON, good for log aggregators
const fileFormat = combine(
    timestamp(),
    errors({ stack: true }),
    json()
);

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
    format: fileFormat,
    defaultMeta: { service: 'my-app' },
    transports: [
        // new transports.Console({ format: consoleFormat }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }),
        new transports.File({ filename: 'logs/combined.log' }),
    ],
    exceptionHandlers: [
        new transports.File({ filename: 'logs/exceptions.log' }),
    ],
    rejectionHandlers: [
        new transports.File({ filename: 'logs/rejections.log' }),
    ],
});

export default logger;