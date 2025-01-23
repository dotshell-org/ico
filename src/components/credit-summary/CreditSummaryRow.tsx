import React from 'react';
import { CreditSummaryProperty } from '../../types/SummaryProperties';
import { useTranslation } from 'react-i18next';

interface CreditSummaryTHProps {
    property: CreditSummaryProperty;
}

const CreditSummaryTH: React.FC<CreditSummaryTHProps> = ({ property }) => {
    const { t } = useTranslation();
    return (
        <th className="border-gray-300 dark:border-gray-700 border text-center p-4 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 transition-all">{t(property)}</th>
    );
};

interface CreditSummaryTRProps {
    content: string;
}

const CreditSummaryTR: React.FC<CreditSummaryTRProps> = ({ content }) => {
    return (
        <td className="border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm">{content}</td>
    );
};

export { CreditSummaryTR, CreditSummaryTH };