import { useState, type ReactNode } from "react";
import { RefreshContext } from "./RefreshContext";

export function RefreshProvider({ children }: { children: ReactNode }) {
    const [key, setKey] = useState(0);

    return (
        <RefreshContext.Provider value={{ key, setKey }}>
            {children}
        </RefreshContext.Provider>
    );
}