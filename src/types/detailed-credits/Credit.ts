import {MoneyType} from "./MoneyType.ts";

export interface Credit {
    id: number,
    title: string,
    date: string,
    tableIds: number[],
    types: MoneyType[],
    totalAmount: number,
}