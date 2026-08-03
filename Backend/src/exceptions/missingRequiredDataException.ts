export default class MissingRequiredDataException extends Error {
    statusCode: number;

    constructor(message: string = "Missing required data", statusCode: number = 400) {
        super(message);
        this.name = "MissingRequiredDataException";
        this.statusCode = statusCode;
    }
}