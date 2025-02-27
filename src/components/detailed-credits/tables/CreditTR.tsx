import React from "react";

interface CreditTRProps {
    border: boolean;
    content: string;
    onClick?: (event: React.MouseEvent<HTMLTableCellElement>) => void;
}

const CreditTR: React.FC<CreditTRProps> = ({ border, content, onClick }) => {
    return (
        <td
            onClick={onClick}
            className={`w-1/4 border-gray-300 dark:border-gray-700 ${border && "border"} text-center p-1.5 text-sm transition-all select-none`}
        >
            {content}
        </td>
    );
};

export default CreditTR;