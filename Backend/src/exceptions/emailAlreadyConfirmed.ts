export default class EmailAlreadyConfirmedException extends Error {
    statusCode: number;
    constructor(message: string = "Email is already confirmed, login instead", statusCode: number = 409) {
        super(message);
        this.name = "EmailAlreadyConfirmedException";
        this.statusCode = statusCode;
    }
}