// CreditSummary.tsx

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditSummaryTR, CreditSummaryTH } from "../../components/credit-summary/CreditSummaryRow";
import { CreditSummaryProperty } from "../../types/SummaryProperties";
import FilterSelection from "../../components/filter-selection/FilterSelection";

// Définition du type d'un crédit (correspond aux colonnes de la table)
interface Credit {
    id: number;
    date: string;
    title: string;
    amount: number;
    category: string;
}

function CreditSummary() {
    const { t } = useTranslation();
    const [credits, setCredits] = useState<Credit[]>([]);

    useEffect(() => {
        // Utilisation de l'API exposée via le preload pour récupérer les crédits
        window.ipcRenderer.invoke("getCredits")
            .then((result: Credit[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Erreur lors de la récupération des crédits", error);
            });
    }, []);

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("credit")}</h1>
                <FilterSelection filters={[]} />
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                    <tr>
                        <CreditSummaryTH property={CreditSummaryProperty.Date} />
                        <CreditSummaryTH property={CreditSummaryProperty.Title} />
                        <CreditSummaryTH property={CreditSummaryProperty.Amount} />
                        <CreditSummaryTH property={CreditSummaryProperty.Category} />
                    </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
                <tbody>
                {credits.map((credit) => (
                    <tr key={credit.id}>
                        <CreditSummaryTR content={credit.date} />
                        <CreditSummaryTR content={credit.title} />
                        <CreditSummaryTR content={credit.amount.toString()} />
                        <CreditSummaryTR content={credit.category} />
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="h-20"></div>
        </>
    );
}

export default CreditSummary;