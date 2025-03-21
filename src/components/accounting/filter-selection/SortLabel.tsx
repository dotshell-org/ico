import React from "react";
import {Sort} from "../../../types/accounting/sort/Sort.ts";
import { t } from "i18next";

interface SortSelectionProps {
    sort: Sort;
    onRemove: (sort: Sort) => void;
}

const SortLabel: React.FC<SortSelectionProps> = ({ sort, onRemove }) => {
    return (
        <div className="w-fit h-6 m-0 mx-1 py-1 pl-3 pr-2.5 text-sm border text-orange-500 dark:text-orange-300 rounded-full border-orange-500 hover:border-orange-500 dark:border-orange-600 dark:hover:border-orange-600 bg-orange-100 dark:bg-orange-950 transition-all flex items-center justify-center">
          <span className="mr-1 select-none">
            {sort.orientation.toString()} {t(sort.property)}
          </span>
            <button
                onClick={() => onRemove(sort)}
                className="p-0 m-0 bg-transparent ring-0 border-none focus:outline-none"
            >
                &#x2715;
            </button>
        </div>
    );
}

export default SortLabel