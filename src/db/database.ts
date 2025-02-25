import { createRequire } from 'module';
import { Filter } from "../types/filter/Filter.ts";
import { Sort } from "../types/sort/Sort.ts";
import { Operator } from "../types/filter/Operator.ts";
import { Orientation } from "../types/sort/Orientation.ts";
import { SummaryProperty } from "../types/summary/SummaryProperty.ts";
import dayjs from "dayjs";
import {Credit} from "../types/detailed-credits/Credit.ts";
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
            cr.id AS id,
            cg.date,
            cg.title,
            SUM(cr.quantity * cr.amount) AS amount,
            cg.category
        FROM
            credits_groups cg
                JOIN
            credits_tables ct ON cg.id = ct.group_id
                JOIN
            credits_rows cr ON ct.id = cr.table_id
    `;

    const queryParams: any[] = [];

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

    query += " GROUP BY cg.id, cg.date, cg.title, cg.category";

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams);
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
            JSON_GROUP_ARRAY(ct.type) AS table_types,
            SUM(cr.quantity * cr.amount) AS total_amount
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

    query += " GROUP BY cg.id, cg.title";

    if (sorts.length > 0) {
        const sortConditions = sorts.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...queryParams);

    return rows.map((row: any) => ({
        id: row.group_id,
        title: row.group_title,
        types: JSON.parse(row.table_types).filter((_: any, index: number) => index % 2 === 0) as MoneyType[],
        totalAmount: row.total_amount,
    }));
}
