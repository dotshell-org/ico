import {MoneyType} from "./MoneyType.ts";

export interface Credit {
    id: number,
    title: string,
    tableIds: number[],
    types: MoneyType[],
    totalAmount: number,
}