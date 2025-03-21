import React from "react";
import FilterPlusButton from "./FilterPlusButton.tsx";
import { Filter } from "../../../types/accounting/filter/Filter.ts";
import filterSvg from "/filter.svg";
import FilterLabel from "./FilterLabel.tsx";
import { Sort } from "../../../types/accounting/sort/Sort.ts";
import SortLabel from "./SortLabel.tsx";

interface FilterSelectionProps {
    filters: Filter[];
    sorts: Sort[];
    onAddedFilter: (filter: Filter) => void;
    onRemovedFilter: (filter: Filter) => void;
    onAddedSort: (sort: Sort) => void;
    onRemovedSort: (sort: Sort) => void;
}

const FilterSelection: React.FC<FilterSelectionProps> = ({ filters, sorts, onAddedFilter, onRemovedFilter, onAddedSort, onRemovedSort }) => {
    return (
        <div className="w-full h-6 my-4 inline-flex items-center">
            <img src={filterSvg} alt="Filter" className="w-6 h-6 mr-2" />
            {sorts.map((sort, index) => (
                <SortLabel key={index} sort={sort} onRemove={onRemovedSort} />
            ))}
            {filters.map((filter, index) => (
                <FilterLabel key={index} filter={filter} onRemove={onRemovedFilter} />
            ))}
            <FilterPlusButton onAddedFilter={onAddedFilter} onAddedSort={onAddedSort}/>
        </div>
    );
};

export default FilterSelection;