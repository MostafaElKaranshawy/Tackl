import jwt, { SignOptions } from "jsonwebtoken";

export default class Jwt {
    static generateToken(
        payload: object,
        expiresIn = process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
    ) {
        return jwt.sign(payload, process.env.JWT_TOKEN_SECRET!, {
            expiresIn,
        });
    }
    static verifyToken(token: string) {
        return jwt.verify(token, process.env.JWT_TOKEN_SECRET as string);
    }

    static decodeToken(token: string) {
        return jwt.decode(token);
    }

}