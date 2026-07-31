export default class AlreadyExistsException extends Error {

    statusCode: number;

    constructor(message: string, statusCode: number = 409) {
        super(message);
        this.name = "AlreadyExistsException";
        this.statusCode = statusCode;
        
        Object.setPrototypeOf(this, new.target.prototype);
    }
}