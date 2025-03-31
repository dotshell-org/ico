import {StockObject} from "../../../types/stock/StockObject.ts";
import {db, typeToOperator} from "../config.ts";
import {Filter} from "../../../types/stock/summary/filter/Filter.ts";
import {Sort} from "../../../types/stock/summary/sort/Sort.ts";
import {Movement} from "../../../types/stock/summary/Movement.ts";
import {SummaryProperty} from "../../../types/stock/summary/SummaryProperty.ts";
import {Operator} from "../../../types/stock/summary/filter/Operator.ts";
import {InvoiceProductLink} from "../../../types/stock/InvoiceProductLink.ts";
import {InvoiceProductLinkProps} from "../../../types/stock/InvoiceProductLinkProps.ts";

/**
 * Fetches the current inventory of objects based on additions and deletions in the database up to a specific date.
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

        const stmt = db.prepare(`
            WITH inventory AS (
                SELECT
                    ROW_NUMBER() OVER (ORDER BY object) AS id,
                    object AS name,
                    COALESCE((
                        SELECT SUM(quantity)
                        FROM additions
                        WHERE additions.object = all_objects.object
                        AND date <= ?
                        ${stockNameCondition}
                    ), 0)
                    -
                    COALESCE((
                        SELECT SUM(quantity)
                        FROM deletions
                        WHERE deletions.object = all_objects.object
                        AND date <= ?
                        ${stockNameCondition}
                    ), 0)
                    AS quantity
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

        const params = stockName && stockName.trim() !== ""
            ? [date, stockName, date, stockName]
            : [date, date];

        return stmt.all(...params).map((row: { id: number; name: string; quantity: number }) => ({
            id: row.id,
            name: row.name,
            quantity: row.quantity,
        }));
    } catch (error) {
        console.error("Erreur lors de la récupération de l’inventaire:", error);
        return [];
    }
}

/**
 * Retrieves a list of all unique objects from the additions and deletions tables,
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
            FROM additions
            WHERE ${stockNameCondition}
            UNION
            SELECT DISTINCT object
            FROM deletions
            WHERE ${stockNameCondition}
            ORDER BY object ASC
        `);

        const params = stockName && stockName.trim() !== ""
            ? [stockName, stockName]
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
            FROM additions
            UNION
            SELECT DISTINCT stock_name
            FROM deletions
            ORDER BY stock_name ASC
        `);

        return stmt.all().map((row: { stock_name: string }) => row.stock_name);
    } catch (error) {
        console.error("Erreur lors de la récupération des noms de stock:", error);
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
        SELECT ip.id as id, ip.name as name, ip.quantity as quantity, ip.addition_id as addition_id
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
export function getStockLinkProps(additionId: number): InvoiceProductLinkProps {
    const stmt = db.prepare(`
        SELECT a.object as name, a.quantity as quantity, s.name as stock_name
        FROM additions a
        JOIN stocks s ON s.id = a.stock_id
        WHERE a.id = ?
    `);
    return stmt.get(additionId);
}
