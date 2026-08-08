import { createContext, type Dispatch, type SetStateAction } from "react";

export interface RefreshContextType {
    key: number;
    setKey: Dispatch<SetStateAction<number>>;
}

export const RefreshContext = createContext<RefreshContextType | undefined>(
    undefined
);