import { db } from '../config.js';

db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
        id INTEGER PRIMARY KEY,
        title TEXT,
        category TEXT,
        issue_date TEXT,
        sale_service_date TEXT,
        country_code INTEGER,
        no TEXT
    );
    CREATE TABLE IF NOT EXISTS invoice_products (
        id INTEGER PRIMARY KEY,
        invoice_id INTEGER,
        addition_id INTEGER,
        name TEXT,
        amount_excl_tax REAL,
        quantity INTEGER,
        tax_rate REAL,
        discount_percentage REAL,
        discount_amount REAL,

        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    );
    CREATE TABLE IF NOT EXISTS invoice_country_specifications (
        id INTEGER PRIMARY KEY,
        invoice_id INTEGER,
        key TEXT,
        value TEXT
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
