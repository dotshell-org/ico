import {createRequire} from 'module';
import {Filter} from "../types/filter/Filter.ts";
import {Sort} from "../types/sort/Sort.ts";
import {Operator} from "../types/filter/Operator.ts";
import {Orientation} from "../types/sort/Orientation.ts";
import {SummaryProperty} from "../types/summary/SummaryProperty.ts";
import dayjs from "dayjs";
import {Credit} from "../types/detailed-credits/Credit.ts";
import {CreditTable, CreditTableRow} from "../types/detailed-credits/CreditTable.ts";
import {MoneyType} from "../types/detailed-credits/MoneyType.ts";

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// Util function

function typeToOperator(type: Operator | Orientation): string {
    if (type === Operator.Is) {
        return "LIKE";
    } else if (type === Operator.IsExactly) {
        return "=";
    } else if (type === Operator.MoreThan) {
        return ">";
    } else if (type === Operator.LessThan) {
        return "<";
    } else if (type === Orientation.Asc) {
        return "ASC";
    } else if (type === Orientation.Desc) {
        return "DESC";
    } else {
        throw new Error(`Unsupported operator type: ${type}`);
    }
}

// Database configuration
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = { };

// Create or open the database
const db = new Database(DATABASE_PATH, DB_OPTIONS);

// Create the tables if they don't exist
db.exec(`
    CREATE TABLE IF NOT EXISTS debits (
        id INTEGER PRIMARY KEY,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS credits_groups (
        id INTEGER PRIMARY KEY,
        date TEXT,
        title TEXT,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS credits_tables (
        id INTEGER PRIMARY KEY,
        group_id INTEGER,
        type TINYINT, -- 0: other, 1: banknotes, 2: coins, 3: cheques
        FOREIGN KEY (group_id) REFERENCES credits_groups(id)
    );

    CREATE TABLE IF NOT EXISTS credits_rows (
        id INTEGER PRIMARY KEY,
        table_id INTEGER,
        quantity TINYINT,
        amount REAL,
        FOREIGN KEY (table_id) REFERENCES credits_tables(id)
    );
`);

/**
 * Retrieve all credit records from the database.
 *
 * @returns An array of credit records.
 */
export function getCredits(filters: Filter[], sort: Sort[]) {
    let query = `
        SELECT
            ct.id AS id,
            cg.date,
            cg.title,
            cg.category,
            ct.type,
            SUM(cr.quantity * cr.amount) AS amount
        FROM
            credits_groups cg
                JOIN
            credits_tables ct ON cg.id = ct.group_id
                JOIN
            credits_rows cr ON ct.id = cr.table_id
    `;
    const queryParams: any[] = [];
    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
            } else {
                queryParams.push(filter.value);
            }
            return `${filter.property} ${typeToOperator(filter.operator)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY ct.id, cg.date, cg.title, cg.category";

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }
    const stmt = db.prepare(query);
    const rows = stmt.all(...queryParams);

    const typeToEmoji = (type: MoneyType): string => {
        if (type == MoneyType.Other) {
            return "\uD83D\uDCB3\uFE0F";
        } else if (type == MoneyType.Banknotes) {
            return "\uD83D\uDCB5";
        } else if (type == MoneyType.Cheques) {
            return "\uD83D\uDD8B";
        } else if (type == MoneyType.Coins) {
            return "\uD83E\uDE99";
        }
        return ""
    }

    return rows.map((row: { id: any; date: any; title: any; category: any; type: MoneyType; amount: any; }) => {
        return {
            id: row.id,
            date: row.date,
            title: `${row.title} (${typeToEmoji(row.type)})`,
            amount: row.amount,
            category: row.category,
        }
    })
}

/**
 * Retrieve all debit records from the database.
 *
 * @returns An array of debit records.
 */
export function getDebits(filters: Filter[], sort: Sort[]) {
    let query = "SELECT * FROM debits";
    const queryParams: any[] = [];

    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
            } else {
                queryParams.push(filter.value);
            }
            return `${filter.property} ${typeToOperator(filter.operator)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams);
}

/**
 * Retrieves credits and debits from the last 12 months and groups them by month.
 *
 * The function performs the following operations:
 * - Calculates the start date to cover the last 12 months.
 * - Queries the database to retrieve credits and debits with a date
 *   greater than or equal to the start date.
 * - Groups the results by month (format "YYYY-MM") and returns an object
 *   with two keys: "credits" and "debits".
 *
 * @returns An object containing two dictionaries: one for credits and one for debits.
 *          Each dictionary uses the month (format "YYYY-MM") as the key and the corresponding list of records as the value.
 */
