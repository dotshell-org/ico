import { useState, useEffect } from "react";
import { Credit } from "../../../types/accounting/detailed-credits/Credit.ts";
import CreditTable from "./tables/CreditTable.tsx";
import OtherMoneyCreditTable from "./tables/OtherMoneyCreditTable.tsx";
import { t } from "i18next";
import { MoneyType } from "../../../types/accounting/detailed-credits/MoneyType.ts";
import dayjs from "dayjs";

interface CreditEditorProps {
    credit: Credit;
}

function isValidDate(dateString: string): boolean {
    return dayjs(dateString, "YYYY-MM-DD", true).isValid();
}

const CreditEditor: React.FC<CreditEditorProps> = ({ credit }) => {
    const [dateValue, setDateValue] = useState<string>(credit.date);
    const [titleValue, setTitleValue] = useState<string>(credit.title);
    const [tableIds, setTableIds] = useState<number[]>(credit.tableIds);
    const [selectedTableType, setSelectedTableType] = useState<MoneyType>(MoneyType.Banknotes);
    const [categoryValue, setCategoryValue] = useState<string>(credit.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);

    // Effect pour la mise à jour de la date
    useEffect(() => {
        const updateDate = async () => {
            if (dateValue !== credit.date) {
                try {
                    await (window as any).ipcRenderer.invoke("updateCreditDate", credit.id, dateValue);
                    console.log("Date updated successfully!");
                } catch (error) {
                    console.error("Error when updating the date:", error);
                }
            }
        };
        updateDate();
    }, [dateValue, credit.id, credit.date]);

    // Effect pour la mise à jour du titre
    useEffect(() => {
        const updateTitle = async () => {
            if (titleValue !== credit.title) {
                try {
                    await (window as any).ipcRenderer.invoke("updateCreditTitle", credit.id, titleValue);
                    console.log("Title updated successfully!");
                } catch (error) {
                    console.error("Error when updating the title:", error);
                }
            }
        };
        updateTitle();
    }, [titleValue, credit.id, credit.title]);

    // Effects de synchronisation avec les props
    useEffect(() => setTableIds(credit.tableIds), [credit.tableIds]);
    useEffect(() => setDateValue(credit.date), [credit.date]);
    useEffect(() => setTitleValue(credit.title), [credit.title]);

    // Handlers
    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = e.target.value;
        if (isValidDate(newDate)) {
            setDateValue(newDate);
        } else {
            setDateValue(credit.date);
        }
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleValue(e.target.value);
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateCreditCategory", credit.id, newCategory);
            console.log("Category updated successfully!");
            setCategoryValue(newCategory);
        } catch (error) {
            console.error("Error when updating the category:", error);
        }
    };

    const handleAddNewTable = async () => {
        try {
            const newTableId = await (window as any).ipcRenderer.invoke(
                "addCreditTable",
                credit.id,
                selectedTableType
            );
            console.log("New table created with id:", newTableId);
            setTableIds(prevTableIds => [...prevTableIds, newTableId]);
        } catch (error) {
            console.error("Error when creating a new table:", error);
        }
    };

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await (window as any).ipcRenderer.invoke("getAllCategories");
                setAllCategories(categories);
            } catch (error) {
                console.error("Error loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    return (
        <div className="p-2">
            <input
                className="text-3xl mb-2 font-bold bg-transparent w-full cursor-text outline-none block"
                value={titleValue}
                onChange={handleTitleChange}
            />

            <input
                id="creditDate"
                type="date"
                value={dateValue}
                className="mb-10 bg-transparent border-none"
                contentEditable={false}
                onChange={handleDateChange}
            />

            <input
                list="categoriesList"
                id="categoryDatalist"
                value={categoryValue}
                onChange={handleCategoryChange}
                placeholder={t("category")}
                className="ml-8 bg-transparent border-none underline"
            />
            <datalist id="categoriesList">
                {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                ))}
            </datalist>

            {tableIds.map((id) => (
                <CreditTable
                    key={id}
                    id={id}
                    handleRemoveTable={
                        (tableId) => {
                            setTableIds((prevTableIds) => prevTableIds.filter((id) => id !== tableId));
                        }
                    }
                />
            ))}

            <div className="mb-2">
                <label htmlFor="tableType" className="mr-2">
                    {"\uD83D\uDDC3\uFE0F " + t("type")}
                </label>
                <select
                    id="tableType"
                    value={selectedTableType}
                    onChange={(e) => setSelectedTableType(Number(e.target.value))}
                    className="p-1 border rounded dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
                >
                    <option value={MoneyType.Banknotes}>{"\uD83D\uDCB5 " + t("banknotes")}</option>
                    <option value={MoneyType.Coins}>{"\uD83E\uDE99 " + t("coins")}</option>
                    <option value={MoneyType.Cheques}>{"\uD83D\uDD8B " + t("cheques")}</option>
                </select>
            </div>

            <button
                type="button"
                onClick={handleAddNewTable}
                className="mb-5 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("new_table")}
            </button>

            <OtherMoneyCreditTable id={credit.id} />
        </div>
    );
};

export default CreditEditor;