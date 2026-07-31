import jwt, { SignOptions } from "jsonwebtoken";
import { ConfirmationTokenPayload } from "../interfaces/ConfirmationTokenPayLoad";
import ForbiddenException from "../exceptions/forbiddenException";

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

    static extractIdFromToken(token: string): string {
        const decoded = jwt.decode(token) as { id: string } | null;
        if (!decoded || !decoded.id) {
            throw new ForbiddenException("Invalid token");
        }
        return decoded.id;
    }
    static confirmationTokenDecode(token: string):ConfirmationTokenPayload {
        const decoded = jwt.decode(token) as { id: string; confirmation: boolean } | null;
        if (!decoded || !decoded.id || !decoded.confirmation) {
            throw new ForbiddenException("Invalid token");
        }
        return decoded;
    }

}