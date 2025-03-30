import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SelectPropertyComponent from "../SelectPropertyComponent.tsx";
import { SummaryProperty } from "../../../../../types/stock/summary/SummaryProperty.ts";
import SelectOperatorComponent from "./SelectOperatorComponent.tsx";
import { Operator } from "../../../../../types/stock/summary/filter/Operator.ts";
import { Filter } from "../../../../../types/stock/summary/filter/Filter.ts";

interface SelectFilterInterfaceProps {
    onAdded: (filter: Filter) => void;
    onClose: () => void;
}

const SelectFilterInterface: React.FC<SelectFilterInterfaceProps> = ({ onAdded, onClose }) => {
    const { t } = useTranslation();
    const [property, setProperty] = useState<SummaryProperty>(SummaryProperty.Date);
    const [operator, setOperator] = useState<Operator>(Operator.Is);
    const [value, setValue] = useState<string | number>("");

    const handlePropertyChange = (selectedProperty: SummaryProperty) => {
        setProperty(selectedProperty);
        setValue("");
    };

    const handleOperatorChange = (selectedOperator: Operator) => {
        setOperator(selectedOperator);
    };

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setValue(inputValue);
    };

    const handleClickAdd = () => {
        if (value === "") return;
        onAdded({
            property: property,
            operator: operator,
            value: value,
        });
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-10 dark:bg-opacity-50">
            <div className="relative bg-white dark:bg-gray-800 p-8 rounded shadow-lg w-96 h-fit pt-12 pb-16">
                <button
                    className="absolute p-0 top-12 mt-1 right-8 text-gray-500 dark:text-white bg-transparent border-none ring-0 focus:outline-none"
                    onClick={onClose}
                >
                    ✕
                </button>
                <h1 className="text-2xl font-bold">{"🔍 " + t("filter")}</h1>
                <h2 className="mt-4">{t("property")}</h2>

                <SelectPropertyComponent onChange={handlePropertyChange} />

                <h2 className="mt-4">{t("operator")}</h2>
                <SelectOperatorComponent
                    onChange={handleOperatorChange}
                    property={property}
                />

                <h2 className="mt-4">{t("value")}</h2>
                {property === SummaryProperty.Stock ? (
                    <input
                        type="text"
                        className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("enter_value") as string}
                        value={value}
                        onChange={handleValueChange}
                    />
                ) : property === SummaryProperty.Quantity || property === SummaryProperty.Movement ? (
                    <input
                        type="number"
                        className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("enter_value") as string}
                        value={value || ""}
                        onChange={handleValueChange}
                    />
                ) : property === SummaryProperty.Date ? (
                    <input
                        type="date"
                        className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600 cursor-text"
                        placeholder={t("enter_value") as string}
                        value={value}
                        onChange={handleValueChange}
                    />
                ) : (
                    <input
                        type="text"
                        className="mt-2 p-2 h-8 border rounded w-full dark:bg-gray-700 dark:border-gray-600"
                        placeholder={t("enter_value") as string}
                        value={value}
                        onChange={handleValueChange}
                    />
                )}

                <button
                    className="mt-6 dark:bg-gray-700"
                    onClick={handleClickAdd}
                    disabled={value === ""}
                >
                    {t("add")}
                </button>
            </div>
        </div>
    );
};

export default SelectFilterInterface;