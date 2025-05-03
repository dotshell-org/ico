import React from "react";
import {SummaryProperty} from "../../../types/sales/summary/SummaryProperty.ts";
import {useTranslation} from "react-i18next";

const SalesSummaryTH: React.FC<{ property: SummaryProperty }> = ({ property }) => {
    const { t } = useTranslation();

    const propertyToEmoji = () => {
        switch (property) {
            case SummaryProperty.Date:
                return "📅";
            case SummaryProperty.Object:
                return "🛒";
            case SummaryProperty.Quantity:
                return "🔢";
            case SummaryProperty.Price:
                return "💰";
            case SummaryProperty.Total:
                return "➕";
            case SummaryProperty.Stock:
                return "📦";
        }
    };

    return (
        <th className="w-1/6 border-gray-300 dark:border-gray-700 border text-center p-4 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white hover:bg-gray-100 dark:bg-gray-950 dark:hover:bg-gray-900 transition-all">
            {propertyToEmoji()} {t(property)}
        </th>
    );
};

export default SalesSummaryTH;