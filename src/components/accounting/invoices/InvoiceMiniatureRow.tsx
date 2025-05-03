import React from "react";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {Invoice} from "../../../types/accounting/invoices/Invoice.ts";
import {Country} from "../../../types/Country.ts";

interface InvoiceMiniatureRowProps {
    invoice: Invoice;
    onClick: (invoice: Invoice) => void;
    onDelete: (id: number) => void;
}

const countryCodeToEmoji = (code: Country) => {
    const emojis: Record<Country, string> = {
        [Country.None]: "🚫",
        [Country.France]: "🇫🇷",
        [Country.Debit]: "📝"
    };

    return emojis[code] || "❓";
};

const InvoiceMiniatureRow: React.FC<InvoiceMiniatureRowProps> = ({ invoice, onClick, onDelete }) => {
    return (
        <td
            className={`flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left text-sm transition-all cursor-pointer select-none`}
        >
            <div
                onClick={() => onClick(invoice)}
                className="w-[60%] pl-1.5 pt-3"
            >
                {invoice.title}
            </div>
            <div
                onClick={() => onClick(invoice)}
                className="w-[20%] pl-1.5 pt-3"
            >
                {countryCodeToEmoji(invoice.countryCode)}
            </div>
            <div
                onClick={() => onClick(invoice)}
                className="w-[20%] pt-3"
            >
                €{invoice.totalAmount.toFixed(2).toString()}
            </div>
            <div className="w-10">
                <button
                    onClick={() => onDelete(invoice.id)}
                    className="z-50 p-1 m-2 md-0 bg-gray-50 dark:bg-gray-900 text-red-500 hover:border-red-500 rounded-full"
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </td>
    )
}

export default InvoiceMiniatureRow