import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceProductLink } from "../../../types/stock/InvoiceProductLink";
import { InvoiceProductLinkProps } from "../../../types/stock/InvoiceProductLinkProps";

interface SetLinkInterfaceProps {
    link: InvoiceProductLink;
    onClose: () => void;
    onUpdate: () => void;
}

const SetLinkInterface: React.FC<SetLinkInterfaceProps> = ({
                                                               link,
                                                               onClose,
                                                               onUpdate,
                                                           }) => {
    const { t } = useTranslation();

    const [name, setName] = React.useState<string>("");
    const [quantity, setQuantity] = React.useState<number>(0);

    // Remplace toute référence à un ID de stock par un nom de stock
    const [stock_name, setStockName] = React.useState<string>("");

    useEffect(() => {
        // Récupération des propriétés du lien (nom d’objet, quantité, nom de stock)
        (window as any).ipcRenderer
            .invoke("getStockLinkProps", link.addition_id)
            .then((result: InvoiceProductLinkProps) => {
                setName(result.name);
                setQuantity(result.quantity);
                setStockName(result.stock_name);
            })
            .catch((error: any) => {
                console.error("Error fetching link props", error);
            });
    }, [link.id]);

    // Quand on ignore le produit : on supprime la ligne dans `additions`
    // et on met à jour la référence dans `invoice_products`.
    const handleIgnoreButtonClicked = () => {
        (window as any).ipcRenderer
            .invoke("ignoreInvoiceProductInStock", link.id)
            .then(() => {
                onUpdate();
                onClose();
            })
            .catch((error: any) => {
                console.error("Error editing link", error);
            });
    };

    // Quand on lie le produit : on met à jour ou on crée la ligne dans `additions`
    // avec le nom du stock, sans ID de stock (uniquement son nom).
    const handleLinkButtonClicked = () => {
        (window as any).ipcRenderer
            .invoke("linkInvoiceProductInStock", link.id, link.addition_id, name, quantity, stock_name)
            .then(() => {
                onUpdate();
                onClose();
            })
            .catch((error: any) => {
                console.error("Error editing link", error);
            });
        // On referme l’interface après l’action
        onClose();
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 dark:bg-opacity-50">
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-lg w-96 h-fit pt-12 pb-16 max-h-[90vh] overflow-y-auto translate-y-10">
                <button
                    className="absolute p-0 top-12 mt-1 right-8 text-gray-500 dark:text-white bg-transparent border-none ring-0 focus:outline-none"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h1 className="text-2xl font-bold">{"🔗 " + t("link")}</h1>
                <p className="text-gray-400">
                    {link.name} × {link.quantity}
                </p>

                <button
                    className={`w-full ${
                        link.addition_id >= 0
                            ? "bg-white dark:bg-gray-800 text-red-500"
                            : "bg-red-500 text-white"
                    } hover:bg-red-500 border border-red-500 hover:text-white hover:border-transparent p-2 mt-7 rounded-md transition-all`}
                    onClick={handleIgnoreButtonClicked}
                >
                    {t("ignore_in_stock")}
                </button>

                <h2 className="mt-6 flex items-center">
                    <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                    <span className="mx-2">{t("or")}</span>
                    <span className="flex-grow border-t border-gray-300 dark:border-gray-600"></span>
                </h2>

                <h2 className="mt-4">{t("name")}</h2>
                <input
                    className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <h2 className="mt-4">{t("quantity")}</h2>
                <input
                    className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                />

                <h2 className="mt-4">{t("stock_name")}</h2>
                <input
                    className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                    type="text"
                    value={stock_name}
                    onChange={(e) => setStockName(e.target.value)}
                    placeholder={t("enter_stock_name") as string}
                />

                <button
                    className="w-full bg-green-500 text-white hover:bg-green-600 p-2 mt-8 rounded-md transition-all"
                    onClick={handleLinkButtonClicked}
                >
                    {t("save_link")}
                </button>
            </div>
        </div>
    );
};

export default SetLinkInterface;