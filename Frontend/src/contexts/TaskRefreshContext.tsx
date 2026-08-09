import { createContext, useContext, useState, type ReactNode } from "react";

interface TaskRefreshContextType {
    key: number;
    setKey: React.Dispatch<React.SetStateAction<number>>;
}

const TaskRefreshContext = createContext<TaskRefreshContextType | undefined>(undefined);

export function TaskRefreshProvider({ children }: { children: ReactNode }) {
    const [key, setKey] = useState<number>(0);

    return (
        <TaskRefreshContext.Provider
            value={
                {
                    key,
                    setKey,
                }
            }
        >
            {children}
        </TaskRefreshContext.Provider>
    );
}

export function useTaskRefreshContext() {
    const context = useContext(TaskRefreshContext);

    if (!context) {
        throw new Error(
            "useTaskRefreshContext must be used inside a TaskRefreshProvider"
        );
    }

    return context;
}