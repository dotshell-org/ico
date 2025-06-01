import {MoneyType} from "./MoneyType";

export interface Credit {
    category: string;
    id: number,
    title: string,
    date: string,
    tableIds: number[],
    types: MoneyType[],
    totalAmount: number,
}
