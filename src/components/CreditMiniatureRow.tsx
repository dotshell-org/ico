import React from "react";

interface CreditMiniatureRowProps {
    content: String;
}

const CreditMiniatureRow: React.FC<CreditMiniatureRowProps> = ({ content }) => {
    return (
        <td
            className={`w-1/4 h-12 border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border text-left p-1.5 text-sm transition-all cursor-pointer select-none`}
        >
            {content}
        </td>
    )
}

export default CreditMiniatureRow