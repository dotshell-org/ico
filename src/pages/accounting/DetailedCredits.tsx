import FilterSelection from "../../components/filter-selection/FilterSelection.tsx";
import {useState} from "react";
import {Filter} from "../../types/filter/Filter.ts";
import {Sort} from "../../types/sort/Sort.ts";
import {t} from "i18next";
import CreditMiniatureRow from "../../components/CreditMiniatureRow.tsx";

function DetailedCredits() {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([]);

    const handleFilterAdded = (filter: Filter) => {
        setFilters(prev => [...prev, filter]);
    }
    const handleFilterRemoved = (filter: Filter) => {
        setFilters(prev => prev.filter(f => f !== filter));
    }

    const handleSortAdded = (sort: Sort) => {
        setSorts(prev => [...prev, sort]);
    }
    const handleSortRemoved = (sort: Sort) => {
        setSorts(prev => prev.filter(s => s !== sort));
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("detailed_credits")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[60%]">
                        {t("raw_title")}
                    </div>
                    <div className="w-[20%]">
                        {t("raw_tables_types")}
                    </div>
                    <div className="w-[20%]">
                        {t("raw_total_amount")}
                    </div>
                </td>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-36 ">
                {
                    Array.from({ length: 50 }, (_) => (
                        <tr>
                            <CreditMiniatureRow />
                        </tr>
                    ))
                }
            </table>
        </>
    );
}

export default DetailedCredits;