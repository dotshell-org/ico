import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";

interface NewMovementInterfaceProps {
    onClose: () => void;
    onAdded: () => void;
}

const NewMovementInterface: React.FC<NewMovementInterfaceProps> = ({ onClose, onAdded }) => {
    const { t } = useTranslation();

    const [objectNames, setObjectNames] = React.useState<string[]>([]);
    const [stockNames, setStockNames] = React.useState<string[]>([])

    const [name, setName] = React.useState<string>("");
    const [movementNumber, setMovementNumber] = React.useState<number>(0);
    const [date, setDate] = React.useState<string>(dayjs().format("YYYY-MM-DD"));
    const [stock_name, setStockName] = React.useState<string>("");

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getAllObjectNames")
            .then((result: string[]) => {
                setObjectNames(result);
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
            })
            .catch((error: any) => {
                console.error("Error when fetching stocks", error);
            });
    }, []);

    const handleNewButtonClicked = () => {
        (window as any).ipcRenderer
            .invoke("addMovement", name, movementNumber, date, stock_name)
            .then(() => {
                onAdded();
                onClose();
            })
            .catch(() => {
                console.error("Error editing movement");
            })
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
                    />
                    <datalist id="nameOptions">
                        {objectNames.map((e) => (
                            <option key={e} value={e}/>
                        ))}
                    </datalist>
                </div>

                <div>
                    <h2>{t("movement")}</h2>
                    <input
                        className="mt-1 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        type="number"
                        value={movementNumber === 0 ? '' : movementNumber}
                        onChange={(e) => setMovementNumber(e.target.value === '' ? 0 : Number(e.target.value))}
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
                    />
                    <datalist id="stockOptions">
                        {stockNames.map((e) => (
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

export default NewMovementInterface;