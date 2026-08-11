import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import ReqResLogger from "../../src/middlewares/reqResLogger";
import logger from "../../src/config/logger";

vi.mock("../../src/config/logger", () => ({
    default: {
        info: vi.fn(),
    },
}));

describe("ReqResLogger", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let finishCallback: () => void;

    beforeEach(() => {
        vi.clearAllMocks();

        req = {
            method: "GET",
            originalUrl: "/api/projects",
        };

        finishCallback = vi.fn();

        res = {
            statusCode: 200,
            on: vi.fn((event, callback) => {
                if (event === "finish") {
                    finishCallback = callback as () => void;
                }

                return res as Response;
            }),
        };

        next = vi.fn();
    });

    it("should register a finish event listener", () => {
        ReqResLogger(
            req as Request,
            res as Response,
            next
        );

        expect(res.on).toHaveBeenCalledWith(
            "finish",
            expect.any(Function)
        );
    });

    it("should call next", () => {
        ReqResLogger(
            req as Request,
            res as Response,
            next
        );

        expect(next).toHaveBeenCalled();
    });

    it("should log request information when response finishes", () => {
        ReqResLogger(
            req as Request,
            res as Response,
            next
        );

        finishCallback();

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringMatching(
                /^GET \/api\/projects 200 - \d+ms$/
            )
        );
    });

    it("should use the response status code in the log", () => {
        res.statusCode = 404;

        ReqResLogger(
            req as Request,
            res as Response,
            next
        );

        finishCallback();

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringMatching(
                /^GET \/api\/projects 404 - \d+ms$/
            )
        );
    });

    it("should use the request method and original URL in the log", () => {
        req.method = "POST";
        req.originalUrl = "/api/projects/123";

        ReqResLogger(
            req as Request,
            res as Response,
            next
        );

        finishCallback();

        expect(logger.info).toHaveBeenCalledWith(
            expect.stringMatching(
                /^POST \/api\/projects\/123 200 - \d+ms$/
            )
        );
    });
});