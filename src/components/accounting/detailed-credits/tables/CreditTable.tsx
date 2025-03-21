import React, { useEffect, useState, useMemo } from "react";
import { MoneyType } from "../../../../types/accounting/detailed-credits/MoneyType.ts";
import CreditTH from "./CreditTH.tsx";
import { t } from "i18next";
import type { CreditTable, CreditTableRow } from "../../../../types/accounting/detailed-credits/CreditTable.ts";
import CreditTR from "./CreditTR.tsx";
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {CheckIcon} from "@heroicons/react/16/solid";

interface CreditTableProps {
    id: number;
    handleRemoveTable: (id: number) => void;
}

const CreditTable: React.FC<CreditTableProps> = ({ id, handleRemoveTable }) => {
    const [rows, setRows] = useState<CreditTableRow[]>([]);
    const [type, setType] = useState<MoneyType>(MoneyType.Other);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newAmount, setNewAmount] = useState<number>(0);
    const [newQuantity, setNewQuantity] = useState<number>(1);
    const [editingRow, setEditingRow] = useState<number | null>(null);

    // Available denominations for coins and banknotes
    const coinDenominations = [2.00, 1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];
    const banknoteDenominations = [500, 200, 100, 50, 20, 10, 5];

    // Get available denominations not already in the rows
    const availableDenominations = useMemo(() => {
        if (type === MoneyType.Coins) {
            return coinDenominations.filter(
                denom => !rows.some(row => row.amount === denom)
            );
        } else if (type === MoneyType.Banknotes || type === MoneyType.Cheques) {
            return banknoteDenominations.filter(
                denom => !rows.some(row => row.amount === denom)
            );
        }
        return [];
    }, [rows, type]);

    const typeToEmoji = () => {
        if (type == MoneyType.Coins) {
            return "🪙"
        }
        else if (type == MoneyType.Banknotes) {
            return "💵";
        }
        else if (type == MoneyType.Cheques) {
            return "🖋";
        }
        else if (type == MoneyType.Other) {
            return "💳️";
        }
    }

    const typeToTitle = () => {
        if (type === MoneyType.Coins) {
            return "coins";
        } else if (type === MoneyType.Banknotes) {
            return "banknotes";
        } else if (type === MoneyType.Cheques) {
            return "cheques";
        }
        return "";
    };

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
        };
        return quantity * (weights[amount.toFixed(2)] || 0);
    };

    const sum = (numbers: number[]): number => {
        return numbers.reduce((acc, num) => acc + num, 0);
    };

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getCreditTableFromId", id)
            .then((result: CreditTable) => {
                const sortedRows = [...result.rows].sort((a, b) => b.amount - a.amount);
                setRows(sortedRows);
                setType(result.type);
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
        if (newAmount === null) return;

        (window as any).ipcRenderer
            .invoke("addCreditRow", id, newAmount, newQuantity)
            .then((newRow: CreditTableRow) => {
                setRows([...rows, newRow].sort((a, b) => b.amount - a.amount));
                setIsAdding(false);
                setNewAmount(0);
                setNewQuantity(0);
            })
            .catch((error: any) => {
                console.error("Error adding new row", error);
            });
    };

    const handleUpdateRow = (rowId: number, quantity: number) => {
        (window as any).ipcRenderer
            .invoke("updateCreditRow", rowId, quantity)
            .then(() => {
                setRows(rows.map(row =>
                    row.id === rowId ? { ...row, quantity } : row
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

    const handleDeleteTable = () => {
        // First remove from UI to maintain responsiveness
        handleRemoveTable(id);

        // Then delete from database
        (window as any).ipcRenderer
            .invoke("deleteCreditTable", id)
            .then(() => {
                console.log("Table deleted successfully!");
            })
            .catch((error: any) => {
                console.error("Error deleting table", error);
            });
    };

    return (
        type !== MoneyType.Other && <>
            <div className="flex items-center mt-2 mb-2">
                <h2 className="text-2xl cursor-default">{typeToEmoji()} {t(typeToTitle())}</h2>
                <button
                    onClick={handleDeleteTable}
                    className="p-1 ml-2 bg-gray-50 dark:bg-gray-900 text-red-500 hover:border-red-500 rounded-full"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
            <table className="w-full table-fixed border-white dark:border-gray-950 border-2 border-y-0 mb-10">
                <thead>
                    {type === MoneyType.Coins && (
                        <tr>
                            <CreditTH content={t("amount")} />
                            <CreditTH content={t("quantity")} />
                            <CreditTH content={t("total")} />
                            <CreditTH content={t("weight")} />
                            <CreditTH className="w-10" content={t("actions")} />
                        </tr>
                    )}
                    {(type === MoneyType.Banknotes || type === MoneyType.Cheques) && (
                        <tr>
                            <CreditTH content={t("amount")} />
                            <CreditTH content={t("quantity")} />
                            <CreditTH content={t("total")} />
                            <CreditTH className="w-10" content={t("actions")} />
                        </tr>
                    )}
                </thead>
                <tbody>
                    {rows.map((row) => {
                        return (
                            <tr key={row.id}>
                                <CreditTR pointer={false} border={true} content={"€" + row.amount.toFixed(2)} />
                                {editingRow === row.id ? (
                                    <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full p-1 pl-5 border rounded dark:bg-gray-900 dark:border-gray-600 text-center"
                                            value={newQuantity}
                                            onChange={(e) => setNewQuantity(parseInt(e.target.value) || 1)}
                                        />
                                    </td>
                                ) : (
                                    <CreditTR
                                        pointer={true}
                                        border={true}
                                        content={row.quantity.toString()}
                                        onClick={() => {
                                            setEditingRow(row.id);
                                            setNewQuantity(row.quantity);
                                            setIsAdding(false);
                                        }}
                                    />
                                )}
                                <CreditTR
                                    pointer={false}
                                    border={true}
                                    content={"€" + (row.amount * row.quantity).toFixed(2)}
                                />
                                {type === MoneyType.Coins && (
                                    <CreditTR
                                        pointer={false}
                                        border={true}
                                        content={computeWeight(row.amount, row.quantity).toFixed(2) + "g"}
                                    />
                                )}
                                <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                    {editingRow === row.id ? (
                                        <button
                                            className="w-full h-full m-0 rounded-none group text-blue-500 bg-white hover:bg-blue-500 dark:bg-gray-950 border-0 hover:text-white transition-colors duration-200"
                                            onClick={() => handleUpdateRow(row.id, newQuantity)}
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
                        );
                    })}

                    {isAdding && (
                        <tr>
                            <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                {
                                    type === MoneyType.Cheques ? (
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full p-1 pl-5 border rounded dark:bg-gray-900 dark:border-gray-600 text-center"
                                            value={newAmount || 0}
                                            onChange={(e) => {
                                                setNewAmount(parseFloat(e.target.value));
                                            }}
                                        />
                                    ) : (
                                        <select
                                                className="w-24 p-1 border rounded dark:bg-gray-800 dark:border-gray-600"
                                                value={newAmount || ""}
                                            onChange={(e) => setNewAmount(parseFloat(e.target.value))}
                                        >
                                            <option value="">Select</option>
                                            {availableDenominations.map((denom) => (
                                                <option key={denom} value={denom}>€{denom.toFixed(2)}</option>
                                            ))}
                                        </select>
                                    )
                                }
                            </td>
                            <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full p-1 pl-5 border rounded dark:bg-gray-900 dark:border-gray-600 text-center"
                                    value={newQuantity}
                                    onChange={(e) => {
                                        setNewQuantity(parseInt(e.target.value) || 0);
                                    }}
                                />
                            </td>
                            <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                {newAmount ? `€${(newAmount * newQuantity).toFixed(2)}` : "-"}
                            </td>
                            {type === MoneyType.Coins && (
                                <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                    {newAmount ? `${computeWeight(newAmount, newQuantity).toFixed(2)}g` : "-"}
                                </td>
                            )}
                            <td className="border-gray-300 dark:border-gray-700 border text-center p-0 text-sm">
                                <div className="flex justify-center space-x-2">
                                    <button
                                        className="w-full h-full m-0 rounded-none group text-green-500 bg-white hover:bg-green-500 dark:bg-gray-950 border-0 hover:text-white px-6 py-2 transition-colors duration-200 cursor-pointer"
                                        onClick={handleAddRow}
                                        disabled={!newAmount}
                                    >
                                        <PlusIcon className="h-4 w-4 mx-auto" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}

                    <tr>
                        <td
                            colSpan={type === MoneyType.Coins ? 5 : 4}
                            className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-t-2 text-center text-gray-500 dark:text-gray-400 p-0 text-sm transition-all select-none cursor-pointer"
                            onClick={() => {setIsAdding(true); setEditingRow(null)}}
                        >
                            <div className="flex justify-center items-center pr-1">
                                <PlusIcon className="h-8 w-4 mr-1" />
                                {t("new")}
                            </div>
                        </td>
                    </tr>

                    {rows.length > 0 && (
                        <tr className="border-t-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700">
                            <CreditTR pointer={false} border={false} content="" />
                            <CreditTR pointer={false} border={false} content={sum(rows.map(row => row.quantity)).toString()} />
                            <CreditTR pointer={false} border={false} content={"€" + sum(rows.map(row => row.amount * row.quantity)).toFixed(2)} />
                            {type === MoneyType.Coins && (
                                <CreditTR pointer={false} border={false} content={sum(rows.map(row => computeWeight(row.amount, row.quantity))).toFixed(2) + "g"} />
                            )}
                            <CreditTR pointer={false} border={false} content="" />
                        </tr>
                    )}
                </tbody>
            </table>
        </>
    );
};

export default CreditTable;