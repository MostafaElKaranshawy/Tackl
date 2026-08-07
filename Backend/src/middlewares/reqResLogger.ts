import logger from '../config/logger';
import { Request, Response, NextFunction } from 'express';

export default function ReqResLogger(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const { method, originalUrl } = req;
        const { statusCode } = res;

        const message = `${method} ${originalUrl} ${statusCode} - ${duration}ms`;

        // const meta = {
        //     method,
        //     url: originalUrl,
        //     statusCode,
        //     duration,
        //     message: res.statusMessage,
        // };

        logger.info(message);
    });

    next();
}