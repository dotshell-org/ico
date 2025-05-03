import React from "react";
import {Sale} from "../../../types/sales/summary/Sale.ts";
import {XMarkIcon} from "@heroicons/react/24/outline";
import i18n from "i18next";

interface SaleMiniatureRowProps {
    sale: Sale;
    onClick: (sale: Sale) => void;
    onDelete: () => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language).format(date);
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'EUR' }).format(price);
};

const SaleMiniatureRow: React.FC<SaleMiniatureRowProps> = ({ sale, onClick, onDelete }) => {

    const handleDeleted = (e: React.MouseEvent) => {
        e.stopPropagation(); // Empêche le clic de se propager à l'élément parent
        
        console.log("Tentative de suppression de la vente avec ID:", sale.id);
        (window as any).ipcRenderer
            .invoke("deleteSale", sale.local_id || sale.id) // Utilise local_id si disponible, sinon utilise id
            .then(() => {
                console.log("Vente supprimée avec succès");
                onDelete();
            })
            .catch((error: any) => {
                console.error("Erreur lors de la suppression de la vente:", error);
                alert("Erreur lors de la suppression de la vente: " + error.message);
            });
    }

    return (
        <td
            className={`flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left text-sm transition-all cursor-pointer select-none`}
        >
            <div
                onClick={() => onClick(sale)}
                className="w-[40%] pl-1.5 pt-3"
            >
                {sale.object}
            </div>
            <div
                onClick={() => onClick(sale)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {sale.stock}
            </div>
            <div
                onClick={() => onClick(sale)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {formatDate(sale.date)}
            </div>
            <div
                onClick={() => onClick(sale)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {sale.quantity}
            </div>
            <div
                onClick={() => onClick(sale)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {formatPrice(sale.price*sale.quantity)}
            </div>
            <div className="w-10">
                <button
                    className="z-50 p-1 m-2 md-0 bg-gray-50 dark:bg-gray-900 text-red-500 hover:border-red-500 rounded-full"
                    onClick={handleDeleted}
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </td>
    )
}

export default SaleMiniatureRow