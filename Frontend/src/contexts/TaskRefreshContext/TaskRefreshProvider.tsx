import { useState, type ReactNode } from "react";
import { TaskRefreshContext } from "./TaskRefreshContext";

export function TaskRefreshProvider({
    children,
}: {
    children: ReactNode;
}) {
    const [key, setKey] = useState(0);

    return (
        <TaskRefreshContext.Provider value={{ key, setKey }}>
            {children}
        </TaskRefreshContext.Provider>
    );
}