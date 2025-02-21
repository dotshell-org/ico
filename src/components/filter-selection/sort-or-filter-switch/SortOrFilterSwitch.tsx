import React from "react";
import { useTranslation } from "react-i18next";

interface SortOrFilterSwitchProps {
    onClose: () => void;
    onClickSort: () => void;
    onClickFilter: () => void;
}

const SortOrFilterSwitch: React.FC<SortOrFilterSwitchProps> = ({ onClose, onClickSort, onClickFilter }) => {
    const { t } = useTranslation();

    return (
        <div
            onMouseLeave={onClose}
            className="absolute mt-2 w-fit shadow-lg bg-white rounded-md dark:bg-gray-800 dark:ring-1 dark:ring-gray-600 -translate-x-1/2 ml-4"
        >
            <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu" className="rounded-md w-fit overflow-hidden">
                <button
                    className="block w-full p-3 px-4 text-sm text-gray-700 bg-white hover:bg-gray-100 text-left border-none transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white whitespace-nowrap"
                    role="menuitem"
                    onClick={onClickSort}
                >
                    {t("sort")}
                </button>
                <button
                    className="block w-full p-3 px-4 text-sm text-gray-700 bg-white hover:bg-gray-100 text-left border-none transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white whitespace-nowrap"
                    role="menuitem"
                    onClick={onClickFilter}
                >
                    {t("filter")}
                </button>
            </div>
        </div>
    );
};

export default SortOrFilterSwitch;