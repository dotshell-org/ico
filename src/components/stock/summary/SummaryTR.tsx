import React from "react";

interface MovementSummaryTRProps {
    content: string;
    isSelected?: boolean;
    movement: number;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const MovementSummaryTR: React.FC<MovementSummaryTRProps> = ({ content, isSelected, movement, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`w-1/5 border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm transition-all ring-inset hover:ring-1  cursor-copy select-none 
            ${
                isSelected ? ("text-white " + (movement > 0 ? "bg-green-500" : (movement < 0 ? "bg-red-500" : "bg-gray-400"))) : (movement > 0 ? "ring-green-500 text-green-600" : (movement < 0 ? "ring-red-500 text-red-600" : "ring-gray-400 text-gray-500"))
            }
            `}
        >
            {content}
        </td>
    );
};

export default MovementSummaryTR;