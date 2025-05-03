import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface NewSaleInterfaceProps {
    onClose: () => void;
    onAdded: () => void;
}

const NewSaleInterface: React.FC<NewSaleInterfaceProps> = ({ onClose, onAdded }) => {
    const { t } = useTranslation();

    const [objectNames, setObjectNames] = useState<string[]>([]);
    const [stockNames, setStockNames] = useState<string[]>([]);
    const [filteredObjectNames, setFilteredObjectNames] = useState<string[]>([]);
    const [filteredStockNames, setFilteredStockNames] = useState<string[]>([]);

    const [name, setName] = useState<string>("");
    const [quantity, setQuantity] = useState<number>(0);
    const [price, setPrice] = useState<number>(0);
    const [date, setDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
    const [stock, setStock] = useState<string>("");

    // Récupérer tous les noms d'objets du stock et des objets vendus
    useEffect(() => {
        // Récupérer les objets du stock
        (window as any).ipcRenderer
            .invoke("getAllObjectNames")
            .then((stockObjects: string[]) => {
                // Récupérer les objets vendus
                (window as any).ipcRenderer
                    .invoke("getAllSoldObjectNames")
                    .then((soldObjects: string[]) => {
                        // Combiner les deux listes et éliminer les doublons
                        const combinedObjects = [...new Set([...stockObjects, ...soldObjects])].sort();
                        setObjectNames(combinedObjects);
                        setFilteredObjectNames(combinedObjects);
                    })
                    .catch((error: any) => {
                        console.error("Error when fetching sold objects", error);
                        // En cas d'erreur, utiliser uniquement les objets du stock
                        setObjectNames(stockObjects);
                        setFilteredObjectNames(stockObjects);
                    });
            })
            .catch((error: any) => {
                console.error("Error when fetching stock objects", error);
                setObjectNames([]);
                setFilteredObjectNames([]);
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
        if (stock.trim() === "") {
            setFilteredStockNames(stockNames);
        } else {
            const filtered = stockNames.filter(s => 
                s.toLowerCase().includes(stock.toLowerCase())
            );
            setFilteredStockNames(filtered);
        }
    }, [stock, stockNames]);

    const handleNewButtonClicked = () => {
        (window as any).ipcRenderer
            .invoke("addSale", name, quantity, price, date, stock)
            .then(() => {
                onAdded();
                onClose();
            })
            .catch(() => {
                console.error("Error adding sale");
            });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 dark:bg-opacity-50">
            <div
                className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-lg w-[24rem] h-fit pt-12 pb-16 max-h-[90vh] overflow-y-auto translate-y-10 grid grid-cols-1 gap-4">
                <button
                    className="absolute p-0 top-12 mt-1 right-8 text-gray-500 dark:text-white bg-transparent border-none ring-0 focus:outline-none"
                    onClick={onClose}
                >
                    ✕
                </button>
                <div>
                    <h1 className="text-2xl font-bold mb-4">{"➕ " + t("new")}</h1>
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
                        value={quantity === 0 ? '' : quantity}
                        onChange={(e) => setQuantity(e.target.value === '' ? 0 : Number(e.target.value))}
                    />
                </div>

                <div>
                    <h2>{t("price")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        type="number"
                        step="0.01"
                        value={price === 0 ? '' : price}
                        onChange={(e) => setPrice(e.target.value === '' ? 0 : Number(e.target.value))}
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
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        list="stockOptions"
                        autoComplete="off"
                    />
                    <datalist id="stockOptions">
                        {filteredStockNames.map((e) => (
                            <option key={e} value={e}/>
                        ))}
                    </datalist>
                </div>

                <div>
                    <button
                        className="w-full p-2 mt-4 bg-gray-100 dark:bg-gray-600"
                        onClick={handleNewButtonClicked}
                    >
                        {t("add")}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NewSaleInterface;