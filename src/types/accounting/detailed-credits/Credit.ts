import {MoneyType} from "./MoneyType.js";

export interface Credit {
    category: string;
    id: number,
    title: string,
    date: string,
    tableIds: number[],
    types: MoneyType[],
    totalAmount: number,
}
