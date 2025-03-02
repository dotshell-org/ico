import React from "react";

interface CreditTRProps {
    pointer: boolean;
    border: boolean;
    content: string;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const CreditTR: React.FC<CreditTRProps> = ({ pointer, border, content, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`${pointer && 'cursor-pointer'} border-gray-300 dark:border-gray-700 ${border && "border"} text-center p-1.5 text-sm transition-all select-none`}
        >
            {content}
        </td>
    );
};

export default CreditTR;