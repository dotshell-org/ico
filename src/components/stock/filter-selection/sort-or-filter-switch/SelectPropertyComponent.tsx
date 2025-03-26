import React, {ChangeEvent, useState} from 'react';
import {SummaryProperty} from "../../../../types/stock/summary/SummaryProperty.ts";
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
            <option value={SummaryProperty.Date}>{"📅 " + t("date")}</option>
            <option value={SummaryProperty.Object}>{"💡 " + t("object")}</option>
            <option value={SummaryProperty.Amount}>{"\uD83D\uDCB0 " + t("amount")}</option>
            <option value={SummaryProperty.Movement}>{"🔄 " + t("movement ")}</option>
        </select>
    );
};

export default SelectPropertyComponent;