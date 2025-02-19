import React from "react";
import { useTranslation } from "react-i18next";

interface AggregationToolbarProps {
    columnIndex: number | null;
    values: string[];
}

const AggregationToolbar: React.FC<AggregationToolbarProps> = ({ columnIndex, values }) => {
    const { t } = useTranslation();
    const isVisible = columnIndex !== null && values.length > 0;

    // Cell counter (displayed in all configurations)
    const selectedCountElement = (
        <div className="px-3">
            <strong>{t("selected_count")}:</strong> {values.length}
        </div>
    );

    let additionalElement = null;

    if (columnIndex === 2) {
        // Numeric column: sum, average, median, standard deviation, minimum, and maximum.
        const numbers = values.map(val => parseFloat(val)).filter(num => !isNaN(num));
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const avg = numbers.length > 0 ? sum / numbers.length : 0;
        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;

        // Calculation of the median.
        const sorted = [...numbers].sort((a, b) => a - b);
        const median =
            sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)];

        // Calculation of the standard deviation.
        const variance =
            numbers.length > 0
                ? numbers.reduce((acc, num) => acc + Math.pow(num - avg, 2), 0) / numbers.length
                : 0;
        const stdDev = Math.sqrt(variance);

        additionalElement = (
            <>
                <div className="px-3">
                    <strong>{t("sum")}:</strong> €{sum.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{t("average")}:</strong> €{avg.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{t("median")}:</strong> €{median.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{t("std_dev")}:</strong> €{stdDev.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{t("min")}:</strong> €{min.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{t("max")}:</strong> €{max.toFixed(2)}
                </div>
            </>
        );
    } else if (columnIndex === 0) {
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
                <strong>{t("date_range")}:</strong> {minDate ? minDate.toLocaleDateString() : "-"} → {" "}
                {maxDate ? maxDate.toLocaleDateString() : "-"} ({dayDiff} {t("raw_days")})
            </div>
        );
    } else if (columnIndex === 3) {
        // Category column: frequency of each category displayed in a scrollable area.
        const frequency: { [key: string]: number } = {};
        values.forEach(val => {
            frequency[val] = (frequency[val] || 0) + 1;
        });
        additionalElement = (
            <div className="px-3 overflow-x-auto">
                {Object.entries(frequency).map(([category, count]) => (
                    <div key={category} className="inline-block mr-4">
                        <strong>{category}:</strong> {count}
                    </div>
                ))}
            </div>
        );
    } else if (columnIndex === 1) {
        // Text column (e.g., title): number of unique values.
        const uniqueValues = Array.from(new Set(values));
        additionalElement = (
            <div className="px-3">
                <strong>{t("unique_count")}:</strong> {uniqueValues.length}
            </div>
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