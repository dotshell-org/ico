import {MoneyType} from "./MoneyType.ts";

export interface Credit {
    id: number,
    title: string,
    types: MoneyType[],
    totalAmount: number,
}