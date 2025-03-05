import React from "react";
import {Credit} from "../../types/detailed-credits/Credit.ts";
import {MoneyType} from "../../types/detailed-credits/MoneyType.ts";
import {XMarkIcon} from "@heroicons/react/24/outline";

interface CreditMiniatureRowProps {
    credit: Credit;
    onClick: (credit: Credit) => void;
    onDelete: (id: number) => void;
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

const CreditMiniatureRow: React.FC<CreditMiniatureRowProps> = ({ credit, onClick, onDelete }) => {
    return (
        <td
            className={`flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left text-sm transition-all cursor-pointer select-none`}
        >
            <div
                onClick={() => onClick(credit)}
                 className="w-[60%] pl-1.5 pt-3"
            >
                {credit.title}
            </div>
            <div
                onClick={() => onClick(credit)}
                className="w-[20%] pt-3"
            >
                {typesToEmojis(credit.types)}
            </div>
            <div
                onClick={() => onClick(credit)}
                className="w-[20%] pt-3"
            >
                €{credit.totalAmount.toFixed(2).toString()}
            </div>
            <div className="w-10">
                <button
                    onClick={() => onDelete(credit.id)}
                    className="z-50 p-1 m-2 md-0 bg-gray-50 dark:bg-gray-900 text-red-500 hover:border-red-500 rounded-full"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </td>
    )
}

export default CreditMiniatureRow