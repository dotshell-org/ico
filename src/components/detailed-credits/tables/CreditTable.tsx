import React, {useEffect, useState} from "react";
import {MoneyType} from "../../../types/detailed-credits/MoneyType.ts";
import CreditTH from "./CreditTH.tsx";
import {t} from "i18next";
import type {CreditTable, CreditTableRow} from "../../../types/detailed-credits/CreditTable.ts";
import CreditTR from "./CreditTR.tsx";

interface CreditTableProps {
    id: number;
}

const CreditTable: React.FC<CreditTableProps> = ({ id }) => {
    const [rows, setRows] = useState<CreditTableRow[]>([]);
    const [type, setType] = useState<MoneyType>(MoneyType.Other);

    const typeToTitle = () => {
        if (type === MoneyType.Coins) {
            return "coins";
        } else if (type === MoneyType.Banknotes) {
            return "banknotes";
        } else if (type === MoneyType.Cheques) {
            return "cheques";
        }
        return ""
    }

    const computeWeight = (amount: number, quantity: number) => {
        const weights: Record<string, number> = {
            "2.00": 8.5,
            "1.00": 7.5,
            "0.50": 7.8,
            "0.20": 5.7,
            "0.10": 4.1,
            "0.05": 3.9,
            "0.02": 3.0,
            "0.01": 2.3,
        }
        return (amount * quantity * weights[amount.toFixed(2)]).toFixed(2) + "g";
    }

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getCreditTableFromId", id)
            .then((result: CreditTable) => {
                setRows(result.rows);
                setType(result.type);
                if (type === MoneyType.Other) return null;
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [id]);

    return (
        <>
            <h2 className="text-2xl mt-2 mb-2 cursor-default">{t(typeToTitle())}</h2>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mb-10">
                <thead>
                    {type === MoneyType.Coins && (
                        <>
                            <CreditTH content={"Amount"} />
                            <CreditTH content={"Quantity"} />
                            <CreditTH content={"Total"} />
                            <CreditTH content={"Weight"} />
                        </>
                    )}
                    {type === MoneyType.Banknotes && (
                        <>
                            <CreditTH content={"Amount"} />
                            <CreditTH content={"Quantity"} />
                            <CreditTH content={"Total"} />
                        </>
                    )}
                    {type === MoneyType.Cheques && (
                        <>
                            <CreditTH content={"Amount"} />
                            <CreditTH content={"Quantity"} />
                            <CreditTH content={"Total"} />
                        </>
                    )}
                </thead>
                <tbody>
                    {rows.map((row) => {
                        if (type === MoneyType.Coins) {
                            return (
                                <tr>
                                    <CreditTR content={"€" + row.amount.toFixed(2).toString()} />
                                    <CreditTR content={row.quantity.toString()} />
                                    <CreditTR content={"€" + (row.amount * row.quantity).toFixed(2).toString()} />
                                    <CreditTR content={computeWeight(row.amount, row.quantity).toString()} />
                                </tr>
                            );
                        } else if (type === MoneyType.Banknotes) {
                            return (
                                <tr>
                                    <CreditTR content={"€" + row.amount.toFixed(2).toString()} />
                                    <CreditTR content={row.quantity.toString()} />
                                    <CreditTR content={"€" + (row.amount * row.quantity).toFixed(2).toString()} />
                                </tr>
                            );
                        } else if (type === MoneyType.Cheques) {
                            return (
                                <tr>
                                    <CreditTR content={"€" + row.amount.toFixed(2).toString()} />
                                    <CreditTR content={row.quantity.toString()} />
                                    <CreditTR content={"€" + (row.amount * row.quantity).toFixed(2).toString()} />
                                </tr>
                            )
                        }
                        return null;
                    })}
                    {(type !== MoneyType.Other && <tr>
                        <td
                            colSpan={4}
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-t-2 text-center text-gray-500 dark:text-gray-400 p-1.5 text-sm transition-all select-none cursor-pointer">
                            {t("raw_new")}
                        </td>
                    </tr>)}
                </tbody>
            </table>
        </>
    )
}

export default CreditTable