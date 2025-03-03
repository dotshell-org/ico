import { useState, useEffect } from "react";
import { Credit } from "../../types/detailed-credits/Credit";
import CreditTable from "./tables/CreditTable";
import OtherMoneyCreditTable from "./tables/OtherMoneyCreditTable";
import { t } from "i18next";
import { MoneyType } from "../../types/detailed-credits/MoneyType";

interface CreditEditorProps {
    credit: Credit;
}

const CreditEditor: React.FC<CreditEditorProps> = ({ credit }) => {
    const [dateValue, setDateValue] = useState<string>(credit.date);
    const [tableIds, setTableIds] = useState<number[]>(credit.tableIds);
    const [selectedTableType, setSelectedTableType] = useState<MoneyType>(MoneyType.Banknotes);

    useEffect(() => {
        const updateDate = async () => {
            try {
                await (window as any).ipcRenderer.invoke("updateCreditDate", credit.id, dateValue);
                console.log("Date updated with success !");
            } catch (error) {
                console.error("Error when updating the date :", error);
            }
        };

        if (dateValue !== credit.date) {
            updateDate();
        }
    }, [dateValue, credit.id, credit.date]);

    useEffect(() => {
        setTableIds(credit.tableIds);
    }, [credit.tableIds]);

    useEffect(() => {
        setDateValue(credit.date);
    }, [credit.date]);

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDateValue(e.target.value);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.preventDefault();
    };

    const handleAddNewTable = async () => {
        try {
            const newTableId = await (window as any).ipcRenderer.invoke("addCreditTable", credit.id, selectedTableType);
            console.log("New table created with id:", newTableId);
            setTableIds(prevTableIds => [...prevTableIds, newTableId]);
        } catch (error) {
            console.error("Error when creating a new table:", error);
        }
    };

    return (
        <div className="p-2">
            <h1 className="text-3xl mb-2 font-bold cursor-default">{credit.title}</h1>
            <input
                id="creditDate"
                type="date"
                value={dateValue}
                className="mb-10"
                contentEditable={false}
                onKeyDown={handleKeyDown}
                onChange={handleDateChange}
            />
            {tableIds.map((id) => (
                <CreditTable key={id} id={id} />
            ))}
            <div className="mb-5">
                <label htmlFor="tableType" className="mr-2 mb-0">{t("type")}</label>
                <select
                    id="tableType"
                    value={selectedTableType}
                    onChange={(e) => setSelectedTableType(Number(e.target.value))}
                    className="p-1 mt-0 border rounded"
                >
                    <option value={MoneyType.Banknotes}>{t("banknotes")}</option>
                    <option value={MoneyType.Coins}>{t("coins")}</option>
                    <option value={MoneyType.Cheques}>{t("cheques")}</option>
                </select>
            </div>
            <button
                type="button"
                onClick={handleAddNewTable}
                className="mb-5 p-1 w-full text-sm bg-blue-500 text-white rounded"
            >
                {t("raw_new_table")}
            </button>
            <OtherMoneyCreditTable id={credit.id} />
        </div>
    );
};

export default CreditEditor;