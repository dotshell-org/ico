import React, { useEffect, useState, useMemo } from "react";
import { MoneyType } from "../../../types/detailed-credits/MoneyType";
import CreditTH from "./CreditTH";
import { t } from "i18next";
import type { CreditTable, CreditTableRow } from "../../../types/detailed-credits/CreditTable";
import CreditTR from "./CreditTR";

interface CreditTableProps {
    id: number;
}

const CreditTable: React.FC<CreditTableProps> = ({ id }) => {
    const [rows, setRows] = useState<CreditTableRow[]>([]);
    const [type, setType] = useState<MoneyType>(MoneyType.Other);

    // Définition des dénominations possibles pour les pièces et billets
    const coinDenominations = [2.00, 1.00, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01];
    const banknoteDenominations = [500, 200, 100, 50, 20, 10, 5];

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
        return amount * quantity * (weights[amount.toFixed(2)] || 0);
    };

    const sum = (numbers: number[]): number => {
        return numbers.reduce((acc, num) => acc + num, 0);
    };

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

    // Calcul d'un tableau complet qui contient toutes les dénominations avec 0 en quantité si manquant
    const completeRows: { amount: number; quantity: number }[] | CreditTableRow[] = useMemo(() => {
        if (type === MoneyType.Coins) {
            return coinDenominations.map((denom) => {
                return (
                    rows.find(r => r.amount === denom) || { amount: denom, quantity: 0 }
                );
            });
        } else if (type === MoneyType.Banknotes || type === MoneyType.Cheques) {
            return banknoteDenominations.map((denom) => {
                return (
                    rows.find(r => r.amount === denom) || { amount: denom, quantity: 0 }
                );
            });
        }
        return rows;
    }, [rows, type]);

    return (
        <>
            <h2 className="text-2xl mt-2 mb-2 cursor-default">{t(typeToTitle())}</h2>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mb-10">
                <thead>
                {type === MoneyType.Coins && (
                    <>
                        <CreditTH content="Amount" />
                        <CreditTH content="Quantity" />
                        <CreditTH content="Total" />
                        <CreditTH content="Weight" />
                    </>
                )}
                {(type === MoneyType.Banknotes || type === MoneyType.Cheques) && (
                    <>
                        <CreditTH content="Amount" />
                        <CreditTH content="Quantity" />
                        <CreditTH content="Total" />
                    </>
                )}
                </thead>
                <tbody>
                {completeRows.map((row, index) => {
                    if (type === MoneyType.Coins) {
                        return (
                            <tr key={index}>
                                <CreditTR border={true} content={"€" + row.amount.toFixed(2)} />
                                <CreditTR border={true} content={row.quantity == 0 ? "-" : row.quantity.toString()} />
                                <CreditTR border={true} content={row.quantity == 0 ? "-" : "€" + (row.amount * row.quantity).toFixed(2)} />
                                <CreditTR border={true} content={row.quantity == 0 ? "-" : computeWeight(row.amount, row.quantity).toFixed(2) + "g"} />
                            </tr>
                        );
                    } else if (type === MoneyType.Banknotes || type === MoneyType.Cheques) {
                        return (
                            <tr key={index}>
                                <CreditTR border={true} content={"€" + row.amount.toFixed(2)} />
                                <CreditTR border={true} content={row.quantity == 0 ? "-" : row.quantity.toString()} />
                                <CreditTR border={true} content={row.quantity == 0 ? "-" : "€" + (row.amount * row.quantity).toFixed(2)} />
                            </tr>
                        );
                    }
                    return null;
                })}
                {type === MoneyType.Coins && (
                    <tr className="border-t-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700">
                        <CreditTR border={false} content="" />
                        <CreditTR border={false} content={sum(completeRows.map(row => row.quantity)).toString()} />
                        <CreditTR border={false} content={"€" + sum(completeRows.map(row => row.amount * row.quantity)).toFixed(2)} />
                        <CreditTR border={false} content={sum(completeRows.map(row => computeWeight(row.amount, row.quantity))).toFixed(2) + "g"} />
                    </tr>
                )}
                {(type === MoneyType.Banknotes || type === MoneyType.Cheques) && (
                    <tr className="border-t-2 text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-700">
                        <CreditTR border={false} content="" />
                        <CreditTR border={false} content={sum(completeRows.map(row => row.quantity)).toString()} />
                        <CreditTR border={false} content={"€" + sum(completeRows.map(row => row.amount * row.quantity)).toFixed(2)} />
                    </tr>
                )}
                </tbody>
            </table>
        </>
    );
};

export default CreditTable;