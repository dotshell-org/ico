import React from 'react';
import FilterPlusButton from './FilterPlusButton';
import { Filter } from '../../types/Filter';
import filterSvg from '/filter.svg'

interface FilterSelectionProps {
    filters: Filter[];
}

const FilterSelection: React.FC<FilterSelectionProps> = ({ filters }) => {
    console.log(filters);
    return (
        <div className="w-full h-6 my-4 inline-flex">
            <img src={filterSvg} alt="Filter" className="w-6 h-6 mr-2" />
            <FilterPlusButton alreadySorted={false} />
        </div>
    );
};

export default FilterSelection;