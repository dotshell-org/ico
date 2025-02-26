import React, {useEffect, useState} from "react";
import {MoneyType} from "../../../types/detailed-credits/MoneyType.ts";
import CreditTH from "./CreditTH.tsx";
import {t} from "i18next";
import type {CreditTable, CreditTableRow} from "../../../types/detailed-credits/CreditTable.ts";

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
        } else if (type === MoneyType.Other) {
            return "money_other"
        }
        return ""
    }

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getCreditTableFromId", id)
            .then((result: CreditTable) => {
                setRows(result.rows);
                setType(result.type);
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
                {rows.map((row) => (
                    <>
                        <p>Id: {row.id}</p>
                        <p>Amount: {row.amount}</p>
                        <p>Quantity: {row.quantity}</p>
                    </>
                ))}
                </tbody>
            </table>
        </>
    )
}

export default CreditTable