export function getTransactionsByMonth(): number[][] {
    // Define the start date: from 11 months ago (including the current month)
    const startDate = dayjs().subtract(11, 'month').startOf('month').format('YYYY-MM-DD');

    // Retrieve credits from the start date
    const creditStmt = db.prepare(`
        SELECT cg.date, SUM(cr.quantity * cr.amount) AS amount
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date >= ?
        GROUP BY cg.date
    `);
    const creditRecords = creditStmt.all(startDate);

    // Retrieve debits from the start date
    const debitStmt = db.prepare(`
        SELECT date, amount FROM debits
        WHERE date >= ?
    `);
    const debitRecords = debitStmt.all(startDate);

    // Build the list of 12 months (format "YYYY-MM")
    const months: string[] = [];
    const startMonth = dayjs().subtract(11, 'month').startOf('month');
    for (let i = 0; i < 12; i++) {
        months.push(startMonth.add(i, 'month').format('YYYY-MM'));
    }

    // Initialize two arrays of 12 numbers (indexed from 0 to 11) with 0
    const creditSums: number[] = Array(12).fill(0);
    const debitSums: number[] = Array(12).fill(0);

    // Sum the amounts for credits
    for (const credit of creditRecords) {
        const monthKey = dayjs(credit.date).format('YYYY-MM');
        const monthIndex = months.indexOf(monthKey);
        if (monthIndex !== -1) {
            creditSums[monthIndex] += credit.amount;
        }
    }

    // Sum the amounts for debits
    for (const debit of debitRecords) {
        const monthKey = dayjs(debit.date).format('YYYY-MM');
        const monthIndex = months.indexOf(monthKey);
        if (monthIndex !== -1) {
            debitSums[monthIndex] += debit.amount;
        }
    }

    // Return an array containing two arrays of 12 elements each
    return [creditSums, debitSums];
}

/**
 * Retrieve the sum of credits for each category last 12 months.
 *
 * @returns An object with two arrays:
 *          - categories: an array of categories,
 *          - totals: an array of the summed credit amounts corresponding to each category.
 */
export function getCreditsSumByCategory(): { categories: string[]; values: number[] } {
    // SQL query to sum credits grouped by category
    const dateThreshold = dayjs().subtract(12, "month").toISOString();
    const query = `
        SELECT cg.category, SUM(cr.quantity * cr.amount) as total
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date > ?
        GROUP BY cg.category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(dateThreshold);

    // Map the rows to separate arrays for categories and totals
    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}

/**
 * Retrieve the sum of debits for each category last 12 months.
 *
 * @returns An object with two arrays:
 *          - categories: an array of categories,
 *          - totals: an array of the summed debit amounts corresponding to each category.
 */
export function getDebitsSumByCategory(): { categories: string[]; values: number[] } {
    // SQL query to sum debits grouped by category
    const dateThreshold = dayjs().subtract(12, "month").toISOString();
    const query = `
        SELECT category, SUM(amount) as total
        FROM debits
        WHERE date >= ?
        GROUP BY category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(dateThreshold);

    // Map the rows to separate arrays for categories and totals
    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}

/**
 * Retrieves a list of credit groups with their details, applying optional filters and sorting.
 *
 * This function constructs a SQL query to fetch credit groups from the database,
 * including their IDs, titles, types of associated tables, and the total amount of all tables.
 * The results can be filtered and sorted based on the provided parameters.
 *
 * @param filters - An array of Filter objects to apply to the query. Each filter
 *                  specifies a property, an operator, and a value to filter the results.
 *                  Example: [{ property: 'category', operator: Operator.Is, value: 'Salary' }]
 * @param sorts - An array of Sort objects to sort the query results. Each sort
 *                specifies a property and an orientation (ascending or descending).
 *                Example: [{ property: 'date', orientation: Orientation.Desc }]
 *
 * @returns An array of objects, each representing a credit group with the following properties:
 *          - id: The ID of the credit group.
 *          - title: The title of the credit group.
 *          - types: An array of table types associated with the credit group.
 *          - totalAmount: The total amount of all tables associated with the credit group.
 *
 * @example
 * const filters = [{ property: 'category', operator: Operator.Is, value: 'Salary' }];
 * const sorts = [{ property: 'date', orientation: Orientation.Desc }];
 * const creditsList = getCreditsList(filters, sorts);
 */
