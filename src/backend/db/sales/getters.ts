import {db, typeToOperator} from "../config.ts";
import {Sale} from "../../../types/sales/summary/Sale.ts";
import {Filter} from "../../../types/sales/summary/filter/Filter.ts";
import {Sort} from "../../../types/sales/summary/sort/Sort.ts";
import {Operator} from "../../../types/sales/summary/filter/Operator.ts";
import {SummaryProperty} from "../../../types/sales/summary/SummaryProperty.ts";
import { format } from 'date-fns';
import {TimeFrame} from "../../../types/sales/TimeFrame.ts";

export function getSales(filters: Filter[], sorts: Sort[]): Sale[] {
    try {
        const queryParams: (string | number)[] = [];
        let query = `
            WITH all_sales AS (SELECT
                                   ROW_NUMBER() OVER (ORDER BY date, id) as id,
                                   id as local_id,
                date,
                object,
                stock,
                SUM(quantity) OVER (PARTITION BY object, stock ORDER BY date, id) as quantity,
                quantity as movement,
                price
            FROM sales)
            SELECT id, local_id, date, object, stock, quantity, movement, price
            FROM all_sales`;

        if (filters && filters.length > 0) {
            const conditions = filters.map(filter => {
                if (filter.property === SummaryProperty.Stock) {
                    queryParams.push(`%${filter.value}%`);
                    return `stock ${typeToOperator(filter.operator)} ?`;
                } else if (filter.property === SummaryProperty.Quantity ||
                    filter.property === SummaryProperty.Price) {
                    if (typeof filter.value === "string") {
                        queryParams.push(parseFloat(filter.value));
                    } else {
                        queryParams.push(filter.value);
                    }
                    return `${filter.property} ${typeToOperator(filter.operator)} ?`;
                } else if (filter.operator === Operator.Is) {
                    queryParams.push(`%${filter.value}%`);
                    return `${filter.property} ${typeToOperator(filter.operator)} ?`;
                } else {
                    queryParams.push(filter.value);
                    return `${filter.property} ${typeToOperator(filter.operator)} ?`;
                }
            });

            if (conditions.length > 0) {
                query += ` WHERE ${conditions.join(' AND ')}`;
            }
        }

        if (sorts && sorts.length > 0) {
            const sortConditions = sorts.map(sort => {
                if (sort.property === SummaryProperty.Stock) {
                    return `stock ${typeToOperator(sort.orientation)}`;
                } else {
                    return `${sort.property} ${typeToOperator(sort.orientation)}`;
                }
            });

            if (sortConditions.length > 0) {
                query += ` ORDER BY ${sortConditions.join(', ')}`;
            }
        }

        const stmt = db.prepare(query);
        return stmt.all(...queryParams);
    } catch (error) {
        console.error("Error fetching sales:", error);
        return [];
    }
}

export function getSalesSummary(startDate: string, endDate: string): { [objectName: string]: number } {
    try {
        const query = `
            SELECT object, SUM(quantity) as total_quantity
            FROM sales
            WHERE date BETWEEN ? AND ?
            GROUP BY object
        `;

        const stmt = db.prepare(query);
        const results = stmt.all(startDate, endDate);

        const salesSummary: { [objectName: string]: number } = {};

        results.forEach((row: { object: string | number; total_quantity: number; }) => {
            salesSummary[row.object] = row.total_quantity;
        });

        return salesSummary;
    } catch (error) {
        console.error("Error fetching sales summary:", error);
        return {};
    }
}

