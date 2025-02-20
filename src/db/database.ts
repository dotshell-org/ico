import {createRequire} from 'module';
import {Filter} from "../types/filter/Filter.ts";
import {Sort} from "../types/sort/Sort.ts";
import {FilterType} from "../types/filter/FilterType.ts";
import {SortType} from "../types/sort/SortType.ts";

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// Database configuration
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = { };

// SQL queries
const CREATE_CREDITS_TABLE = `
    CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );
`;

// Create or open the database
const db = new Database(DATABASE_PATH, DB_OPTIONS);

// Create the credits table if it doesn't exist
db.exec(CREATE_CREDITS_TABLE);

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

    function typeToOperator(type: FilterType | SortType): string {
        if (type === FilterType.Is) {
            return "LIKE"
        }
        else if (type === FilterType.IsExactly) {
            return "="
        }
        else if (type === FilterType.MoreThan) {
            return ">"
        }
        else if (type === FilterType.LessThan) {
            return "<"
        }
        else if (type === SortType.Asc) {
            return "ASC"
        }
        else if (type === SortType.Desc) {
            return "DESC"
        }
        else {
            throw new Error(`Unsupported operator type: ${type}`);
        }
    }

    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            queryParams.push(filter.value);
            return `${filter.property} ${typeToOperator(filter.type)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.type)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams);
}