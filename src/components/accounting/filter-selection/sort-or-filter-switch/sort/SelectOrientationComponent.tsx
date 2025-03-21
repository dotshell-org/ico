import React, {ChangeEvent, useState} from 'react';
import { t } from "i18next";
import { Orientation } from '../../../../../types/accounting/sort/Orientation.ts';

interface SelectOrientationProps {
    onChange: (selectedOrientation: Orientation) => void;
}

const SelectOrientationComponent: React.FC<SelectOrientationProps> = ({ onChange }) => {
    const [selectedValue, setSelectedValue] = useState<Orientation>(Orientation.Asc);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value as Orientation);
        onChange(event.target.value as Orientation);
    };

    return (
        <select
            className="w-full h-8 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer"
            value={selectedValue}
            onChange={handleSelectChange}
        >
            <option value={Orientation.Asc}>{t("desc")} ↓</option>
            <option value={Orientation.Desc}>{t("asc")} ↑</option>
        </select>
    );
};

export default SelectOrientationComponent;