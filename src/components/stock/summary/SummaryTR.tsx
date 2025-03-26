import React from "react";

interface MovementSummaryTRProps {
    content: string;
    isSelected?: boolean;
    positive: boolean;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const MovementSummaryTR: React.FC<MovementSummaryTRProps> = ({ content, isSelected, positive, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`w-1/4 border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm transition-all ring-inset hover:ring-1  cursor-copy select-none 
            ${
                isSelected ? ("text-white " + (positive ? "bg-green-500" : "bg-red-500")) : (positive ? "ring-green-500 text-green-600" : "ring-red-500 text-red-600")
            }
            `}
        >
            {content}
        </td>
    );
};

export default MovementSummaryTR;