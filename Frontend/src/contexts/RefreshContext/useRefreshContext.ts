import { useContext } from "react";
import { RefreshContext } from "./RefreshContext";

export function useRefreshContext() {
    const context = useContext(RefreshContext);

    if (!context) {
        throw new Error(
            "useRefreshContext must be used inside a RefreshProvider"
        );
    }

    return context;
}