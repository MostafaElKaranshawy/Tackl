export default class NotFoundException extends Error {

    statusCode: number;

    constructor(message: string, statusCode: number = 404) {
        super(message);
        this.name = "NotFoundException";
        this.statusCode = statusCode;
        
        Object.setPrototypeOf(this, new.target.prototype);
    }
}