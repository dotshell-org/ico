import React from "react";

interface CreditSummaryTRProps {
    content: string;
    isSelected?: boolean;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const CreditSummaryTR: React.FC<CreditSummaryTRProps> = ({ content, isSelected, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`w-1/4 border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm transition-all ring-inset hover:ring-1 ring-blue-500 cursor-copy select-none ${
                isSelected ? "bg-blue-500 text-white" : ""
            }`}
        >
            {content}
        </td>
    );
};

export default CreditSummaryTR;