import { useTranslation } from "react-i18next";
import { Filter } from "../../types/filter/Filter.ts";
import React from "react";

interface FilterSelectionProps {
    filter: Filter;
}

const FilterLabel: React.FC<FilterSelectionProps> = ({ filter }) => {

    const { t }: { t: (key: string) => string } = useTranslation();

    return (
        <div className='relative'>
            <button 
                disabled
                className="w-fit h-6 m-0 mx-1 py-1 px-3 text-sm bg-none text-blue-500 dark:text-blue-300 rounded-full border-blue-500 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-600 bg-blue-100 dark:bg-blue-950 transition-all flex items-center justify-center" 
            >
            {t("raw_"+filter.property)}{filter.type.toString()}{filter.value}
            </button>
        </div>
    );
}

export default FilterLabel