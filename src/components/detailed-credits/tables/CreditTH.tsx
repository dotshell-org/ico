import React from "react";

interface CreditTHProps {
    content: String;
}

const CreditTH: React.FC<CreditTHProps> = ({ content }) => {
    return (
        <th className="w-1/4 border-gray-300 dark:border-gray-700 border border-b-2 text-center p-2 text-sm font-normal text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-950">
            {content}
        </th>
    )
}

export default CreditTH