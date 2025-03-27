import React from "react";
import {useTranslation} from "react-i18next";

interface AggregationToolbarProps {
    columnIndex: number | null;
    values: string[];
}

const AggregationToolbar: React.FC<AggregationToolbarProps> = ({columnIndex, values}) => {
    const {t} = useTranslation();
    const isVisible = columnIndex !== null && values.length > 0;

    // Cell counter (displayed in all configurations)
    const selectedCountElement = (
        <div className="px-3">
            <strong>{"🔢 " + t("selected_count")}:</strong> {values.length}
        </div>
    );

    let additionalElement = null;

    if (columnIndex === 3) {
        // Numeric column: sum, minimum, and maximum.
        const numbers = values.map(val => parseFloat(val)).filter(num => !isNaN(num));
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;

        additionalElement = (
            <>
                <div className="px-3">
                    <strong>{"➕ " + t("sum")}:</strong> {sum.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"🔻 " + t("min")}:</strong> {min.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"🔺 " + t("max")}:</strong> {max.toFixed(0)}
                </div>
            </>
        );
    } else if (columnIndex === 1) {
        // Date column: date range and number of days between the minimum and maximum date.
        const dates = values
            .map(dateStr => new Date(dateStr))
            .filter(date => !isNaN(date.getTime()));
        const minDate =
            dates.length > 0 ? new Date(Math.min(...dates.map(date => date.getTime()))) : null;
        const maxDate =
            dates.length > 0 ? new Date(Math.max(...dates.map(date => date.getTime()))) : null;
        const dayDiff =
            minDate && maxDate
                ? Math.floor((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0;
        additionalElement = (
            <div className="px-3">
                <strong>{"\uD83D\uDCCF " + t("date_range")}:</strong> {minDate ? minDate.toLocaleDateString() : "-"} → {" "}
                {maxDate ? maxDate.toLocaleDateString() : "-"} ({dayDiff} {t("days")})
            </div>
        );
    } else if (columnIndex === 4) {
        // Numeric column with additional negative and positive sums.
        const numbers = values.map(val => parseFloat(val)).filter(num => !isNaN(num));
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;
        const sumNegatives = numbers.filter(num => num < 0).reduce((acc, num) => acc + num, 0) * -1;
        const sumPositives = numbers.filter(num => num > 0).reduce((acc, num) => acc + num, 0);

        additionalElement = (
            <>
                <div className="px-3">
                    <strong>{"➕ " + t("sum")}:</strong> {sum.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"🔻 " + t("min")}:</strong> {min.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"🔺 " + t("max")}:</strong> {max.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"➖ " + t("negative_sum")}:</strong> {sumNegatives.toFixed(0)}
                </div>
                <div className="px-3">
                    <strong>{"➕ " + t("positive_sum")}:</strong> {sumPositives.toFixed(0)}
                </div>
            </>
        );
    } else if (columnIndex === 2 || columnIndex === 0) {
        // Text columns (e.g., index 0 and 2): number of unique values and occurrences of each one.
        const uniqueValuesCount = values.reduce((acc: Record<string, number>, val) => {
            acc[val] = (acc[val] || 0) + 1;
            return acc;
        }, {});
        additionalElement = (
            <>
                {Object.entries(uniqueValuesCount).map(([value, count]) => (
                    <div key={value} className="px-3">
                        <strong>{value}:</strong> {count}
                    </div>
                ))}
            </>
        );
    }

    return (
        <div
            className={`fixed bottom-2 left-2 right-2 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md border border-gray-400 dark:border-gray-600 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div className="flex flex-row items-center justify-center space-x-4">
                {selectedCountElement}
                {additionalElement}
            </div>
        </div>
    );
};

export default AggregationToolbar;