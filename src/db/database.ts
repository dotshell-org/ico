import { createRequire } from 'module';
import { Filter } from "../types/filter/Filter.ts";
import { Sort } from "../types/sort/Sort.ts";
import { Operator } from "../types/filter/Operator.ts";
import { Orientation } from "../types/sort/Orientation.ts";
import { SummaryProperty } from "../types/summary/SummaryProperty.ts";
import dayjs from "dayjs";

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// Database configuration
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = { };

// SQL queries
const CREATE_CREDITS_TABLE = `
    CREATE TABLE IF NOT EXISTS credits (
                                           id BIGINT PRIMARY KEY AUTOINCREMENT,
                                           date TEXT,
                                           title TEXT,
                                           amount REAL,
                                           category TEXT
    );
`;
const CREATE_DEBITS_TABLE = `
    CREATE TABLE IF NOT EXISTS debits (
                                          id BIGINT PRIMARY KEY AUTOINCREMENT,
                                          date TEXT,
                                          title TEXT,
                                          amount REAL,
                                          category TEXT
    )
`

// Create or open the database
const db = new Database(DATABASE_PATH, DB_OPTIONS);

// Create the credits table if it doesn't exist
db.exec(CREATE_CREDITS_TABLE);
db.exec(CREATE_DEBITS_TABLE);

/**
 * Insert a new credit record into the database.
 *
 * @param date - The date of the credit (ISO string).
 * @param title - The title of the credit.
 * @param amount - The amount for the credit.
 * @param category - The category of the credit.
 * @returns The result of the insertion including the last inserted id.
 */
export function addCredit(
    date: string,
    title: string,
    amount: number,
    category: string
) {
    const INSERT_CREDIT_QUERY = `
        INSERT INTO credits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `;
    const stmt = db.prepare(INSERT_CREDIT_QUERY);
    return stmt.run(date, title, amount, category);
}

/**
 * Retrieve all credit records from the database.
 *
 * @returns An array of credit records.
 */
export function getCredits(filters: Filter[], sort: Sort[]) {
    let query = "SELECT * FROM credits";
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

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams);
}

/**
 * Insert a new debit record into the database.
 *
 * @param date - The date of the debit (ISO string).
 * @param title - The title of the debit.
 * @param amount - The amount for the debit.
 * @param category - The category of the debit.
 * @returns The result of the insertion including the last inserted id.
 */
export function addDebit(
    date: string,
    title: string,
    amount: number,
    category: string
) {
    const INSERT_CREDIT_QUERY = `
        INSERT INTO debits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `;
    const stmt = db.prepare(INSERT_CREDIT_QUERY);
    return stmt.run(date, title, amount, category);
}

/**
 * Retrieve all debit records from the database.
 *
 * @returns An array of debit records.
 */
export function getDebits(filters: Filter[], sort: Sort[]) {
    let query = "SELECT * FROM debits";
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
        SELECT date, amount FROM credits
        WHERE date >= ?
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
 * Retrieve the sum of credits for each category.
 *
 * @returns An object with two arrays:
 *          - categories: an array of categories,
 *          - totals: an array of the summed credit amounts corresponding to each category.
 */
export function getCreditsSumByCategory(): { categories: string[]; values: number[] } {
    // SQL query to sum credits grouped by category
    const query = `
        SELECT category, SUM(amount) as total
        FROM credits
        GROUP BY category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all();

    // Map the rows to separate arrays for categories and totals
    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}

/**
 * Retrieve the sum of debits for each category.
 *
 * @returns An object with two arrays:
 *          - categories: an array of categories,
 *          - totals: an array of the summed debit amounts corresponding to each category.
 */
export function getDebitsSumByCategory(): { categories: string[]; values: number[] } {
    // SQL query to sum debits grouped by category
    const query = `
        SELECT category, SUM(amount) as total
        FROM debits
        GROUP BY category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all();

    // Map the rows to separate arrays for categories and totals
    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}

/**
 * Retrieve the profit for each category.
 * Profit is calculated as the difference between the sum of credits and debits for each category.
 * Only positive profit values are returned.
 *
 * @returns An object with two arrays:
 *          - categories: an array of categories,
 *          - profits: an array of profit values corresponding to each category.
 */
export function getProfitByCategory(): { categories: string[]; values: number[] } {
    // SQL query combining credits and debits to calculate profit per category.
    // Credits add and debits subtract from the profit.
    const query = `
        SELECT category, SUM(credits_amount - debits_amount) AS profit
        FROM (
                 SELECT category, amount AS credits_amount, 0 AS debits_amount
                 FROM credits
                 UNION ALL
                 SELECT category, 0 AS credits_amount, amount AS debits_amount
                 FROM debits
             )
        GROUP BY category
        HAVING profit > 0
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all();

    // Map the rows to separate arrays for categories and profit values
    const categories = rows.map((row: { category: string; profit: number }) => row.category);
    const values = rows.map((row: { category: string; profit: number }) => row.profit);

    return { categories, values };
}
