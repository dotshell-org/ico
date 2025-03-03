import React, { useEffect, useState } from "react";
import CreditTH from "./CreditTH.tsx";
import { t } from "i18next";
import type { CreditTable, CreditTableRow } from "../../../types/detailed-credits/CreditTable.ts";
import CreditTR from "./CreditTR.tsx";
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {CheckIcon} from "@heroicons/react/16/solid";

interface CreditTableProps {
    id: number;
}

const OtherMoneyCreditTable: React.FC<CreditTableProps> = ({ id }) => {
    const [rows, setRows] = useState<CreditTableRow[]>([]);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newAmount, setNewAmount] = useState<number>(0);
    const [editingRow, setEditingRow] = useState<number | null>(null);
    const [editAmount, setEditAmount] = useState<number>(0);

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getOtherMoneyCreditsFromId", id)
            .then((result: CreditTable) => {
                setRows(result.rows);
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [id]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsAdding(false);
                setEditingRow(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const handleAddRow = () => {
        if (newAmount <= 0) return;

        (window as any).ipcRenderer
            .invoke("addOtherCreditRow", id, newAmount)
            .then((newRow: CreditTableRow) => {
                setRows([...rows, newRow]);
                setIsAdding(false);
                setNewAmount(0);
            })
            .catch((error: any) => {
                console.error("Error adding new row", error);
            });
    };

    const handleUpdateRow = (rowId: number) => {
        if (editAmount <= 0) return;

        (window as any).ipcRenderer
            .invoke("updateOtherCreditRow", rowId, editAmount)
            .then(() => {
                setRows(rows.map(row =>
                    row.id === rowId ? { ...row, amount: editAmount } : row
                ));
                setEditingRow(null);
            })
            .catch((error: any) => {
                console.error("Error updating row", error);
            });
    };

    const handleDeleteRow = (rowId: number) => {
        (window as any).ipcRenderer
            .invoke("deleteCreditRow", rowId)
            .then(() => {
                setRows(rows.filter(row => row.id !== rowId));
            })
            .catch((error: any) => {
                console.error("Error deleting row", error);
            });
    };

    return (
        <>
            <h2 className="text-2xl mt-2 mb-2 cursor-default">{t("money_other")}</h2>
            <table className="w-full table-fixed border-white dark:border-gray-950 border-2 border-y-0 mb-10">
                <thead>
                    <CreditTH content="Amount" />
                    <CreditTH content="Actions" />
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.id}>
                            {editingRow === row.id ? (
                                <td className="w-1/2 border-gray-300 dark:border-gray-700 border text-center text-sm">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        className="w-full p-1 border rounded dark:bg-gray-900 dark:border-gray-600 text-center"
                                        value={editAmount}
                                        onChange={(e) => setEditAmount(parseFloat(e.target.value) || 0)}
                                    />
                                </td>
                            ) : (
                                <CreditTR
                                    border={true}
                                    pointer={false}
                                    content={"€" + row.amount.toFixed(2)}
                                    onClick={() => {
                                        setEditingRow(row.id);
                                        setEditAmount(row.amount);
                                    }}
                                />
                            )}
                            <td className="w-1/2 border-gray-300 dark:border-gray-700 border text-center text-sm">
                                {editingRow === row.id ? (
                                    <button
                                        className="w-full h-full m-0 rounded-none group text-blue-500 bg-white hover:bg-blue-500 dark:bg-gray-950 border-0 hover:text-white transition-colors duration-200"
                                        onClick={() => handleUpdateRow(row.id)}
                                    >
                                        <CheckIcon className="h-4 w-4 mx-auto" />
                                    </button>
                                ) : (
                                    <button
                                        className="w-full h-full m-0 rounded-none group text-red-500 bg-white hover:bg-red-500 dark:bg-gray-950 border-0 hover:text-white transition-colors duration-200"
                                        onClick={() => handleDeleteRow(row.id)}
                                    >
                                        <XMarkIcon className="h-4 w-4 mx-auto" />
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}

                    {isAdding && (
                        <tr>
                            <td className="w-1/2 border-gray-300 dark:border-gray-700 border text-center text-sm">
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    className="w-full p-1 border rounded dark:bg-gray-900 dark:border-gray-600 text-center"
                                    value={newAmount || ""}
                                    onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                                    placeholder="Enter amount"
                                />
                            </td>
                            <td className="w-1/2 border-gray-300 dark:border-gray-700 border text-center text-sm">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        className="w-full h-full m-0 rounded-none group text-green-500 bg-white hover:bg-green-500 dark:bg-gray-950 border-0 hover:text-white px-6 py-2 transition-colors duration-200 cursor-pointer"
                                        onClick={handleAddRow}
                                        disabled={newAmount <= 0}
                                    >
                                        <PlusIcon className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td
                            colSpan={2}
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-t-2 text-center text-gray-500 dark:text-gray-400 p-1.5 text-sm transition-all select-none cursor-pointer"
                            onClick={() => setIsAdding(true)}
                        >
                            <div className="flex justify-center items-center">
                                <PlusIcon className="h-4 w-4 mr-1" />
                                {t("raw_new")}
                            </div>
                        </td>
                    </tr>

                    {rows.length > 0 && (
                        <tr className="border-t-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-900">
                            <CreditTR
                                border={false}
                                pointer={false}
                                content={"€" + rows.reduce((sum, row) => sum + row.amount, 0).toFixed(2)}
                            />
                            <CreditTR border={false} pointer={false} content="" />
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
};

export default OtherMoneyCreditTable;