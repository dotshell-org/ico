import { t } from "i18next";
import React, {useState} from "react";
import FilterSelection from "../../components/stock/filter-selection/FilterSelection.tsx";
import SummaryTH from "../../components/stock/summary/SummaryTH.tsx";
import {SummaryProperty} from "../../types/stock/summary/SummaryProperty.ts";
import {Filter} from "../../types/stock/summary/filter/Filter.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";
import {Sort} from "../../types/stock/summary/sort/Sort.ts";

const StockMovementsSummary: React.FC = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);

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

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"🔄 " + t("movements")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={onFilterAdded} onRemovedFilter={onFilterRemoved} onAddedSort={onSortAdded} onRemovedSort={onSortRemoved} />
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                    <tr>
                        <SummaryTH property={SummaryProperty.Date} />
                        <SummaryTH property={SummaryProperty.Object} />
                        <SummaryTH property={SummaryProperty.Amount} />
                        <SummaryTH property={SummaryProperty.Movement} />
                    </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
                <tbody>

                </tbody>
            </table>

            <div className="h-20"></div>
        </>
    );
};

export default StockMovementsSummary;