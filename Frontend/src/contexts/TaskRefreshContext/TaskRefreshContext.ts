import {
    createContext,
    type Dispatch,
    type SetStateAction,
} from "react";

export interface TaskRefreshContextType {
    key: number;
    setKey: Dispatch<SetStateAction<number>>;
}

export const TaskRefreshContext =
    createContext<TaskRefreshContextType | undefined>(undefined);