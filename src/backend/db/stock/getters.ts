import {StockObject} from "../../../types/stock/StockObject.ts";
import {db, typeToOperator} from "../config.ts";
import {Filter} from "../../../types/stock/summary/filter/Filter.ts";
import {Sort} from "../../../types/stock/summary/sort/Sort.ts";
import {Movement} from "../../../types/stock/summary/Movement.ts";
import {SummaryProperty} from "../../../types/stock/summary/SummaryProperty.ts";
import {Operator} from "../../../types/stock/summary/filter/Operator.ts";

/**
 * Fetches the current inventory of objects based on additions and deletions in the database up to a specific date.
 * The method calculates the net quantity for each object and returns a list of objects
 * that have a positive quantity in stock.
 *
 * @param {string} date - The date (inclusive) up to which the inventory is calculated.
 * @param stockId
 * @return {StockObject[]} An array of stock objects, each containing an `id`, `name`, and `quantity`.
 */
export function getInventory(date: string, stockId: number): StockObject[] {
    try {
        const stockIdCondition = stockId > 0 ? `AND stock_id = ?` : ``;
        const stmt = db.prepare(`
            WITH inventory AS (
                SELECT
                    ROW_NUMBER() OVER (ORDER BY object) as id,
                        object as name,
                    COALESCE((
                                 SELECT SUM(quantity)
                                 FROM additions
                                 WHERE additions.object = all_objects.object AND date <= ? ${stockIdCondition}
                    ), 0) -
                    COALESCE((
                                 SELECT SUM(quantity)
                                 FROM deletions
                                 WHERE deletions.object = all_objects.object AND date <= ? ${stockIdCondition}
                    ), 0) AS quantity
                FROM (
                         SELECT DISTINCT object
                         FROM additions
                         UNION
                         SELECT DISTINCT object
                         FROM deletions
                     ) all_objects
            )
            SELECT *
            FROM inventory
            WHERE quantity > 0
            ORDER BY name
        `);

        const params = stockId > 0 ? [date, stockId, date, stockId] : [date, date];
        return stmt.all(...params).map((row: { id: number; name: string; quantity: number }) => ({
            id: row.id,
            name: row.name,
            quantity: row.quantity,
        }));
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return [];
    }
}

/**
 * Retrieves a list of all unique objects from the additions and deletions tables,
 * sorted in alphabetical order.
 *
 * @return {string[]} An array of unique object strings. If an error occurs, an empty array is returned.
 */
export function getAllObjects(stockId: number): string[] {
    try {
        const stockIdCondition = stockId > 0 ? `stock_id = ?` : `1=1`;
        const stmt = db.prepare(`
            SELECT DISTINCT object FROM additions WHERE ${stockIdCondition}
            UNION
            SELECT DISTINCT object FROM deletions WHERE ${stockIdCondition}
            ORDER BY object ASC
        `);

        const params = stockId > 0 ? [stockId, stockId] : [];
        return stmt.all(...params).map((row: { object: string }) => row.object);
    } catch (error) {
        console.error("Error fetching all objects:", error);
        return [];
    }
}

/**
 * Fetches the stock amount curve of a specific object for the last 12 months.
 * The output is an array of 12 numbers representing the quantity of the object
 * at the start of each month, including the current quantity as the last value.
 *
 * @param {string} object - The name of the object to query.
 * @param stockId
 * @return {number[]} An array of 12 numbers representing the quantities.
 */
export function getObjectAmountCurve(object: string, stockId: number): number[] {
    try {
        const stockIdCondition = stockId > 0 ? `AND stock_id = ?` : ``;
        const stmt = db.prepare(`
            WITH RECURSIVE months(offset, month_start) AS (
                SELECT 0, DATE('now', 'start of month')
            UNION ALL
            SELECT offset + 1, DATE('now', 'start of month', '-' || (offset + 1) || ' months')
            FROM months
            WHERE offset < 11
                ),
                cumulative_data AS (
            SELECT
                m.month_start,
                COALESCE((
                SELECT SUM(quantity)
                FROM additions
                WHERE object = ? AND date < m.month_start ${stockIdCondition}
                    ), 0) -
                COALESCE((
                SELECT SUM(quantity)
                FROM deletions
                WHERE object = ? AND date < m.month_start ${stockIdCondition}
                    ), 0) AS quantity
            FROM months m
                )
            SELECT
                c.month_start,
                CASE
                    WHEN c.month_start = DATE('now', 'start of month') THEN
                COALESCE((
                SELECT SUM(quantity)
                FROM additions
                WHERE object = ? ${stockIdCondition}
                    ), 0) -
                COALESCE((
                SELECT SUM(quantity)
                FROM deletions
                WHERE object = ? ${stockIdCondition}
                    ), 0)
                ELSE c.quantity
            END AS quantity
            FROM cumulative_data c
            ORDER BY c.month_start ASC
        `);

        const params = stockId > 0 ?
            [object, stockId, object, stockId, object, stockId, object, stockId] :
            [object, object, object, object];

        return stmt.all(...params).map((row: { quantity: number }) => row.quantity);
    } catch (error) {
        console.error("Error fetching object amount curve:", error);
        return [];
    }
}

/**
 * Retrieves a list of movements based on the specified filters and sorting criteria.
 * The method consolidates data from additions and deletions, calculates cumulative quantities,
 * and optionally filters and sorts the result.
 *
 * @param {Filter[]} filters - An array of filter objects used to specify filtering conditions.
 * Each filter includes a property, operator, and value to define its filtering logic.
 * @param {Sort[]} sorts - An array of sort objects used to specify sorting behavior.
 * Each sort includes a property and orientation to determine the order of results.
 * @return {Movement[]} An array of `Movement` objects representing the consolidated and filtered/sorted list of movements.
 */
export function getMovements(filters: Filter[], sorts: Sort[]): Movement[] {
    try {
        const queryParams: (string | number)[] = [];
        let query = `
            WITH all_movements AS (
                SELECT ROW_NUMBER() OVER (ORDER BY date, m.id) as id,
                date,
                object,
                stock_id,
                SUM(movement) OVER (PARTITION BY object, stock_id ORDER BY date, m.id) as quantity,
                movement,
                s.name as stock_name
            FROM (
                SELECT id, date, object, quantity as movement, stock_id
                FROM additions
                UNION ALL
                SELECT id, date, object, -quantity as movement, stock_id
                FROM deletions
                ) m
                JOIN stocks s ON s.id = m.stock_id
                )
            SELECT id, date, object, stock_id, quantity, movement, stock_name
            FROM all_movements`;

        if (filters && filters.length > 0) {
            const conditions = filters.map(filter => {
                if (filter.property === SummaryProperty.Stock) {
                    queryParams.push(`%${filter.value}%`);
                    return `stock_name ${typeToOperator(filter.operator)} ?`;
                } else if (filter.property === SummaryProperty.Quantity ||
                    filter.property === SummaryProperty.Movement) {
                    queryParams.push(filter.value);
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
                    return `stock_name ${typeToOperator(sort.orientation)}`;
                } else {
                    return `${sort.property} ${typeToOperator(sort.orientation)}`
                }
            });

            if (sortConditions.length > 0) {
                query += ` ORDER BY ${sortConditions.join(', ')}`;
            }
        }

        const stmt = db.prepare(query);

        return stmt.all(...queryParams);
    } catch (error) {
        console.error("Error fetching movements:", error);
        return [];
    }
}
