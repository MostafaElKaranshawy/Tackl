import jwt, { SignOptions } from "jsonwebtoken";
import TokenPayload from "../interfaces/TokenPayload";

export default class Jwt {
    static generateToken(
        payload: object,
        expiresIn = process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"],
    ) {
        return jwt.sign(payload, process.env.JWT_TOKEN_SECRET!, {
            expiresIn,
        });
    }
    static verifyToken(token: string): TokenPayload | null {
        return jwt.verify(token, process.env.JWT_TOKEN_SECRET as string) as TokenPayload | null;
    }

    // static decodeToken(token: string) {
    //     return jwt.decode(token);
    // }

    // static extractIdFromToken(token: string): string {
    //     const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string) as { id: string } | null;
    //     if (!decoded || !decoded.id) {
    //         throw new ForbiddenException("Invalid token");
    //     }
    //     return decoded.id;
    // }
    // static confirmationTokenDecode(token: string):ConfirmationTokenPayload {
    //     const decoded = jwt.verify(token, process.env.JWT_TOKEN_SECRET as string) as { id: string; confirmation: boolean } | null;
    //     if (!decoded || !decoded.id || !decoded.confirmation) {
    //         throw new ForbiddenException("Invalid token");
    //     }
    //     return decoded;
    // }

}