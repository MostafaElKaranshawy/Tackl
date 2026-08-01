import { createContext, useContext, useState, type ReactNode } from "react";

interface CurrentProjectContextType {
    projectId: string | null;
    setProjectId: React.Dispatch<React.SetStateAction<string | null>>;
}

const CurrentProjectContext = createContext<CurrentProjectContextType | undefined>(undefined);

export function CurrentProjectProvider({ children }: { children: ReactNode }) {
    const [projectId, setProjectId] = useState<string | null>(null);

    return (
        <CurrentProjectContext.Provider
            value={
                {
                    projectId,
                    setProjectId,
                }
            }
        >
            {children}
        </CurrentProjectContext.Provider>
    );
}

export function useCurrentProjectContext() {
    const context = useContext(CurrentProjectContext);

    if (!context) {
        throw new Error(
            "useCurrentProjectContext must be used inside a CurrentProjectProvider"
        );
    }

    return context;
}