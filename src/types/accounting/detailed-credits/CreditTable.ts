import {MoneyType} from "./MoneyType";

export interface CreditTableRow {
    id: number;
    amount: number;
    quantity: number;
}

export interface CreditTable {
    type: MoneyType;
    rows: CreditTableRow[];
}
