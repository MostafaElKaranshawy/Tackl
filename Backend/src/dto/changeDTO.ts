import { ActionType } from "../enums/actionType";

export default interface ChangeDTO {
    fieldName: string;
    oldValue: string | null;
    newValue: string | null;
    actionType: ActionType;
}