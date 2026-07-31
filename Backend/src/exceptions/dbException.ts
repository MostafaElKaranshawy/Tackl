export default class DBException extends Error {

    statusCode: number;
    constructor(message: string, statusCode: number = 500) {
        super(message);
        this.name = "DBException";
        this.statusCode = statusCode;
        
        Object.setPrototypeOf(this, new.target.prototype);
    }
}