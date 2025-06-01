import {db, typeToOperator} from '../config.js';
import {Filter} from "../../../types/accounting/filter/Filter.js";
import {Sort} from "../../../types/accounting/sort/Sort.js";
import {Operator} from "../../../types/accounting/filter/Operator.js";
import {SummaryProperty} from "../../../types/accounting/summary/SummaryProperty.js";
import {Credit} from "../../../types/accounting/detailed-credits/Credit.js";
import {CreditTable, CreditTableRow} from "../../../types/accounting/detailed-credits/CreditTable.js";
import {MoneyType} from "../../../types/accounting/detailed-credits/MoneyType.js";
import dayjs from "dayjs";

/**
 * Retrieves the credits information based on the specified filters and sort options.
 *
 * @param {Filter[]} filters - An array of filter objects to define the filtering criteria for the query. Each filter specifies a property, an operator, and a value.
 * @param {Sort[]} sort - An array of sort objects to define the sorting order for the query. Each sort specifies a property and an orientation.
 * @return {Object[]} An array of credit objects, each containing the id, date, title (including emoji based on type), total amount, and category.
 */
export function getCredits(filters: Filter[], sort: Sort[]): object[] {
    let query = `
        WITH GroupTotals AS (
            SELECT
                ct.id AS id,
                cg.date,
                cg.title,
                cg.category,
                ct.type,
                SUM(cr.quantity * cr.amount) AS total_amount
            FROM
                credits_groups cg
                    JOIN
                credits_tables ct ON cg.id = ct.group_id
                    JOIN
                credits_rows cr ON ct.id = cr.table_id
            GROUP BY ct.id, cg.date, cg.title, cg.category, ct.type
        )
        SELECT * FROM GroupTotals
    `;
    const queryParams: any[] = [];
    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.property === SummaryProperty.Amount) {
                queryParams.push(filter.value);
                return `total_amount ${typeToOperator(filter.operator)} ?`;
            } else if (filter.operator === Operator.Is) {
                queryParams.push(`%${filter.value}%`);
                return `${filter.property} ${typeToOperator(filter.operator)} ?`;
            } else {
                queryParams.push(filter.value);
                return `${filter.property} ${typeToOperator(filter.operator)} ?`;
            }
        });
        query += " WHERE " + conditions.join(" AND ");
    }

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

    return rows.map((row: { id: any; date: any; title: any; category: any; type: MoneyType; total_amount: any; }) => {
        return {
            id: row.id,
            date: row.date,
            title: `${row.title} (${typeToEmoji(row.type)})`,
            totalAmount: row.total_amount,
            category: row.category,
        }
    })
}

/**
 * Retrieves a list of credits with filtering, sorting, and aggregation capabilities.
 *
 * @param {Filter[]} filters - An array of filter objects to apply conditions on the query.
 * @param {Sort[]} sorts - An array of sort objects to define the order of the results.
 * @return {Credit[]} - A list of credit objects with aggregated and processed data.
 */
export function getCreditsList(filters: Filter[], sorts: Sort[]): Credit[] {
    let query = `
        WITH GroupTotals AS (
            SELECT
                cg.id AS group_id,
                cg.title AS group_title,
                cg.date AS date,
                cg.category AS group_category,
                JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.id, 0)) AS table_ids,
                JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.type, 0)) AS table_types,
                COALESCE(SUM(cr.quantity * cr.amount), 0) AS total_amount
            FROM credits_groups cg
                     LEFT JOIN credits_tables ct ON cg.id = ct.group_id
                     LEFT JOIN credits_rows cr ON ct.id = cr.table_id
            GROUP BY cg.id, cg.title, cg.date, cg.category
        )
        SELECT * FROM GroupTotals
    `;

    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (filters.length > 0) {
        filters.forEach((filter) => {
            if (filter.property === SummaryProperty.Amount) {
                conditions.push(`total_amount ${typeToOperator(filter.operator)} ?`);
            } else {
                if (filter.operator === Operator.Is) {
                    conditions.push(`${filter.property} ${typeToOperator(filter.operator)} ?`);
                    queryParams.push(`%${filter.value}%`);
                } else {
                    conditions.push(`${filter.property} ${typeToOperator(filter.operator)} ?`);
                    queryParams.push(filter.value);
                }
            }
            if (filter.property === SummaryProperty.Amount) {
                queryParams.push(filter.value);
            }
        });
    }

    if (conditions.length > 0) {
        query += " WHERE " + conditions.join(" AND ");
    }

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
        date: row.date,
        tableIds: JSON.parse(row.table_ids) as number[],
        types: [...(JSON.parse(row.table_types) as MoneyType[]).filter(type => type !== MoneyType.Other), MoneyType.Other],
        totalAmount: row.total_amount || 0,
    }));
}

