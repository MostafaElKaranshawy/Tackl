import { useContext } from "react";
import { TaskRefreshContext } from "./TaskRefreshContext";

export function useTaskRefreshContext() {
    const context = useContext(TaskRefreshContext);

    if (!context) {
        throw new Error(
            "useTaskRefreshContext must be used inside a TaskRefreshProvider"
        );
    }

    return context;
}