import React from "react";

interface CreditMiniatureRowProps {

}

const CreditMiniatureRow: React.FC<CreditMiniatureRowProps> = ({  }) => {
    return (
        <td
            className={`py-3 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left p-1.5 text-sm transition-all cursor-pointer select-none`}
        >
            <div className="w-[60%]">
                Lorem Ipsum
            </div>
            <div className="w-[20%]">
                🪙 💵 🖋 🏛️
            </div>
            <div className="w-[20%]">
                0.00€
            </div>
        </td>
    )
}

export default CreditMiniatureRow