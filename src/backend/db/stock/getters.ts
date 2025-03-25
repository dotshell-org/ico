import {StockObject} from "../../../types/stock/StockObject.ts";
import {db} from "../config.ts";

/**
 * Fetches the current inventory of objects based on additions and deletions in the database up to a specific date.
 * The method calculates the net quantity for each object and returns a list of objects
 * that have a positive quantity in stock.
 *
 * @param {string} date - The date (inclusive) up to which the inventory is calculated.
 * @return {StockObject[]} An array of stock objects, each containing an `id`, `name`, and `quantity`.
 */
export function getInventory(date: string): StockObject[] {
    try {
        const stmt = db.prepare(`
            WITH inventory AS (
                SELECT
                    ROW_NUMBER() OVER (ORDER BY object) as id,
                        object as name,
                    (
                        COALESCE((SELECT SUM(amount) FROM additions WHERE additions.object = all_objects.object AND date <= ?), 0) -
                        COALESCE((SELECT SUM(amount) FROM deletions WHERE deletions.object = all_objects.object AND date <= ?), 0)
                        ) as quantity
                FROM (
                         SELECT DISTINCT object FROM additions
                         UNION
                         SELECT DISTINCT object FROM deletions
                     ) all_objects
            )
            SELECT * FROM inventory
            WHERE quantity > 0
            ORDER BY name
        `);

        return stmt.all(date, date).map((row: { id: number; name: string; quantity: number }) => ({
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
export function getAllObjects(): string[] {
    try {
        const stmt = db.prepare(`
            SELECT DISTINCT object FROM additions
            UNION
            SELECT DISTINCT object FROM deletions
            ORDER BY object ASC
        `);
        return stmt.all().map((row: { object: string }) => row.object);
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
 * @return {number[]} An array of 12 numbers representing the quantities.
 */
export function getObjectAmountCurve(object: string): number[] {
    try {
        const stmt = db.prepare(`
            WITH RECURSIVE months(offset, month_start) AS (SELECT 0,
                DATE ('now'
               , 'start of month')
            UNION ALL
            SELECT offset + 1, DATE ('now', 'start of month', '-' || (offset + 1) || ' months')
            FROM months
            WHERE
            offset < 11 ), cumulative_data AS (
            SELECT
                m.month_start, (
                COALESCE ((SELECT SUM (amount) FROM additions WHERE object = ? AND date < m.month_start), 0) -
                COALESCE ((SELECT SUM (amount) FROM deletions WHERE object = ? AND date < m.month_start), 0)
                ) AS quantity
            FROM months m
                )
            SELECT c.month_start,
                   CASE
                       WHEN c.month_start = DATE('now', 'start of month') THEN
                COALESCE ((SELECT SUM (amount) FROM additions WHERE object = ?), 0) -
                COALESCE ((SELECT SUM (amount) FROM deletions WHERE object = ?), 0)
                ELSE c.quantity
            END
            AS quantity
            FROM cumulative_data c
            ORDER BY c.month_start ASC
        `);

        return stmt.all(object, object, object, object).map((row: { quantity: number }) => row.quantity);
    } catch (error) {
        console.error("Error fetching object amount curve:", error);
        return [];
    }
}
