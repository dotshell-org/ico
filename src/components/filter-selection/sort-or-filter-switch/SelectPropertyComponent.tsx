import React, {ChangeEvent, useState} from 'react';
import {SummaryProperty} from "../../../types/summary/SummaryProperty.ts";
import {t} from "i18next";

interface SelectComponentProps {
    onChange: (selectedProperty: SummaryProperty) => void;
}

const SelectPropertyComponent: React.FC<SelectComponentProps> = ({ onChange }) => {

    const [selectedValue, setSelectedValue] = useState<SummaryProperty>(SummaryProperty.Date);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value as SummaryProperty);
        onChange(event.target.value as SummaryProperty);
    };

    return (
        <select
            className="w-full h-8 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer"
            value={selectedValue}
            onChange={handleSelectChange}
        >
            <option value={SummaryProperty.Date}>{t("date")}</option>
            <option value={SummaryProperty.Title}>{t("title")}</option>
            <option value={SummaryProperty.Amount}>{t("amount")}</option>
            <option value={SummaryProperty.Category}>{t("category")}</option>
        </select>
    );
};

export default SelectPropertyComponent;