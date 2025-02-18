import React from 'react';
import FilterPlusButton from './FilterPlusButton';
import { Filter } from '../../types/Filter';
import FilterLabel from './FilterLabel';
import { CreditSummaryProperty } from '../../types/SummaryProperties';

interface FilterSelectionProps {
    filters: Filter[];
}

const FilterSelection: React.FC<FilterSelectionProps> = ({ filters }) => {
    console.log(filters);
    return (
        <div className="w-full h-6 my-4 inline-flex">
            <img src='/filter.svg' alt="Filter" className="w-6 h-6 mr-2" />
            <FilterLabel filter={{ property: CreditSummaryProperty.Amount, value: "€30.00" }}/>
            <FilterPlusButton alreadySorted={false} />
        </div>
    );
};

export default FilterSelection;