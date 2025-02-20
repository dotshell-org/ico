import React from 'react';
import FilterPlusButton from './FilterPlusButton';
import { Filter } from '../../types/filter/Filter.ts';
import filterSvg from '/filter.svg'
import FilterLabel from "./FilterLabel.tsx";
import {Sort} from "../../types/sort/Sort.ts";
import SortLabel from "./SortLabel.tsx";

interface FilterSelectionProps {
    filters: Filter[];
    sorts: Sort[];
}

const FilterSelection: React.FC<FilterSelectionProps> = ({ filters, sorts }) => {
    console.log(filters);
    return (
        <div className="w-full h-6 my-4 inline-flex">
            <img src={filterSvg} alt="Filter" className="w-6 h-6 mr-2" />
            {
                sorts.map((sort) => <SortLabel sort={sort} />)
            }
            {
                filters.map((filter) => <FilterLabel filter={filter} />)
            }
            <FilterPlusButton alreadySorted={false} />
        </div>
    );
};

export default FilterSelection;