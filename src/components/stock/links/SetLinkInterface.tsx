import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { InvoiceProductLink } from "../../../types/stock/InvoiceProductLink";
import { InvoiceProductLinkProps } from "../../../types/stock/InvoiceProductLinkProps";

interface SetLinkInterfaceProps {
    link: InvoiceProductLink;
    onClose: () => void;
    onUpdate: () => void;
}

const SetLinkInterface: React.FC<SetLinkInterfaceProps> = ({ link, onClose, onUpdate }) => {
    const { t } = useTranslation();

    const [objectNames, setObjectNames] = useState<string[]>([]);
    const [stockNames, setStockNames] = useState<string[]>([]);
    const [filteredObjectNames, setFilteredObjectNames] = useState<string[]>([]);
    const [filteredStockNames, setFilteredStockNames] = useState<string[]>([]);

    const [name, setName] = useState<string>(link.name);
    const [quantity, setQuantity] = useState<number>(link.quantity);
    const [date, setDate] = useState<string>(link.date);
    const [stock_name, setStockName] = useState<string>("");

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getAllObjectNames")
            .then((result: string[]) => {
                setObjectNames(result);
                setFilteredObjectNames(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching objects", error);
            });
    }, []);

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getAllStocks")
            .then((result: string[]) => {
                setStockNames(result);
                setFilteredStockNames(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching stocks", error);
            });
    }, []);

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getStockLinkProps", link.addition_id)
            .then((result: InvoiceProductLinkProps | undefined) => {
                if (result === undefined) return;
                setName(result.name);
                setQuantity(result.quantity);
                setDate(result.date);
                setStockName(result.stock_name);
            })
            .catch((error: any) => {
                console.error("Error fetching link props", error);
            });
    }, [link.id]);

    // Update filtered object names when user types
    useEffect(() => {
        if (name.trim() === "") {
            setFilteredObjectNames(objectNames);
        } else {
            const filtered = objectNames.filter(obj =>
                obj.toLowerCase().includes(name.toLowerCase())
            );
            setFilteredObjectNames(filtered);
        }
    }, [name, objectNames]);

    // Update filtered stock names when user types
    useEffect(() => {
        if (stock_name.trim() === "") {
            setFilteredStockNames(stockNames);
        } else {
            const filtered = stockNames.filter(s =>
                s.toLowerCase().includes(stock_name.toLowerCase())
            );
            setFilteredStockNames(filtered);
        }
    }, [stock_name, stockNames]);

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

    const handleLinkButtonClicked = () => {
        (window as any).ipcRenderer
            .invoke("linkInvoiceProductInStock", link.id, link.addition_id, stock_name, date, name, quantity)
            .then(() => {
                onUpdate();
                onClose();
            })
            .catch((error: any) => {
                console.error("Error editing link", error);
            });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 dark:bg-opacity-50">
            <div
                className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-lg w-[50rem] h-fit pt-12 pb-16 max-h-[90vh] overflow-y-auto translate-y-10 grid grid-cols-2 gap-8">
                <button
                    className="absolute p-0 top-12 mt-1 right-8 text-gray-500 dark:text-white bg-transparent border-none ring-0 focus:outline-none col-span-2"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div className="col-span-2">
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
                </div>

                <div>
                    <h2>{t("name")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600 hide-calendar-picker"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        list="nameOptions"
                        autoComplete="off"
                    />
                    <datalist id="nameOptions">
                        {filteredObjectNames.map((e) => (
                            <option key={e} value={e}/>
                        ))}
                    </datalist>
                </div>

                <div>
                    <h2>{t("quantity")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                </div>

                <div>
                    <h2>{t("date")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />
                </div>

                <div>
                    <h2>{t("stock")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600 hide-calendar-picker"
                        type="text"
                        value={stock_name}
                        onChange={(e) => setStockName(e.target.value)}
                        list="stockOptions"
                        autoComplete="off"
                    />
                    <datalist id="stockOptions">
                        {filteredStockNames.map((e) => (
                            <option key={e} value={e}/>
                        ))}
                    </datalist>
                </div>

                <div className="col-span-2">
                    <button
                        className="w-full p-2 mt-2 bg-gray-100 dark:bg-gray-600"
                        onClick={handleLinkButtonClicked}
                    >
                        {t("link")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetLinkInterface;