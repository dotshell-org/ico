import React from "react";
import {Credit} from "../../types/detailed-credits/Credit.ts";
import {MoneyType} from "../../types/detailed-credits/MoneyType.ts";

interface CreditMiniatureRowProps {
    credit: Credit;
    onClick: (credit: Credit) => void;
}

function typesToEmojis(types: MoneyType[]): string {
    let emojis = "";
    for (let type of types) {
        if (type == MoneyType.Coins) {
            emojis += "🪙 "
        }
        else if (type == MoneyType.Banknotes) {
            emojis += "💵 ";
        }
        else if (type == MoneyType.Cheques) {
            emojis += "🖋 ";
        }
        else if (type == MoneyType.Other) {
            emojis += "💳️ "
        }
    }
    return emojis;
}

const CreditMiniatureRow: React.FC<CreditMiniatureRowProps> = ({ credit, onClick }) => {
    return (
        <td
            className={`py-3 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left p-1.5 text-sm transition-all cursor-pointer select-none`}
            onClick={() => onClick(credit)}
        >
            <div className="w-[60%]">
                {credit.title}
            </div>
            <div className="w-[20%]">
                {typesToEmojis(credit.types)}
            </div>
            <div className="w-[20%]">
                €{credit.totalAmount.toFixed(2).toString()}
            </div>
        </td>
    )
}

export default CreditMiniatureRow