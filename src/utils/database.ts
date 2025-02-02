import Database from 'better-sqlite3';

class DatabaseUtils {
    static fetchCredits() {
        throw new Error("Method not implemented.");
    }
    private db: Database.Database;

    constructor() {
        this.db = new Database('localdata.db', { verbose: console.log });
        this.db.pragma('journal_mode = WAL');
        
        // Create the table if it doesn't exist
        this.db.prepare('CREATE TABLE IF NOT EXISTS credits (id INTEGER PRIMARY KEY, date TEXT, title TEXT, amount REAL, category TEXT)').run();

        // Clear the table
        this.db.prepare('DELETE FROM credits').run();

        // Insert a row
        const insert = this.db.prepare('INSERT INTO credits (date, title, amount, category) VALUES (?, ?, ?, ?)');
        insert.run('2021-01-01', 'Title 1', 100.00, 'Category 1');
    }

    public getDb(): Database.Database {
        return this.db;
    }

    public fetchCredits(): any[] {
        return this.db.prepare('SELECT * FROM credits').all();
    }

}

export default DatabaseUtils;