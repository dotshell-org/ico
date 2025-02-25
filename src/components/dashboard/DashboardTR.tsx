import React from "react";
import {DashboardCharts} from "../../types/dashboard/DashboardCharts.ts";

interface CreditSummaryTRProps {
    property: DashboardCharts | null;
    content: string;
    border: boolean;
}

const DashboardTR: React.FC<CreditSummaryTRProps> = ({ property, content, border }) => {
    const color =
        property === DashboardCharts.Credit
            ? "hover:text-red-500"
            : property === DashboardCharts.Debit
                ? "hover:text-blue-500"
                : property === DashboardCharts.Profit
                    ? "hover:text-violet-500"
                    : "";

    return (
        <td
            className={`w-1/4 border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm transition-all ${color} ${property === null && "cursor-default select-none"} ${property != null && "cursor-text"} ${!border && "border-0"} select-text`}
        >
            {content}
        </td>
    );
};

export default DashboardTR;