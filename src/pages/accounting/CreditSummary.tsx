import {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {SummaryProperty, SummaryPropertyIndex} from "../../types/SummaryProperties";
import FilterSelection from "../../components/filter-selection/FilterSelection";
import SummaryTR from "../../components/summary/SummaryTR";
import SummaryTH from "../../components/summary/SummaryTH";
import AggregationToolbar from "../../components/summary/AggregationToolbar";
import {Filter} from "../../types/filter/Filter.ts";
import {Sort} from "../../types/sort/Sort.ts";
import {SortType} from "../../types/sort/SortType.ts";
import {FilterType} from "../../types/filter/FilterType.ts";

interface Credit {
    id: number;
    date: string;
    title: string;
    amount: number;
    category: string;
}

function CreditSummary() {
    const { t, i18n } = useTranslation();
    const [credits, setCredits] = useState<Credit[]>([]);
    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([]);

    useEffect(() => {
        setFilters([{property: SummaryProperty.Amount, type: FilterType.LessThan, value: 80}])
        setSorts([{property: SummaryProperty.Category, type: SortType.Asc}])
    }, []);

    useEffect(() => {
        window.ipcRenderer
            .invoke("getCredits", filters, sorts)
            .then((result: Credit[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Erreur lors de la récupération des crédits", error);
            });
    }, [filters, sorts]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setSelectedColumn(null);
                setSelectedRows([]);
                setLastSelectedIndex(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(i18n.language).format(date);
    };

    const handleCellClick = (
        event: React.MouseEvent<HTMLTableCellElement>,
        columnIndex: number,
        rowIndex: number,
        rowId: number
    ) => {
        if (selectedColumn !== null && selectedColumn !== columnIndex) {
            setSelectedColumn(columnIndex);
            setSelectedRows([rowId]);
            setLastSelectedIndex(rowIndex);
            return;
        }

        setSelectedColumn(columnIndex);

        if (event.shiftKey && lastSelectedIndex !== null) {
            const start = Math.min(lastSelectedIndex, rowIndex);
            const end = Math.max(lastSelectedIndex, rowIndex);
            const idsToSelect = credits.slice(start, end + 1).map((credit) => credit.id);
            setSelectedRows(idsToSelect);
        } else {
            if (selectedRows.includes(rowId)) {
                setSelectedRows(selectedRows.filter((id) => id !== rowId));
            } else {
                setSelectedRows([...selectedRows, rowId]);
            }
            setLastSelectedIndex(rowIndex);
        }
    };

    const selectedValues =
        selectedColumn !== null
            ? credits
                .filter((credit) => selectedRows.includes(credit.id))
                .map((credit) => {
                    switch (selectedColumn) {
                        case 0:
                            return formatDate(credit.date);
                        case 1:
                            return credit.title;
                        case 2:
                            return credit.amount.toString();
                        case 3:
                            return credit.category;
                        default:
                            return "";
                    }
                })
            : [];
    
    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("credit")}</h1>
                <FilterSelection filters={filters} sorts={sorts} />
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                    <tr>
                        <SummaryTH property={SummaryProperty.Date} />
                        <SummaryTH property={SummaryProperty.Title} />
                        <SummaryTH property={SummaryProperty.Amount} />
                        <SummaryTH property={SummaryProperty.Category} />
                    </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
                <tbody>
                {credits.map((credit, index) => (
                    <tr key={credit.id}>
                        <SummaryTR
                            content={formatDate(credit.date)}
                            isSelected={selectedColumn === SummaryPropertyIndex.Date && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, SummaryPropertyIndex.Date, index, credit.id)}
                        />
                        <SummaryTR
                            content={credit.title}
                            isSelected={selectedColumn === SummaryPropertyIndex.Title && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, SummaryPropertyIndex.Title, index, credit.id)}
                        />
                        <SummaryTR
                            content={"€" + credit.amount.toFixed(2)}
                            isSelected={selectedColumn === SummaryPropertyIndex.Amount && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, SummaryPropertyIndex.Amount, index, credit.id)}
                        />
                        <SummaryTR
                            content={credit.category}
                            isSelected={selectedColumn === SummaryPropertyIndex.Category && selectedRows.includes(credit.id)}
                            onClick={(event) => handleCellClick(event, SummaryPropertyIndex.Category, index, credit.id)}
                        />
                    </tr>
                ))}
                </tbody>
            </table>

            <AggregationToolbar columnIndex={selectedColumn} values={selectedValues} />
            <div className="h-20"></div>
        </>
    );
}

export default CreditSummary;