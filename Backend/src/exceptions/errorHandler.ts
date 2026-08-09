import logger from '../config/logger';
import { Request, Response } from 'express';

export default function ErrorHandler(err: unknown, req: Request, res: Response) {

    const statusCode = err instanceof Error ? (err as { statusCode?: number }).statusCode : 500;
    const message = statusCode == 500 ? "Internal Server Error" : err instanceof Error ? (err as { message?: string }).message : 'Internal Server Error';
    const stack = err instanceof Error ? (err as { stack?: string }).stack : '';

    // Log the error details
    logger.error(`Error: ${message}, Stack: ${stack}`);

    res.status(statusCode || 500).json({
        status: 'error',
        statusCode,
        message,
        stack,
    });
}