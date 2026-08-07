import logger from '../config/logger';
import AlreadyExistsError from './alreadyExistsException';
import DBException from './dbException';
import NotFoundException from './notFoundException';
import MissingFieldException from './missingRequiredDataException';

export default function ErrorHandler(err: any, req: any, res: any) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    const stack = err.stack || '';

    // Log the error details
    logger.error(`Error: ${message}, Stack: ${stack}`);

    res.status(statusCode).json({
        status: 'error',
        statusCode,
        message,
        stack,
    });
}