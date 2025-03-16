import { db, typeToOperator } from './config';
import { Filter } from "../../types/filter/Filter";
import { Sort } from "../../types/sort/Sort";
import { Operator } from "../../types/filter/Operator";
import { SummaryProperty } from "../../types/summary/SummaryProperty";
import { Credit } from "../../types/detailed-credits/Credit";
import { CreditTable, CreditTableRow } from "../../types/detailed-credits/CreditTable";
import { MoneyType } from "../../types/detailed-credits/MoneyType";
import dayjs from "dayjs";

export function getCredits(filters: Filter[], sort: Sort[]) {
    let query = `
        SELECT
            ct.id AS id,
            cg.date,
            cg.title,
            cg.category,
            ct.type,
            SUM(cr.quantity * cr.amount) AS amount
        FROM
            credits_groups cg
                JOIN
            credits_tables ct ON cg.id = ct.group_id
                JOIN
            credits_rows cr ON ct.id = cr.table_id
    `;
    const queryParams: any[] = [];
    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
            } else {
                queryParams.push(filter.value);
            }
            return `${filter.property} ${typeToOperator(filter.operator)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY ct.id, cg.date, cg.title, cg.category";

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }
    const stmt = db.prepare(query);
    const rows = stmt.all(...queryParams);

    const typeToEmoji = (type: MoneyType): string => {
        if (type == MoneyType.Other) {
            return "\uD83D\uDCB3\uFE0F";
        } else if (type == MoneyType.Banknotes) {
            return "\uD83D\uDCB5";
        } else if (type == MoneyType.Cheques) {
            return "\uD83D\uDD8B";
        } else if (type == MoneyType.Coins) {
            return "\uD83E\uDE99";
        }
        return ""
    }

    return rows.map((row: { id: any; date: any; title: any; category: any; type: MoneyType; amount: any; }) => {
        return {
            id: row.id,
            date: row.date,
            title: `${row.title} (${typeToEmoji(row.type)})`,
            totalAmount: row.amount,
            category: row.category,
        }
    })
}

export function getCreditsList(filters: Filter[], sorts: Sort[]): Credit[] {
    let query = `
        SELECT
            cg.id AS group_id,
            cg.title AS group_title,
            cg.date AS group_date,
            cg.category AS group_category,
            JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.id, 0)) AS table_ids,
            JSON_GROUP_ARRAY(DISTINCT COALESCE(ct.type, 0)) AS table_types,
            COALESCE(SUM(cr.quantity * cr.amount), 0) AS total_amount
        FROM
            credits_groups cg
                LEFT JOIN credits_tables ct ON cg.id = ct.group_id
                LEFT JOIN credits_rows cr ON ct.id = cr.table_id
    `;
    const queryParams: any[] = [];

    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
            } else {
                queryParams.push(filter.value);
            }
            return `${filter.property} ${typeToOperator(filter.operator)} ?`;
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY cg.id, cg.title";

    if (sorts.length > 0) {
        const sortConditions = sorts.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    const rows = stmt.all(...queryParams);

    return rows.map((row: any) => ({
        category: row.group_category,
        id: row.group_id,
        title: row.group_title,
        date: row.group_date,
        tableIds: JSON.parse(row.table_ids) as number[],
        types: [...(JSON.parse(row.table_types) as MoneyType[]).filter(type => type !== MoneyType.Other), MoneyType.Other],
        totalAmount: row.total_amount || 0,
    }));
}

export function getCreditTableFromId(id: number): CreditTable {
    const query = `
        SELECT
            cr.id AS row_id,
            cr.quantity,
            cr.amount,
            ct.type AS table_type
        FROM credits_rows cr
        JOIN credits_tables ct ON cr.table_id = ct.id
        WHERE ct.id = ?
    `;
    let stmt = db.prepare(query);
    let rows = stmt.all(id);

    if (rows.length === 0) {
        const query = `
            SELECT
                ct.type AS table_type
            FROM credits_tables ct
            WHERE ct.id = ?
        `;
        stmt = db.prepare(query);
        rows = stmt.all(id);
        if (rows.length === 0) {
            throw new Error(`Credit table with ID ${id} not found`);
        }

        return {
            type: rows[0].table_type,
            rows: []
        }
    } else {
        return {
            type: rows[0].table_type,
            rows: rows.map((row: any) => ({
                id: row.row_id,
                quantity: row.quantity,
                amount: row.amount,
            }))
        };
    }
}

export function getOtherMoneyCreditsFromId(id: number): CreditTable {
    const query = `
        SELECT cr.id AS row_id, cr.amount
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.id = ? AND ct.type = 0;
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(id);

    return {
        type: MoneyType.Other,
        rows: rows.map((row: any) => ({
            id: row.row_id,
            quantity: 2,
            amount: row.amount,
        }))
    };
}

