import { db } from '../config.ts';

db.exec(`
    CREATE TABLE IF NOT EXISTS stocks (
        id INTEGER PRIMARY KEY,
        name TEXT
    );
    CREATE TABLE IF NOT EXISTS additions (
        id INTEGER PRIMARY KEY,
        stock_id INTEGER,
        date TEXT,
        object TEXT,
        quantity INTEGER,
        
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
    CREATE TABLE IF NOT EXISTS deletions (
        id INTEGER PRIMARY KEY,
        stock_id INTEGER,
        date TEXT,
        object TEXT,
        quantity INTEGER,
        
        FOREIGN KEY (stock_id) REFERENCES stocks(id)
    );
`);
