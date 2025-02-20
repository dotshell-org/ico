import { useTranslation } from "react-i18next";

import React from "react";
import {Sort} from "../../types/sort/Sort.ts";

interface SortSelectionProps {
    sort: Sort;
}

const SortLabel: React.FC<SortSelectionProps> = ({ sort }) => {

    const { t }: { t: (key: string) => string } = useTranslation();

    return (
        <div className='relative'>
            <button
                disabled
                className="w-fit h-6 m-0 mx-1 py-1 px-3 text-sm bg-none text-orange-500 dark:text-orange-300 rounded-full border-orange-500 hover:border-orange-500 dark:border-orange-600 dark:hover:border-orange-600 bg-orange-100 dark:bg-orange-950 transition-all flex items-center justify-center"
            >
                {sort.type.toString()} {t("raw_"+sort.property)}
            </button>
        </div>
    );
}

export default SortLabel