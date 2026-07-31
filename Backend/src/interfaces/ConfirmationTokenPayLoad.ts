import { JwtPayload } from "jsonwebtoken";

export interface ConfirmationTokenPayload extends JwtPayload {
    id: string;
    confirmation: boolean;
}