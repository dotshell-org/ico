import { db, typeToOperator } from './config';
import { Filter } from "../../types/filter/Filter";
import { Sort } from "../../types/sort/Sort";
import { Debit } from "../../types/invoices/Debit";
import dayjs from "dayjs";
import {Operator} from "../../types/filter/Operator.ts";
import {SummaryProperty} from "../../types/summary/SummaryProperty.ts";

export function getDebits(filters: Filter[], sort: Sort[]): Debit[] {
    let query = "SELECT id, title, date, category, amount FROM debits";
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

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams).map((row: { id: any; date: any; title: any; category: any; amount: any; }) => {
        return {
            id: row.id,
            title: row.title,
            date: row.date,
            category: row.category,
            totalAmount: row.amount,
        }
    })
}

export function addInvoice(title: string, category: string): Debit {
    const stmt = db.prepare(`
        INSERT INTO debits (title, amount, category, date)
        VALUES (?, ?, ?, ?)
    `);
    stmt.run(title, 0, category, dayjs().toISOString());

    return {
        id: db.prepare("SELECT last_insert_rowid() AS id").get().id,
        title,
        totalAmount: 0,
        category,
        date: dayjs().toISOString(),
    }
}

export function deleteInvoice(debitId: number): void {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        db.prepare('DELETE FROM debits WHERE id = ?').run(debitId);
        db.prepare('COMMIT').run();
    } catch (error) {
        db.prepare('ROLLBACK').run();
    }
}
