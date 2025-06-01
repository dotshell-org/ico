import { db } from '../config.js';

db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        object TEXT,
        quantity INTEGER,
        price REAL,
        stock TEXT,
        movement_id INTEGER
    )
`);
