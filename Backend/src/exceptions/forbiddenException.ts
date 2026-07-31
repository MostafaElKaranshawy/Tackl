export default class ForbiddenException extends Error {
    statusCode: number;
    constructor(message: string) {
        super(message);
        this.statusCode = 403;
        this.name = "ForbiddenException";
    }
}