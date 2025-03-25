import React from "react";

interface CreditTRProps {
    content: string;
}

const CreditTR: React.FC<CreditTRProps> = ({ content }) => {
    return (
        <td
            className={`border border-gray-300 dark:border-gray-700 text-center p-1.5 text-sm transition-all select-none`}
        >
            {content}
        </td>
    );
};

export default CreditTR;