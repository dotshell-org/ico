import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import SelectPropertyComponent from "../SelectPropertyComponent";
import { SummaryProperty } from "../../../../types/summary/SummaryProperty";
import {Sort} from "../../../../types/sort/Sort.ts";
import SelectOrientationComponent from "./SelectOrientationComponent.tsx";
import {Orientation} from "../../../../types/sort/Orientation.ts";

interface SelectFilterInterfaceProps {
    onAdded: (sort: Sort) => void;
    onClose: () => void;
}

const SelectFilterInterface: React.FC<SelectFilterInterfaceProps> = ({ onAdded, onClose }) => {
    const { t } = useTranslation();
    const [property, setProperty] = useState<SummaryProperty>(SummaryProperty.Date);
    const [orientation, setOrientation] = useState<Orientation>(Orientation.Asc);

    const handlePropertyChange = (selectedProperty: SummaryProperty) => {
        setProperty(selectedProperty);
    };

    const handleOrientationChange = (selectedOrientation: Orientation) => {
        setOrientation(selectedOrientation);
    }

    const handleClickAdd = () => {
        onAdded({
            property: property,
            orientation: orientation
        })
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
                <h1 className="text-2xl font-bold">{t("sort")}</h1>

                <h2 className="mt-4">{t("raw_property")}</h2>
                <SelectPropertyComponent onChange={handlePropertyChange} />

                <h2 className="mt-4">{t("raw_orientation")}</h2>
                <SelectOrientationComponent onChange={handleOrientationChange} />

                <button
                    className="mt-6 dark:bg-gray-700"
                    onClick={handleClickAdd}
                >
                    {t("raw_add")}
                </button>
            </div>
        </div>
    );
};

export default SelectFilterInterface;