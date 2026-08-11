import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';
import EmailAlreadyConfirmedException from '../exceptions/emailAlreadyConfirmed';
import AlreadyExistsException from '../exceptions/alreadyExistsException';
import DBException from '../exceptions/dbException';
import ForbiddenException from '../exceptions/forbiddenException';
import MissingRequiredDataException from '../exceptions/missingRequiredDataException';
import WrongCredentialsException from '../exceptions/wrongCredentialsException';
import NotFoundException from '../exceptions/notFoundException';

export default function ErrorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {

    const statusCode = err instanceof Error ? (err as { statusCode?: number }).statusCode : 500;
    const message = err instanceof EmailAlreadyConfirmedException ? "Email is already confirmed, login instead" :
        err instanceof AlreadyExistsException ? "Resource already exists" :
            err instanceof DBException ? "Internal Server Error" :
                err instanceof ForbiddenException ? "Forbidden" :
                    err instanceof MissingRequiredDataException ? "Missing required data" :
                        err instanceof WrongCredentialsException ? "Wrong credentials" :
                            err instanceof NotFoundException ? "Resource not found" :
                                err instanceof Error ? err.message : "An error occurred";

    const stack = err instanceof Error ? (err as { stack?: string }).stack : '';

    logger.error(`Error: ${err instanceof Error ? err.message : message}, Stack: ${stack}`);

    res.status(statusCode || 500).json({
        status: 'error',
        statusCode,
        message,
    });
}