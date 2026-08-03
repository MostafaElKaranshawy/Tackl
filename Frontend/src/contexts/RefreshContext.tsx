import { createContext, useContext, useState, type ReactNode } from "react";

interface RefreshContextType {
    key: number;
    setKey: React.Dispatch<React.SetStateAction<number>>;
}

const RefreshContext = createContext<RefreshContextType | undefined>(undefined);

export function RefreshProvider({ children }: { children: ReactNode }) {
    const [key, setKey] = useState<number>(0);

    return (
        <RefreshContext.Provider
            value={
                {
                    key,
                    setKey,
                }
            }
        >
            {children}
        </RefreshContext.Provider>
    );
}

export function useRefreshContext() {
    const context = useContext(RefreshContext);

    if (!context) {
        throw new Error(
            "useRefreshContext must be used inside a RefreshProvider"
        );
    }

    return context;
}