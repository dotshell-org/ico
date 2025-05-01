import { db } from '../config.ts';

db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        object TEXT,
        quantity INTEGER,
        price REAL,
        stock TEXT
    )
`);
