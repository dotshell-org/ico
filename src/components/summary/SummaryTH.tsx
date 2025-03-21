import React from 'react';
import {SummaryProperty} from '../../types/summary/SummaryProperty.ts';
import {useTranslation} from 'react-i18next';

interface SummaryTHProps {
    property: SummaryProperty;
}

const SummaryTH: React.FC<SummaryTHProps> = ({ property }) => {
    const { t }: { t: (key: string) => string } = useTranslation();
    
    const propertyToEmoji = () => {
        switch (property) {
            case SummaryProperty.Date:
                return "📅";
            case SummaryProperty.Title:
                return "🏷️";
            case SummaryProperty.Amount:
                return "\uD83D\uDCB0";
            case SummaryProperty.Category:
                return "📑";
        }
    }
    
    return (
        <th className="w-1/4 border-gray-300 dark:border-gray-700 border text-center p-4 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 transition-all">{propertyToEmoji()} {t(property)}</th>
    );
};

export default SummaryTH;