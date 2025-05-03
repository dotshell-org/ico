import { createRequire } from 'module';
import { Operator } from "../../types/accounting/filter/Operator.ts";
import { Orientation } from "../../types/accounting/sort/Orientation.ts";
import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';

const require = createRequire(import.meta.url);
const Database = require('better-sqlite3');

// Function to get the current account database path
function getCurrentDatabasePath(): string {
    let accountsDir: string;
    
    if (process.platform === 'win32') {
        // Windows: %APPDATA%\ico\accounts
        accountsDir = path.join(app.getPath('appData'), 'ico', 'accounts');
    } else if (process.platform === 'darwin') {
        // macOS: ~/Library/Application Support/ico/accounts
        accountsDir = path.join(app.getPath('userData'), 'accounts');
    } else {
        // Linux: ~/.config/ico/accounts
        accountsDir = path.join(app.getPath('userData'), 'accounts');
    }
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(accountsDir)) {
        fs.mkdirSync(accountsDir, { recursive: true });
    }
    
    const metadataPath = path.join(accountsDir, 'accounts.json');
    
    // If metadata doesn't exist yet, use default.account in the root directory
    if (!fs.existsSync(metadataPath)) {
        return "./default.account";
    }
    
    // Read the current account from metadata
    const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
    const currentAccountId = metadata.currentAccount;
    const currentAccount = metadata.accounts.find((account: any) => account.id === currentAccountId);
    
    return currentAccount ? currentAccount.path : "./default.account";
}

// Database configuration
export const DATABASE_PATH = getCurrentDatabasePath();
export const DB_OPTIONS = { };

// Create or open the database
export const db = new Database(DATABASE_PATH, DB_OPTIONS);

/**
 * Converts a given type to its corresponding SQL operator representation.
 *
 * @param {Operator | Orientation} type - The operator or orientation type to convert.
 * @return {string} The corresponding SQL operator or keyword as a string.
 * @throws {Error} If the given type is not supported.
 */
export function typeToOperator(type: Operator | Orientation): string {
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
