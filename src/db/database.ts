import { createRequire } from 'module';
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

const INSERT_CREDIT_QUERY = `
    INSERT INTO credits (date, title, amount, category)
    VALUES (?, ?, ?, ?)
`;

const SELECT_CREDITS_QUERY = "SELECT * FROM credits";

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
    const stmt = db.prepare(INSERT_CREDIT_QUERY);
    return stmt.run(date, title, amount, category);
}

/**
 * Retrieve all credit records from the database.
 *
 * @returns An array of credit records.
 */
export function getCredits() {
    const stmt = db.prepare(SELECT_CREDITS_QUERY);
    return stmt.all();
}