/**
 * Fetches the credit table details for a given ID.
 * This includes the type of the credit table and its associated rows,
 * where each row contains details such as ID, quantity, and amount.
 *
 * @param {number} id - The ID of the credit table to be retrieved.
 * @return {CreditTable} An object containing the type of credit table and its associated rows.
 * @throws {Error} If the credit table with the specified ID is not found.
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
            return {
                type: MoneyType.Other,
                rows: []
            }
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
 * Retrieves credit table data related to 'Other Money' based on a given group ID.
 *
 * @param {number} id - The ID of the credit group to fetch credits from.
 * @return {CreditTable} An object representing the credit table with type 'Other' and the associated rows of credit data.
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
 * Adds a new credit row to the credits table with the specified details.
 * Throws an error if a row with the same amount already exists in the specified table.
 *
 * @param {number} tableId - The unique identifier of the table where the credit row will be added.
 * @param {number} amount - The amount value for the credit row to be added.
 * @param {number} quantity - The quantity value for the credit row to be added.
 * @return {CreditTableRow} An object representing the newly added credit row, including its unique ID, amount, and quantity.
 */
export function addCreditRow(tableId: number, amount: number, quantity: number): CreditTableRow {
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
 * Updates the quantity in the credits_rows table for a specific row identified by its ID.
 *
 * @param {number} rowId - The unique identifier of the row to be updated.
 * @param {number} quantity - The new quantity value to be set in the row.
 * @return {boolean} Returns true if the row was successfully updated; otherwise, returns false.
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
 * Updates the amount of a specific credit row in the database.
 *
 * @param {number} rowId - The unique identifier of the credit row to update.
 * @param {number} amount - The new amount to set for the credit row.
 * @return {boolean} Returns true if the update was successful and at least one row was affected, otherwise false.
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
 * Deletes a credit row from the database based on the provided row ID.
 *
 * @param {number} rowId - The ID of the credit row to be deleted.
 * @return {boolean} Returns true if the delete operation was successful, otherwise false.
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
 * Adds a new "Other Credit" row to the database for a given group.
 * This method checks if a "credits_table" for the specified group and type already exists,
 * creates one if it does not, and then adds a new row with the specified amount.
 *
 * @param {number} groupId - The unique identifier of the group for which the credit row is to be added.
 * @param {number} amount - The monetary value to be added as a new credit row.
 * @return {CreditTableRow} An object representing the newly added credit row,
 *                          including its ID, quantity, and amount.
 */
export function addOtherCreditRow(groupId: number, amount: number): CreditTableRow {
    const checkTableStmt = db.prepare(`
        SELECT id FROM credits_tables
        WHERE group_id = ? AND type = ?
    `);

    let tableId: number;
    const existingTable = checkTableStmt.get(groupId, MoneyType.Other);

    if (existingTable) {
        tableId = existingTable.id;
    } else {
        const createTableStmt = db.prepare(`
            INSERT INTO credits_tables (group_id, type)
            VALUES (?, ?)
        `);
        const tableInfo = createTableStmt.run(groupId, MoneyType.Other);
        tableId = tableInfo.lastInsertRowid as number;
    }

    const stmt = db.prepare(`
        INSERT INTO credits_rows (table_id, quantity, amount)
        VALUES (?, ?, ?)
    `);

    const quantity = 1;
    const info = stmt.run(tableId, quantity, amount);

    return {
        id: info.lastInsertRowid as number,
        amount,
        quantity
    };
}

/**
 * Deletes a credit table specified by its table ID. This method removes
 * associated rows from the credits_rows table and the table itself
 * from the credits_tables table within a transaction.
 *
 * @param {number} tableId - The ID of the credit table to be deleted.
 * @return {boolean} Returns true if the operation is successful.
 * @throws {Error} Throws an error if the operation fails and a transaction rollback is performed.
 */
export function deleteCreditTable(tableId: number): boolean {
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
}

/**
 * Updates the credit date for a specific credit entry in the database.
 *
 * @param {number} creditId - The ID of the credit to update.
 * @param {string} newDate - The new date to assign to the credit in ISO format.
 * @return {object} The result of the database operation, including changes and lastInsertRowid properties.
 */
export function updateCreditDate(creditId: number, newDate: string): object {
    const stmt = db.prepare(`
    UPDATE credits_groups
    SET date = ?
    WHERE id = ?
  `);
    return stmt.run(newDate, creditId);
}

/**
 * Adds a new entry to the credits_tables database with the specified group ID and money type.
 *
 * @param {number} groupId - The ID of the group to associate with the credits table entry.
 * @param {MoneyType} type - The type of money to be added to the credits table.
 * @return {number} The ID of the newly created credits table entry.
 */
export function addCreditTable(groupId: number, type: MoneyType): number {
    const stmt = db.prepare("INSERT INTO credits_tables (group_id, type) VALUES (?, ?)");
    stmt.run(groupId, type);

    return db.prepare("SELECT last_insert_rowid() AS id").get().id;
}

/**
 * Updates the title of a credit group in the database.
 *
 * @param {number} creditId - The unique identifier of the credit group to update.
 * @param {string} newTitle - The new title to assign to the credit group.
 * @return {number} - The number of rows affected by the update operation.
 */
export function updateCreditTitle(creditId: number, newTitle: string): number {
    const stmt = db.prepare("UPDATE credits_groups SET title = ? WHERE id = ?");
    const info = stmt.run(newTitle, creditId);
    return info.changes;
}

/**
 * Updates the category of a specific credit record in the database.
 *
 * @param {number} creditId - The unique identifier of the credit record to be updated.
 * @param {string} newCategory - The new category to be assigned to the credit record.
 * @return {void} This method does not return a value.
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
 * Fetches and returns a list of all distinct categories from the database.
 *
 * This method retrieves categories from both `credits_groups` and `debits` tables,
 * combining and deduplicating them to produce a comprehensive list of unique categories.
 *
 * @return {string[]} An array of unique category names.
 */
export function getAllCategories(): string[] {
    const stmt = db.prepare(`
        SELECT DISTINCT category
        FROM (
                 SELECT category FROM credits_groups
                 UNION
                 SELECT category FROM invoices
             )
    `);
    return stmt.all().map((row: any) => row.category);
}

/**
 * Adds a new credit group to the database with the specified title and category.
 *
 * @param {string} title - The title of the credit group to be added.
 * @param {string} category - The category of the credit group to be added.
 * @return {Credit} The created credit group object containing details such as id, title, category, date, tableIds, types, and totalAmount.
 */
export function addCreditGroup(title: string, category: string): Credit {
    const stmt = db.prepare(`
        INSERT INTO credits_groups (title, date, category)
        VALUES (?, ?, ?)
    `);
    stmt.run(title, dayjs().format("YYYY-MM-DD"), category);

    return {
        category,
        id: db.prepare("SELECT last_insert_rowid() AS id").get().id,
        title,
        date: dayjs().format("YYYY-MM-DD"),
        tableIds: [],
        types: [MoneyType.Other],
        totalAmount: 0,
    };
}

/**
 * Deletes a credit group and all associated records from the database.
 * This includes rows in the `credits_rows`, `credits_tables`, and `credits_groups` tables
 * that are connected to the specified credit group.
 *
 * @param {number} creditId - The unique identifier of the credit group to be deleted.
 * @return {boolean} Returns true if the credit group was successfully deleted, otherwise undefined (in case of an error).
 */
export function deleteCreditGroup(creditId: number): void {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        db.prepare('DELETE FROM credits_rows WHERE table_id IN (SELECT id FROM credits_tables WHERE group_id = ?)').run(creditId);
        db.prepare('DELETE FROM credits_tables WHERE group_id = ?').run(creditId);
        db.prepare('DELETE FROM credits_groups WHERE id = ?').run(creditId);
        db.prepare('COMMIT').run();
    } catch (error) {
        db.prepare('ROLLBACK').run();
    }
}
