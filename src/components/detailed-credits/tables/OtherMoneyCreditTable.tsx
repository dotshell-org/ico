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

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getOtherMoneyCreditsFromId", id)
            .then((result: CreditTable) => {
                setRows(result.rows);
                if (result.type !== MoneyType.Other) return null;
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [id]);

    return (
        <>
            <h2 className="text-2xl mt-2 mb-2 cursor-default">{t("money_other")}</h2>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mb-10">
                <thead>
                    <CreditTH content={"Amount"} />
                </thead>
                <tbody>
                    {rows.map((row) => {
                        return <tr>
                            <CreditTR content={"€" + row.amount.toFixed(2).toString()} />
                        </tr>
                    })}
                    <tr>
                        <td
                            colSpan={4}
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-t-2 text-center text-gray-500 dark:text-gray-400 p-1.5 text-sm transition-all select-none cursor-pointer">
                            {t("raw_new")}
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}

export default CreditTable