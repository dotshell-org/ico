import React from "react";

interface CreditTRProps {
    content: string;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const CreditTR: React.FC<CreditTRProps> = ({ content, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`w-1/4 border-gray-300 dark:border-gray-700 border text-center p-1.5 text-sm transition-all select-none`}
        >
            {content}
        </td>
    );
};

export default CreditTR;