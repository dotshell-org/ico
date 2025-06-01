import {StockObject} from "../../../types/stock/StockObject.js";
import {db, typeToOperator} from "../config.js";
import {Filter} from "../../../types/stock/summary/filter/Filter.js";
import {Sort} from "../../../types/stock/summary/sort/Sort.js";
import {Movement} from "../../../types/stock/summary/Movement.js";
import {SummaryProperty} from "../../../types/stock/summary/SummaryProperty.js";
import {Operator} from "../../../types/stock/summary/filter/Operator.js";
import {InvoiceProductLink} from "../../../types/stock/InvoiceProductLink.js";
import {InvoiceProductLinkProps} from "../../../types/stock/InvoiceProductLinkProps.js";

/**
 * Fetches the current inventory of objects based on movements in the database up to a specific date.
 * The method calculates the net quantity for each object and returns a list of objects
 * that have a positive quantity in stock.
 *
 * @param {string} date - The date (inclusive) up to which the inventory is calculated.
 * @param stockName
 * @return {StockObject[]} An array of stock objects, each containing an `id`, `name`, and `quantity`.
 */
export function getInventory(date: string, stockName?: string): StockObject[] {
    try {
        const stockNameCondition = stockName && stockName.trim() !== ""
            ? `AND stock_name = ?`
            : "";

        const stockNameFilter = stockName && stockName.trim() !== ""
            ? `WHERE stock_name = ?`
            : "";

        const stmt = db.prepare(`
            WITH inventory AS (
                SELECT 
                    ROW_NUMBER() OVER (ORDER BY object) AS id, 
                    object AS name,
                    COALESCE(
                        (
                            SELECT SUM(quantity)
                            FROM stock_movements
                            WHERE stock_movements.object = all_objects.object
                              AND date <= date(?, '+1 day')
                              ${stockNameCondition}
                        ), 
                        0
                    ) AS quantity
                FROM (
                    SELECT DISTINCT object
                    FROM stock_movements
                    ${stockNameFilter}
                ) all_objects
            )
            SELECT *
            FROM inventory
            WHERE quantity > 0
            ORDER BY name
        `);

        const params = stockName && stockName.trim() !== ""
            ? [date, stockName, stockName]
            : [date];

        return stmt.all(...params).map((row: { id: number; name: string; quantity: number }) => ({
            id: row.id,
            name: row.name,
            quantity: row.quantity,
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération de l'inventaire:", error);
        return [];
    }
}

/**
 * Retrieves a list of all unique objects from the stock_movements table,
 * sorted in alphabetical order.
 *
 * @return {string[]} An array of unique object strings. If an error occurs, an empty array is returned.
 */
export function getAllObjects(stockName?: string): string[] {
    try {
        const stockNameCondition = stockName && stockName.trim() !== ""
            ? `stock_name = ?`
            : `1=1`;

        const stmt = db.prepare(`
            SELECT DISTINCT object
            FROM stock_movements
            WHERE ${stockNameCondition}
            ORDER BY object ASC
        `);

        const params = stockName && stockName.trim() !== ""
            ? [stockName]
            : [];

        return stmt.all(...params).map((row: { object: string }) => row.object);
    } catch (error) {
        console.error("Erreur lors de la récupération des objets:", error);
        return [];
    }
}

/**
 * Retrieves a list of all unique stock names from the database, sorted in ascending order.
 *
 * @return {string[]} An array of stock names. Returns an empty array if an error occurs.
 */
export function getAllStocks(): string[] {
    try {
        const stmt = db.prepare(`
            SELECT DISTINCT stock_name
            FROM stock_movements
            ORDER BY stock_name;
        `);

        return stmt.all().map((row: { stock_name: string }) => row.stock_name);
    } catch (error) {
        console.error("Erreur lors de la récupération des noms de stock:", error);
        return [];
    }
}

/**
 * Retrieves a list of movements based on the specified filters and sorting criteria.
 * The method calculates cumulative quantities and optionally filters and sorts the result.
 *
 * @param {Filter[]} filters - An array of filter objects used to specify filtering conditions.
 * Each filter includes a property, operator, and value to define its filtering logic.
 * @param {Sort[]} sorts - An array of sort objects used to specify sorting behavior.
 * Each sort includes a property and orientation to determine the order of results.
 * @return {Movement[]} An array of `Movement` objects representing the filtered/sorted list of movements.
 */
export function getMovements(filters: Filter[], sorts: Sort[]): Movement[] {
    try {
        const queryParams: (string | number)[] = [];
        let query = `
            WITH all_movements AS (SELECT 
                ROW_NUMBER() OVER (ORDER BY date, id) as id, 
                id as local_id,
                date, 
                object, 
                stock_name, 
                SUM(quantity) OVER (PARTITION BY object, stock_name ORDER BY date, id) as quantity, 
                quantity as movement
            FROM stock_movements)
            SELECT id, local_id, date, object, stock_name, quantity, movement
            FROM all_movements`;

        if (filters && filters.length > 0) {
            const conditions = filters.map(filter => {
                if (filter.property === SummaryProperty.Stock) {
                    queryParams.push(`%${filter.value}%`);
                    return `stock_name ${typeToOperator(filter.operator)} ?`;
                } else if (filter.property === SummaryProperty.Quantity ||
                    filter.property === SummaryProperty.Movement) {
                    if (typeof filter.value === "string") {
                        queryParams.push(parseInt(filter.value));
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

/**
 * Retrieves a list of stock links from the database, representing invoice product details.
 *
 * @return {InvoiceProductLink[]} An array of objects containing stock link details,
 *                                including id, name, quantity, and whether it is linked.
 */
export function getStockLinks(linkedFilter: boolean | null): InvoiceProductLink[] {
    const stmt = db.prepare(`
        SELECT ip.id as id, i.issue_date as date, ip.name as name, ip.quantity as quantity, ip.addition_id as addition_id
        FROM invoice_products ip
        JOIN invoices i
        ON ip.invoice_id = i.id
        ${linkedFilter === true ? "WHERE ip.addition_id <> 0" : (linkedFilter === false ? "WHERE ip.addition_id = 0" : "")}
        ORDER BY i.issue_date ASC
    `);

    return stmt.all();
}

/**
 * Retrieves stock link properties for a given addition ID.
 *
 * @param {number} additionId - The ID of the addition to fetch related stock information.
 * @return {InvoiceProductLinkProps} The properties of the stock link, including object name, quantity, and stock name.
 */
export function getStockLinkProps(additionId: number): InvoiceProductLinkProps | undefined {
    const stmt = db.prepare(`
        SELECT object as name, quantity, date, stock_name
        FROM stock_movements
        WHERE id = ?
    `);
    return stmt.get(additionId);
}

/**
 * Retrieves the amount curve for a specific object in a stock over time.
 * Returns an array of 12 values representing the quantity at different points in time.
 *
 * @param {string} object - The name of the object to track
 * @param {string} stockName - The name of the stock to check
 * @return {number[]} An array of 12 numbers representing the quantity at different points in time
 */
export function getObjectAmountCurve(object: string, stockName: string): number[] {
    try {
        const stockNameCondition = stockName && stockName.trim() !== "" ? "AND stock_name = ?" : "";
        const stmt = db.prepare(`
            WITH RECURSIVE dates AS (SELECT date ('now', '-11 months') as date
            UNION ALL
            SELECT date (date, '+1 month')
            FROM dates
            WHERE date
                < date ('now')
                )
                , monthly_quantities AS (
            SELECT
                strftime('%Y-%m', date) as month, 
                COALESCE(SUM(quantity), 0) as monthly_change
            FROM stock_movements
            WHERE object = ? ${stockNameCondition}
            GROUP BY strftime('%Y-%m', date)
                )
                , initial_stock AS (
            SELECT COALESCE(SUM(quantity), 0) as initial_quantity
            FROM stock_movements
            WHERE object = ? ${stockNameCondition} AND date < date('now', '-11 months')
                )
                , cumulative_stock AS (
            SELECT
                d.date, (SELECT initial_quantity FROM initial_stock) +
                COALESCE ((
                SELECT SUM(mq.monthly_change)
                FROM monthly_quantities mq
                WHERE strftime('%Y-%m', d.date) >= mq.month
                ), 0) as cumulative_quantity
            FROM dates d
                )
            SELECT strftime('%Y-%m', date) as month,
                cumulative_quantity as quantity
            FROM cumulative_stock
            ORDER BY date
        `);

        const params = stockName && stockName.trim() !== ""
            ? [object, stockName, object, stockName]
            : [object, object];

        const result = stmt.all(...params);
        return result.map((row: { quantity: number }) => row.quantity);
    } catch (error) {
        console.error("Erreur lors de la récupération de la courbe de quantité:", error);
        return Array(12).fill(0);
    }
}

/**
 * Retrieves a list of all distinct object names from the stock_movements table.
 *
 * @return {string[]} An array of unique object names.
 */
export function getAllObjectNames(): string[] {
    const stmt = db.prepare(`
        SELECT DISTINCT object
        FROM stock_movements
    `);

    return stmt.all().map((row: { object: string }) => row.object);
}
