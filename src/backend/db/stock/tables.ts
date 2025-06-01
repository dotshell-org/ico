import { db } from '../config.js';

db.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stock_name TEXT,
        date TEXT,
        object TEXT,
        quantity INTEGER
    );
`);