export function addCreditRow(tableId: number, amount: number, quantity: number): CreditTableRow {
    const checkStmt = db.prepare(`
        SELECT id FROM credits_rows
        WHERE table_id = ? AND amount = ?
    `);
    const existing = checkStmt.get(tableId, amount);

    if (existing) {
        throw new Error(`A row with amount ${amount} already exists in this table`);
    }

    const stmt = db.prepare(`
        INSERT INTO credits_rows (table_id, quantity, amount)
        VALUES (?, ?, ?)
    `);

    const info = stmt.run(tableId, quantity, amount);

    return {
        id: info.lastInsertRowid as number,
        amount,
        quantity
    };
}

export function updateCreditRow(rowId: number, quantity: number): boolean {
    const stmt = db.prepare(`
        UPDATE credits_rows
        SET quantity = ?
        WHERE id = ?
    `);

    const info = stmt.run(quantity, rowId);
    return info.changes > 0;
}

export function updateOtherCreditRow(rowId: number, amount: number): boolean {
    const stmt = db.prepare(`
        UPDATE credits_rows
        SET amount = ?
        WHERE id = ?
    `);

    const info = stmt.run(amount, rowId);
    return info.changes > 0;
}

export function deleteCreditRow(rowId: number): boolean {
    const stmt = db.prepare(`
        DELETE FROM credits_rows
        WHERE id = ?
    `);

    const info = stmt.run(rowId);
    return info.changes > 0;
}

export function addOtherCreditRow(groupId: number, amount: number): CreditTableRow {
    const checkTableStmt = db.prepare(`
        SELECT id FROM credits_tables
        WHERE group_id = ? AND type = ?
    `);

    let tableId: number;
    const existingTable = checkTableStmt.get(groupId, MoneyType.Other);

    if (existingTable) {
        tableId = existingTable.id;
    } else {
        const createTableStmt = db.prepare(`
            INSERT INTO credits_tables (group_id, type)
            VALUES (?, ?)
        `);
        const tableInfo = createTableStmt.run(groupId, MoneyType.Other);
        tableId = tableInfo.lastInsertRowid as number;
    }

    const stmt = db.prepare(`
        INSERT INTO credits_rows (table_id, quantity, amount)
        VALUES (?, ?, ?)
    `);

    const quantity = 1;
    const info = stmt.run(tableId, quantity, amount);

    return {
        id: info.lastInsertRowid as number,
        amount,
        quantity
    };
}

export async function deleteCreditTable(tableId: number) {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        db.prepare('DELETE FROM credits_rows WHERE table_id = ?').run(tableId);
        db.prepare('DELETE FROM credits_tables WHERE id = ?').run(tableId);
        db.prepare('COMMIT').run();
        return true;
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
}

export function updateCreditDate(creditId: number, newDate: string) {
    const stmt = db.prepare(`
    UPDATE credits_groups
    SET date = ?
    WHERE id = ?
  `);
    return stmt.run(newDate, creditId);
}

export function addCreditTable(groupId: number, type: MoneyType): number {
    const stmt = db.prepare("INSERT INTO credits_tables (group_id, type) VALUES (?, ?)");
    stmt.run(groupId, type);

    return db.prepare("SELECT last_insert_rowid() AS id").get().id;
}

export function updateCreditTitle(creditId: number, newTitle: string) {
    const stmt = db.prepare("UPDATE credits_groups SET title = ? WHERE id = ?");
    const info = stmt.run(newTitle, creditId);
    return info.changes;
}

export function updateCreditCategory(creditId: number, newCategory: string): void {
    const query = `
    UPDATE credits_groups
    SET category = ?
    WHERE id = ?
  `;
    const stmt = db.prepare(query);
    stmt.run(newCategory, creditId);
}

export function getAllCategories(): string[] {
    const stmt = db.prepare(`
        SELECT DISTINCT category
        FROM (
            SELECT category FROM credits_groups
            UNION
            SELECT category FROM debits
        )
    `);
    return stmt.all().map((row: any) => row.category);
}

export function addCreditGroup(title: string, category: string): Credit {
    const stmt = db.prepare(`
        INSERT INTO credits_groups (title, date, category)
        VALUES (?, ?, ?)
    `);
    stmt.run(title, dayjs().toISOString(), category);

    return {
        category,
        id: db.prepare("SELECT last_insert_rowid() AS id").get().id,
        title,
        date: dayjs().toISOString(),
        tableIds: [],
        types: [MoneyType.Other],
        totalAmount: 0,
    };
}

export function deleteCreditGroup(creditId: number) {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        db.prepare('DELETE FROM credits_rows WHERE table_id IN (SELECT id FROM credits_tables WHERE group_id = ?)').run(creditId);
        db.prepare('DELETE FROM credits_tables WHERE group_id = ?').run(creditId);
        db.prepare('DELETE FROM credits_groups WHERE id = ?').run(creditId);
        db.prepare('COMMIT').run();
        return true;
    } catch (error) {
        db.prepare('ROLLBACK').run();
    }
}
