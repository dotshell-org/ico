import i18n, {t} from "i18next";
import React, {useEffect, useState} from "react";
import FilterSelection from "../../components/stock/filter-selection/FilterSelection.tsx";
import SummaryTH from "../../components/stock/summary/SummaryTH.tsx";
import {SummaryProperty} from "../../types/stock/summary/SummaryProperty.ts";
import {Filter} from "../../types/stock/summary/filter/Filter.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";
import {Sort} from "../../types/stock/summary/sort/Sort.ts";
import {Movement} from "../../types/stock/summary/Movement.ts";
import MovementSummaryTR from "../../components/stock/summary/SummaryTR.tsx";
import AggregationToolbar from "../../components/stock/summary/AggregationToolbar.tsx";

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language).format(date);
};

const StockMovementsSummary: React.FC = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [movements, setMovements] = useState<Movement[]>([]);

    const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

    const onFilterAdded = (filter: Filter) => {
        setFilters(prev => [...prev, filter]);
    }
    const onFilterRemoved = (filter: Filter) => {
        setFilters(prev => prev.filter(f => f !== filter));
    }

    const onSortAdded = (sort: Sort) => {
        setSorts(prev => [...prev, sort]);
    }
    const onSortRemoved = (sort: Sort) => {
        setSorts(prev => prev.filter(s => s !== sort));
    }

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getMovements", filters, sorts)
            .then((result: Movement[]) => {
                setMovements(result);
            })
            .catch((error: any) => {
                console.error("Error fetching movements", error);
            })
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
            const idsToSelect = movements.slice(start, end + 1).map((movement) => movement.id);
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
            ? movements
                .filter((movement) => selectedRows.includes(movement.id))
                .map((movement) => {
                    switch (selectedColumn) {
                        case 0:
                            return movement.stock_name;
                        case 1:
                            return movement.date;
                        case 2:
                            return movement.object;
                        case 3:
                            return movement.quantity.toString();
                        case 4:
                            return movement.movement.toString();
                        default:
                            return "";
                    }
                })
            : [];

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"🔄 " + t("movements")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={onFilterAdded} onRemovedFilter={onFilterRemoved} onAddedSort={onSortAdded} onRemovedSort={onSortRemoved} />
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                    <tr>
                        <SummaryTH property={SummaryProperty.Stock} />
                        <SummaryTH property={SummaryProperty.Date} />
                        <SummaryTH property={SummaryProperty.Object} />
                        <SummaryTH property={SummaryProperty.Quantity} />
                        <SummaryTH property={SummaryProperty.Movement} />
                    </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mt-40">
                <tbody>
                {movements.map((movement, index) => (
                    <tr key={movement.id} className="transition-all">
                        <MovementSummaryTR
                            content={movement.stock_name}
                            movement={movement.movement}
                            isSelected={selectedColumn === 0 && selectedRows.includes(movement.id)}
                            onClick={(event) => handleCellClick(event, 0, index, movement.id)}
                        />
                        <MovementSummaryTR
                            content={formatDate(movement.date)}
                            movement={movement.movement}
                            isSelected={selectedColumn === 1 && selectedRows.includes(movement.id)}
                            onClick={(event) => handleCellClick(event, 1, index, movement.id)}
                        />
                        <MovementSummaryTR
                            content={movement.object}
                            movement={movement.movement}
                            isSelected={selectedColumn === 2 && selectedRows.includes(movement.id)}
                            onClick={(event) => handleCellClick(event, 2, index, movement.id)}
                        />
                        <MovementSummaryTR
                            content={movement.quantity.toString()}
                            movement={movement.movement}
                            isSelected={selectedColumn === 3 && selectedRows.includes(movement.id)}
                            onClick={(event) => handleCellClick(event, 3, index, movement.id)}
                        />
                        <MovementSummaryTR
                            content={movement.movement > 0 ? `+${movement.movement}` : movement.movement.toString()}
                            movement={movement.movement}
                            isSelected={selectedColumn === 4 && selectedRows.includes(movement.id)}
                            onClick={(event) => handleCellClick(event, 4, index, movement.id)}
                        />
                    </tr>
                ))}
                </tbody>
            </table>

            <AggregationToolbar columnIndex={selectedColumn} values={selectedValues} />
            <div className="h-20"></div>
        </>
    );
};

export default StockMovementsSummary;