import React, { useState } from 'react';
import Tooltip from '../../Tooltip.tsx';
import SortOrFilterSwitch from './sort-or-filter-switch/SortOrFilterSwitch.tsx';
import { useTranslation } from 'react-i18next';
import SelectFilterInterface from "./sort-or-filter-switch/filter/SelectFilterInterface.tsx";
import {Filter} from "../../../types/stock/summary/filter/Filter.ts";
import SelectSortInterface from "./sort-or-filter-switch/sort/SelectSortInterface.tsx";
import {Sort} from "../../../types/stock/summary/sort/Sort.ts";

interface FilterPlusButtonProps {
    onAddedFilter: (filter: Filter) => void;
    onAddedSort: (sort: Sort) => void;
}

const FilterPlusButton: React.FC<FilterPlusButtonProps> = ({ onAddedFilter, onAddedSort }) => {
    const { t } = useTranslation();
    const [showSelect, setShowSelect] = useState(false);
    const [showSort, setShowSort] = useState(false);
    const [showFilter, setShowFilter] = useState(false);

    const handleToggleSelect = () => {
        setShowSelect(prev => !prev);
    };

    const handleCloseSwitch = () => {
        setShowSelect(false);
    };

    const handleShowSort = () => {
        setShowSort(true);
    }
    const handleOnAddedSort = (sort: Sort): void => {
        setShowSort(false);
        onAddedSort(sort);
    }

    const handleShowFilter = () => {
        setShowFilter(true);
    }
    const handleOnAddedFilter = (filter: Filter): void => {
        setShowFilter(false);
        onAddedFilter(filter);
    }

    return (
        <>
            <div className='relative'>
                <Tooltip text={t("new_filter")}>
                    <button
                        className="w-6 h-6 m-0 mx-1 p-0 bg-none text-black dark:text-white rounded-full border-gray-400 transition-all flex items-center justify-center"
                        onClick={handleToggleSelect}
                    >
                        +
                    </button>
                </Tooltip>
                {showSelect && (
                    <SortOrFilterSwitch onClose={handleCloseSwitch} onClickSort={handleShowSort} onClickFilter={handleShowFilter} />
                )}
            </div>
            {showSort && <SelectSortInterface onAdded={handleOnAddedSort} onClose={() => setShowSort(false)}/>}
            {showFilter && <SelectFilterInterface onAdded={handleOnAddedFilter} onClose={() => setShowFilter(false)} />}
        </>
    );
};

export default FilterPlusButton;