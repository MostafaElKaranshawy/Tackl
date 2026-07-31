export default class WrongCredentialsException extends Error {
    statusCode: number;

    constructor(message: string = "Wrong credentials", statusCode: number = 401) {
        super(message);
        this.name = "WrongCredentialsException";
        this.statusCode = statusCode;
    }
}