export function getCreditsList(filters: Filter[], sorts: Sort[]): Credit[] {
    let query = `
        SELECT
            cg.id AS group_id,
            cg.title AS group_title,
            cg.date AS group_date,
            cg.category AS group_category,
            JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.id, 0)) AS table_ids,
            JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.type, 0)) AS table_types,
            COALESCE(SUM(cr.quantity * cr.amount), 0) AS total_amount
        FROM
            credits_groups cg
                LEFT JOIN credits_tables ct ON cg.id = ct.group_id
                LEFT JOIN credits_rows cr ON ct.id = cr.table_id
    `;
    const queryParams: any[] = [];

    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
            } else {
                queryParams.push(filter.value);
            }
            return `${filter.property} ${typeToOperator(filter.operator)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY cg.id, cg.title";

    if (sorts.length > 0) {
        const sortConditions = sorts.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...queryParams);

    return rows.map((row: any) => ({
        category: row.group_category,
        id: row.group_id,
        title: row.group_title,
        date: row.group_date,
        tableIds: JSON.parse(row.table_ids) as number[],
        types: [...(JSON.parse(row.table_types) as MoneyType[]).filter(type => type !== MoneyType.Other), MoneyType.Other],
        totalAmount: row.total_amount || 0,
    }));
}

/**
 * Retrieves a credit table from the database based on the given table ID.
 *
 * @param {number} id - The unique identifier of the credit table to retrieve.
 * @return {CreditTable} An object representing the credit table, including its type and rows.
 */
export function getCreditTableFromId(id: number): CreditTable {
    const query = `
        SELECT 
            cr.id AS row_id, 
            cr.quantity, 
            cr.amount, 
            ct.type AS table_type
        FROM credits_rows cr
        JOIN credits_tables ct ON cr.table_id = ct.id
        WHERE ct.id = ?
    `;
    let stmt = db.prepare(query);
    let rows = stmt.all(id);

    if (rows.length === 0) {
        const query = `
            SELECT
                ct.type AS table_type
            FROM credits_tables ct
            WHERE ct.id = ?
        `;
        stmt = db.prepare(query);
        rows = stmt.all(id);
        if (rows.length === 0) {
            throw new Error(`Credit table with ID ${id} not found`);
        }

        return {
            type: rows[0].table_type,
            rows: []
        }
    } else {
        return {
            type: rows[0].table_type,
            rows: rows.map((row: any) => ({
                id: row.row_id,
                quantity: row.quantity,
                amount: row.amount,
            }))
        };
    }
}

/**
 * Retrieves other money credits associated with a given group ID.
 *
 * @param {number} id - The ID of the credits group to query.
 * @return {CreditTable} An object containing the type of the credit table and an array of rows representing the credits.
 */
export function getOtherMoneyCreditsFromId(id: number): CreditTable {
    const query = `
        SELECT cr.id AS row_id, cr.amount
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.id = ? AND ct.type = 0;
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(id);

    return {
        type: MoneyType.Other,
        rows: rows.map((row: any) => ({
            id: row.row_id,
            quantity: 2,
            amount: row.amount,
        }))
    };
}

/**
 * Adds a new row to a credit table.
 * 
 * @param {number} tableId - The ID of the credit table where the row should be added.
 * @param {number} amount - The denomination amount to add.
 * @param {number} quantity - The quantity of the denomination.
 * @returns {CreditTableRow} The newly created row with its ID.
 */
export function addCreditRow(tableId: number, amount: number, quantity: number): CreditTableRow {
    // Check if the amount already exists in this table
    const checkStmt = db.prepare(`
        SELECT id FROM credits_rows 
        WHERE table_id = ? AND amount = ?
    `);
    const existing = checkStmt.get(tableId, amount);
    
    if (existing) {
        throw new Error(`A row with amount ${amount} already exists in this table`);
    }
    
    const stmt = db.prepare(`
        INSERT INTO credits_rows (table_id, quantity, amount)
        VALUES (?, ?, ?)
    `);
    
    const info = stmt.run(tableId, quantity, amount);
    
    return {
        id: info.lastInsertRowid as number,
        amount,
        quantity
    };
}

/**
 * Updates the quantity of an existing credit row.
 * 
 * @param {number} rowId - The ID of the credit row to update.
 * @param {number} quantity - The new quantity value.
 * @returns {boolean} True if the update was successful.
 */
export function updateCreditRow(rowId: number, quantity: number): boolean {
    const stmt = db.prepare(`
        UPDATE credits_rows
        SET quantity = ?
        WHERE id = ?
    `);
    
    const info = stmt.run(quantity, rowId);
    return info.changes > 0;
}

/**
 * Updates the amount of an "other" credit row.
 * 
 * @param {number} rowId - The ID of the credit row to update.
 * @param {number} amount - The new amount value.
 * @returns {boolean} True if the update was successful.
 */
export function updateOtherCreditRow(rowId: number, amount: number): boolean {
    const stmt = db.prepare(`
        UPDATE credits_rows
        SET amount = ?
        WHERE id = ?
    `);
    
    const info = stmt.run(amount, rowId);
    return info.changes > 0;
}

