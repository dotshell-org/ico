import React from "react";
import FilterPlusButton from "./FilterPlusButton";
import { Filter } from "../../types/filter/Filter";
import filterSvg from "/filter.svg";
import FilterLabel from "./FilterLabel";
import { Sort } from "../../types/sort/Sort";
import SortLabel from "./SortLabel";

interface FilterSelectionProps {
    filters: Filter[];
    sorts: Sort[];
    onAdded: (filter: Filter) => void;
    onRemoved: (filter: Filter) => void;
}

const FilterSelection: React.FC<FilterSelectionProps> = ({ filters, sorts, onAdded, onRemoved }) => {
    return (
        <div className="w-full h-6 my-4 inline-flex items-center">
            <img src={filterSvg} alt="Filter" className="w-6 h-6 mr-2" />
            {sorts.map((sort, index) => (
                <SortLabel key={index} sort={sort} />
            ))}
            {filters.map((filter, index) => (
                <FilterLabel key={index} filter={filter} onRemove={onRemoved} />
            ))}
            <FilterPlusButton onAdded={onAdded} />
        </div>
    );
};

export default FilterSelection;