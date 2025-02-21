import React, {ChangeEvent, useState} from 'react';
import { t } from "i18next";
import { Operator } from "../../../../types/filter/Operator.ts";
import { SummaryProperty } from "../../../../types/summary/SummaryProperty.ts";

interface SelectOperatorProps {
    onChange: (selectedProperty: Operator) => void;
    property: SummaryProperty;
}

const SelectOperatorComponent: React.FC<SelectOperatorProps> = ({ onChange, property }) => {
    const [selectedValue, setSelectedValue] = useState<Operator>(Operator.Is);

    const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
        setSelectedValue(event.target.value as Operator);
        onChange(event.target.value as Operator);
    };

    const getOptionsForProperty = () => {
        if (property === SummaryProperty.Date) {
            return (
                <>
                    <option value={Operator.Is}>{t("raw_is")}</option>
                    <option value={Operator.LessThan}>{t("raw_before")}</option>
                    <option value={Operator.MoreThan}>{t("raw_after")}</option>
                </>
            );
        } else if (property === SummaryProperty.Title) {
            return (
                <>
                    <option value={Operator.Is}>{t("raw_is")}</option>
                    <option value={Operator.IsExactly}>{t("raw_is_exactly")}</option>
                </>
            );
        } else if (property === SummaryProperty.Amount) {
            return (
                <>
                    <option value={Operator.IsExactly}>{t("raw_is_exactly")}</option>
                    <option value={Operator.MoreThan}>{t("raw_more_than")}</option>
                    <option value={Operator.LessThan}>{t("raw_less_than")}</option>
                </>
            );
        } else if (property === SummaryProperty.Category) {
            return (
                <>
                    <option value={Operator.Is}>{t("raw_is")}</option>
                    <option value={Operator.IsExactly}>{t("raw_is_exactly")}</option>
                </>
            );
        } else {
            return <option>Incorrect property</option>;
        }
    };

    return (
        <select
            className="w-full h-8 mt-1 rounded-md bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 cursor-pointer"
            value={selectedValue}
            onChange={handleSelectChange}
        >
            {getOptionsForProperty()}
        </select>
    );
};

export default SelectOperatorComponent;