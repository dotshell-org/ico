import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CreditSummaryProperty } from "../../types/SummaryProperties";
import FilterSelection from "../../components/filter-selection/FilterSelection";
import SummaryTR from "../../components/summary/SummaryTR";
import SummaryTH from "../../components/summary/SummaryTH";

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
    // État pour stocker la colonne sélectionnée et les id des lignes sélectionnées
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    // On enregistre l'index de la dernière cellule sélectionnée
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        window.ipcRenderer
            .invoke("getCredits")
            .then((result: Credit[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Erreur lors de la récupération des crédits", error);
            });
    }, []);

    // Gestion du clic sur une cellule en gérant aussi la touche Shift.
    const handleCellClick = (
        event: React.MouseEvent<HTMLTableCellElement>,
        columnIndex: number,
        rowIndex: number,
        rowId: number
    ) => {
        // Si on clique sur une colonne différente
        if (selectedColumn !== null && selectedColumn !== columnIndex) {
            setSelectedColumn(columnIndex);
            setSelectedRows([rowId]);
            setLastSelectedIndex(rowIndex);
            return;
        }

        // Même colonne
        setSelectedColumn(columnIndex);

        if (event.shiftKey && lastSelectedIndex !== null) {
            // Si la touche Shift est enfoncée, on récupère la plage de sélection
            const start = Math.min(lastSelectedIndex, rowIndex);
            const end = Math.max(lastSelectedIndex, rowIndex);
            const idsToSelect = credits.slice(start, end + 1).map((credit) => credit.id);
            setSelectedRows(idsToSelect);
        } else {
            // Clique normal : toggle la sélection de la cellule cliquée
            if (selectedRows.includes(rowId)) {
                setSelectedRows(selectedRows.filter((id) => id !== rowId));
            } else {
                setSelectedRows([...selectedRows, rowId]);
            }
            setLastSelectedIndex(rowIndex);
        }
    };

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("credit")}</h1>
                <FilterSelection filters={[]} />
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                    <tr>
                        <SummaryTH property={CreditSummaryProperty.Date} />
                        <SummaryTH property={CreditSummaryProperty.Title} />
                        <SummaryTH property={CreditSummaryProperty.Amount} />
                        <SummaryTH property={CreditSummaryProperty.Category} />
                    </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
                <tbody>
                {credits.map((credit, index) => (
                    <tr key={credit.id}>
                        <SummaryTR
                            content={credit.date}
                            isSelected={selectedColumn === 0 && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, 0, index, credit.id)}
                        />
                        <SummaryTR
                            content={credit.title}
                            isSelected={selectedColumn === 1 && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, 1, index, credit.id)}
                        />
                        <SummaryTR
                            content={"€" + credit.amount.toFixed(2)}
                            isSelected={selectedColumn === 2 && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, 2, index, credit.id)}
                        />
                        <SummaryTR
                            content={credit.category}
                            isSelected={selectedColumn === 3 && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, 3, index, credit.id)}
                        />
                    </tr>
                ))}
                </tbody>
            </table>
            <div className="h-20"></div>
        </>
    );
}

export default CreditSummary;