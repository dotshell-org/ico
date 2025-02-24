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

            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-28 ">
                {
                    Array.from({ length: 20 }, (_, i) => (
                        <tr>
                            <CreditMiniatureRow key={i} content={i.toString()} />
                        </tr>
                    ))
                }
            </table>
        </>
    );
}

export default DetailedCredits;