/**
 * Deletes a credit row from the database.
 * 
 * @param {number} rowId - The ID of the credit row to delete.
 * @returns {boolean} True if the deletion was successful.
 */
export function deleteCreditRow(rowId: number): boolean {
    const stmt = db.prepare(`
        DELETE FROM credits_rows
        WHERE id = ?
    `);
    
    const info = stmt.run(rowId);
    return info.changes > 0;
}

/**
 * Adds a new row to the "other" credit table type.
 * 
 * @param {number} groupId - The ID of the credit group.
 * @param {number} amount - The amount to add.
 * @returns {CreditTableRow} The newly created row with its ID.
 */
export function addOtherCreditRow(groupId: number, amount: number): CreditTableRow {
    // First, check if there's an "other" type table for this group, if not create one
    const checkTableStmt = db.prepare(`
        SELECT id FROM credits_tables 
        WHERE group_id = ? AND type = ?
    `);
    
    let tableId: number;
    const existingTable = checkTableStmt.get(groupId, MoneyType.Other);
    
    if (existingTable) {
        tableId = existingTable.id;
    } else {
        // Create new "other" table
        const createTableStmt = db.prepare(`
            INSERT INTO credits_tables (group_id, type)
            VALUES (?, ?)
        `);
        const tableInfo = createTableStmt.run(groupId, MoneyType.Other);
        tableId = tableInfo.lastInsertRowid as number;
    }
    
    // Now add the row to the table
    const stmt = db.prepare(`
        INSERT INTO credits_rows (table_id, quantity, amount)
        VALUES (?, ?, ?)
    `);
    
    // For "other" type, quantity is always 1
    const quantity = 1;
    const info = stmt.run(tableId, quantity, amount);
    
    return {
        id: info.lastInsertRowid as number,
        amount,
        quantity
    };
}

export const deleteCreditTable = async (tableId: number) => {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        db.prepare('DELETE FROM credits_rows WHERE table_id = ?').run(tableId);
        db.prepare('DELETE FROM credits_tables WHERE id = ?').run(tableId);
        db.prepare('COMMIT').run();
        return true;
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
};

/**
 * Updates the credit date for a specific credit group in the database.
 *
 * @param {number} creditId - The unique identifier of the credit group to update.
 * @param {string} newDate - The new date to be set for the credit group in ISO 8601 format.
 * @return {object} An object containing the result of the database update operation.
 */
export function updateCreditDate(creditId: number, newDate: string) {
    const stmt = db.prepare(`
    UPDATE credits_groups
    SET date = ?
    WHERE id = ?
  `);
    return stmt.run(newDate, creditId);
}

/**
 * Adds a credit table entry to the database for the specified group and money type.
 *
 * @param {number} groupId - The ID of the group to associate with the credit table entry.
 * @param {MoneyType} type - The type of money associated with the credit table entry.
 * @return {object} An object containing the ID of the last inserted row in the database.
 */
export function addCreditTable(groupId: number, type: MoneyType): number {
    const stmt = db.prepare("INSERT INTO credits_tables (group_id, type) VALUES (?, ?)");
    stmt.run(groupId, type);

    return db.prepare("SELECT last_insert_rowid() AS id").get().id;
}

/**
 * Updates the title of a credit group for a given credit ID.
 *
 * @param {number} creditId - The unique identifier of the credit group to update.
 * @param {string} newTitle - The new title to set for the credit group.
 * @return {number} The number of rows that were updated in the database.
 */
export function updateCreditTitle(creditId: number, newTitle: string) {
    const stmt = db.prepare("UPDATE credits_groups SET title = ? WHERE id = ?");
    const info = stmt.run(newTitle, creditId);
    return info.changes;
}

/**
 * Updates the category of a credit in the database.
 *
 * @param {number} creditId - The unique identifier of the credit to be updated.
 * @param {string} newCategory - The new category to assign to the credit.
 * @return {void} This function does not return any value.
 */
export function updateCreditCategory(creditId: number, newCategory: string): void {
    const query = `
    UPDATE credits_groups
    SET category = ?
    WHERE id = ?
  `;
    const stmt = db.prepare(query);
    stmt.run(newCategory, creditId);
}

/**
 * Retrieves all distinct categories from the credits_groups database table.
 *
 * @return {Array<Object>} An array of objects representing the distinct categories.
 */
export function getAllCategories(): string[] {
    const stmt = db.prepare(`
        SELECT DISTINCT category 
        FROM (
            SELECT category FROM credits_groups
            UNION
            SELECT category FROM debits
        )
    `);
    return stmt.all().map((row: any) => row.category);
}