import React from 'react';
import PlusButton from './PlusButton';

const FilterSelection: React.FC = () => {
    return (
        <div className="w-full h-6 my-4 inline-flex">
            <img src='/filter.svg' alt="Filter" className="w-6 h-6 mr-2" />
            <PlusButton />
        </div>
    );
};

export default FilterSelection;