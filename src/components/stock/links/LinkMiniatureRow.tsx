import {InvoiceProductLink} from "../../../types/stock/InvoiceProductLink.ts";

interface LinkMiniatureRowProps {
    productLink: InvoiceProductLink
    onClick: (productLink: InvoiceProductLink) => void;
}

const productLinkToEmoji = (productLink: InvoiceProductLink) => {
    if (productLink.addition_id === 0) {
        return "❌ ";
    } else {
        return "✅ ";
    }
}

const CreditMiniatureRow: React.FC<LinkMiniatureRowProps> = ({ productLink, onClick }) => {
    return (
        <td
            className={`flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left text-sm transition-all cursor-pointer select-none`}
        >
            <div
                onClick={() => onClick(productLink)}
                className="w-[70%] pl-1.5 pt-3"
            >
                {productLink.name}
            </div>
            <div
                onClick={() => onClick(productLink)}
                className="w-[30%] pt-3"
            >
                {productLink.quantity}
            </div>
            <div
                onClick={() => onClick(productLink)}
                className="w-[20%] pt-3 mb-3"
            >
                {productLinkToEmoji(productLink)}
            </div>
        </td>
    )
}

export default CreditMiniatureRow