export function getRevenueData(timeFrame: TimeFrame): { x: string, y: number }[] {
    try {
        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;
        let sqlFormat: string;
        let expectedLabels: string[] = [];
        let dbToLabelMap: Record<string, string> = {};

        switch (timeFrame) {
            case TimeFrame.DAY:
                // Last 24 hours
                startDate = new Date(now);
                startDate.setHours(now.getHours() - 23, now.getMinutes(), 0, 0);
                sqlFormat = "strftime('%Y-%m-%d %H', date)";

                // Create labels for last 24 hours
                for (let i = 0; i < 24; i++) {
                    const hour = new Date(startDate);
                    hour.setHours(hour.getHours() + i);
                    const hourLabel = format(hour, 'HH') + 'h';
                    expectedLabels.push(hourLabel);
                    dbToLabelMap[format(hour, 'yyyy-MM-dd HH')] = hourLabel;
                }
                break;

            case TimeFrame.WEEK:
                // Last 7 days
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 6);
                startDate.setHours(0, 0, 0, 0);
                sqlFormat = "date(date)";

                // Create labels for each day of the last week
                for (let i = 0; i < 7; i++) {
                    const day = new Date(startDate);
                    day.setDate(day.getDate() + i);
                    const label = format(day, 'EEE');
                    expectedLabels.push(label);
                    dbToLabelMap[format(day, 'yyyy-MM-dd')] = label;
                }
                break;

            case TimeFrame.MONTH:
                // Last 4 weeks
                startDate = new Date(now);
                startDate.setDate(now.getDate() - 28);
                startDate.setHours(0, 0, 0, 0);
                sqlFormat = "strftime('%Y-%W', date)"; // Year and week number

                // Create labels for the last 4 weeks
                for (let i = 0; i < 4; i++) {
                    const weekStart = new Date(startDate);
                    weekStart.setDate(weekStart.getDate() + (i * 7));
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 6);

                    // Format: "Jan 1-7" or "Jan 29-Feb 4"
                    let label;
                    if (weekStart.getMonth() === weekEnd.getMonth()) {
                        label = format(weekStart, 'MMM d') + '-' + format(weekEnd, 'd');
                    } else {
                        label = format(weekStart, 'MMM d') + '-' + format(weekEnd, 'MMM d');
                    }

                    expectedLabels.push(label);

                    // Map the year-week to this label
                    const yearWeek = format(weekStart, 'yyyy') + '-' +
                        format(weekStart, 'ww').padStart(2, '0');
                    dbToLabelMap[yearWeek] = label;
                }
                break;

            case TimeFrame.YEAR:
                // Last 12 months
                startDate = new Date(now);
                startDate.setMonth(now.getMonth() - 11);
                startDate.setDate(1);
                startDate.setHours(0, 0, 0, 0);
                sqlFormat = "strftime('%Y-%m', date)";

                // Create labels for last 12 months
                for (let i = 0; i < 12; i++) {
                    const month = new Date(startDate);
                    month.setMonth(month.getMonth() + i);
                    const label = format(month, 'MMM yy');
                    expectedLabels.push(label);
                    dbToLabelMap[format(month, 'yyyy-MM')] = label;
                }
                break;

            case TimeFrame.ALL:
                // All time - grouped by year
                startDate = new Date(0); // Unix epoch
                sqlFormat = "strftime('%Y', date)";
                // No expectedLabels for ALL - we'll use whatever years exist in the data
                break;

            default:
                throw new Error("Invalid time frame");
        }

        const query = `
            SELECT ${sqlFormat} as period, SUM(price * quantity) as revenue
            FROM sales
            WHERE date BETWEEN ? AND ?
            GROUP BY period
            ORDER BY period
        `;

        const stmt = db.prepare(query);
        const results = stmt.all(format(startDate, 'yyyy-MM-dd HH:mm:ss'), format(endDate, 'yyyy-MM-dd HH:mm:ss'));

        // Create the result list
        let revenueData: { x: string, y: number }[] = [];

        // Special handling for ALL timeframe
        if (timeFrame === TimeFrame.ALL) {
            results.forEach((row: { period: string | number; revenue: number; }) => {
                revenueData.push({ x: row.period.toString(), y: row.revenue || 0 });
            });
            return revenueData;
        }

        // Initialize all expected labels with 0
        expectedLabels.forEach(label => {
            revenueData.push({ x: label, y: 0 });
        });

        // Fill in actual revenue data
        results.forEach((row: { period: { toString: () => any; }; revenue: number; }) => {
            const dbKey = row.period.toString();
            if (dbKey in dbToLabelMap) {
                const label = dbToLabelMap[dbKey];
                const index = revenueData.findIndex(item => item.x === label);
                if (index !== -1) {
                    revenueData[index].y = row.revenue || 0;
                }
            }
        });

        return revenueData;
    } catch (error) {
        console.error("Error fetching revenue data by time frame:", error);
        return [];
    }
}
