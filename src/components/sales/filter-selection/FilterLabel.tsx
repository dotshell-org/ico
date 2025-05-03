import React from "react";
import { Filter } from "../../../types/sales/summary/filter/Filter.ts";
import { t } from "i18next";

interface FilterLabelProps {
    filter: Filter;
    onRemove: (filter: Filter) => void;
}

const FilterLabel: React.FC<FilterLabelProps> = ({ filter, onRemove }) => {
    return (
        <div className="w-fit h-6 m-0 mx-1 py-1 pl-3 pr-2.5 text-sm border text-blue-500 dark:text-blue-300 rounded-full border-blue-500 hover:border-blue-500 dark:border-blue-600 dark:hover:border-blue-600 bg-blue-100 dark:bg-blue-950 transition-all flex items-center justify-center">
          <span className="mr-1 select-none">
            {t(filter.property)}{filter.operator.toString()}{filter.value}
          </span>
            <button
                onClick={() => onRemove(filter)}
                className="p-0 m-0 bg-transparent ring-0 border-none focus:outline-none"
            >
                &#x2715;
            </button>
        </div>
    );
};

export default FilterLabel;