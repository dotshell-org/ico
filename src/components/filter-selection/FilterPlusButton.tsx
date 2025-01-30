import React, { useState } from 'react';
import Tooltip from '../Tooltip';
import SortOrFilterSwitch from './SortOrFilterSwitch';
import { useTranslation } from 'react-i18next';

interface FilterPlusButtonProps {
    alreadySorted: boolean;
}

const FilterPlusButton: React.FC<FilterPlusButtonProps> = ({ alreadySorted }) => {

    const { t } = useTranslation();
    const [showSelect, setShowSelect] = useState(false);

    return (
        <div className='relative'>
            <Tooltip text={t("raw_newFilter")}>
                <button 
                    className="w-6 h-6 m-0 mx-1 p-0 bg-none text-black dark:text-white rounded-full border-gray-400 transition-all flex items-center justify-center" 
                    onClick={() => setShowSelect(!showSelect)}
                >
                    +
                </button>
            </Tooltip>
            {showSelect && !alreadySorted && (
                <SortOrFilterSwitch />
            )}
        </div>
    );
};

export default FilterPlusButton;