import { db } from '../config.ts';

db.exec(`
    CREATE TABLE IF NOT EXISTS additions (
        id INTEGER PRIMARY KEY,
        date TEXT,
        object TEXT,
        amount INTEGER
    );
    CREATE TABLE IF NOT EXISTS deletions (
        id INTEGER PRIMARY KEY,
        date TEXT,
        object TEXT,
        amount INTEGER
    );
`);
