import {MoneyType} from "./MoneyType.js";

export interface CreditTableRow {
    id: number;
    amount: number;
    quantity: number;
}

export interface CreditTable {
    type: MoneyType;
    rows: CreditTableRow[];
}
