import React from "react";
import {useTranslation} from "react-i18next";

const SalesAggregationToolbar: React.FC<{ columnIndex: number | null; values: string[] }> = ({ columnIndex, values }) => {
    const { t } = useTranslation();
    const isVisible = columnIndex !== null && values.length > 0;

    // Cell counter (displayed for all columns)
    const selectedCountElement = (
        <div className="px-3">
            <strong>{"🔢 " + t("selected_count")}:</strong> {values.length}
        </div>
    );

    let additionalElement = null;

    if (columnIndex === 0) {
        // Date column: date range and days difference
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
    } else if (columnIndex === 1) {
        // Object column: occurrences of each object
        const objectCounts: Record<string, number> = {};
        values.forEach(val => {
            objectCounts[val] = (objectCounts[val] || 0) + 1;
        });
        additionalElement = (
            <div className="px-3 overflow-x-auto">
                {Object.entries(objectCounts).map(([object, count]) => (
                    <div key={object} className="inline-block mr-4">
                        <strong>{object}:</strong> {count}
                    </div>
                ))}
            </div>
        );
    } else if (columnIndex === 2 || columnIndex === 3 || columnIndex === 4) {
        // Quantity and Price columns: full statistical calculations
        const numbers = values.map(val => parseFloat(val)).filter(num => !isNaN(num));
        const sum = numbers.reduce((acc, num) => acc + num, 0);
        const avg = numbers.length > 0 ? sum / numbers.length : 0;

        // Calculate median
        const sorted = [...numbers].sort((a, b) => a - b);
        const median =
            sorted.length % 2 === 0
                ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
                : sorted[Math.floor(sorted.length / 2)];

        // Calculate standard deviation
        const variance =
            numbers.length > 0
                ? numbers.reduce((acc, num) => acc + Math.pow(num - avg, 2), 0) / numbers.length
                : 0;
        const stdDev = Math.sqrt(variance);

        const min = numbers.length > 0 ? Math.min(...numbers) : 0;
        const max = numbers.length > 0 ? Math.max(...numbers) : 0;

        // Use Euro symbol for price column, no symbol for quantity
        const prefix = columnIndex === 3 ? "€" : "";

        additionalElement = (
            <>
                <div className="px-3">
                    <strong>{"➕ " + t("sum")}:</strong> {prefix}{sum.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{"📊 " + t("average")}:</strong> {prefix}{avg.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{"📏 " + t("median")}:</strong> {prefix}{median.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{"📉 " + t("std_dev")}:</strong> {prefix}{stdDev.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{"🔻 " + t("min")}:</strong> {prefix}{min.toFixed(2)}
                </div>
                <div className="px-3">
                    <strong>{"🔺 " + t("max")}:</strong> {prefix}{max.toFixed(2)}
                </div>
            </>
        );
    } else if (columnIndex === 5) {
        // Stock column: occurrences of each stock
        const stockCounts: Record<string, number> = {};
        values.forEach(val => {
            stockCounts[val] = (stockCounts[val] || 0) + 1;
        });
        additionalElement = (
            <div className="px-3 overflow-x-auto">
                {Object.entries(stockCounts).map(([stock, count]) => (
                    <div key={stock} className="inline-block mr-4">
                        <strong>{stock}:</strong> {count}
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div
            className={`fixed bottom-2 left-2 right-2 rounded-lg bg-white dark:bg-gray-800 p-4 shadow-md border border-gray-400 dark:border-gray-600 transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
        >
            <div className="flex flex-row items-center justify-center space-x-4 flex-wrap">
                {selectedCountElement}
                {additionalElement}
            </div>
        </div>
    );
};

export default SalesAggregationToolbar;