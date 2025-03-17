import { db, typeToOperator } from './config';
import { Filter } from "../../types/filter/Filter";
import { Sort } from "../../types/sort/Sort";
import { Invoice } from "../../types/invoices/Invoice";  // Vous devrez créer ce type
import dayjs from "dayjs";
import { Operator } from "../../types/filter/Operator";
import { SummaryProperty } from "../../types/summary/SummaryProperty";

export function getInvoices(filters: Filter[], sort: Sort[]): Invoice[] {
    let query = `
        SELECT i.id,
               i.title,
               i.category,
               i.issue_date,
               i.sale_service_date,
               i.country_code,
               SUM(ip.amount_excl_tax * ip.quantity * (1 + ip.tax_rate)) as total_amount
        FROM invoices i
                 LEFT JOIN invoice_products ip ON i.id = ip.invoice_id
    `;
    const queryParams: any[] = [];

    if (filters.length > 0) {
        const conditions = filters.map((filter) => {
            const targetProperty = filter.property === SummaryProperty.Date
                ? 'i.issue_date'
                : filter.property === SummaryProperty.Amount
                    ? 'total_amount'
                    : `i.${filter.property}`;
            if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
                queryParams.push(`%${filter.value}%`);
                return `${targetProperty} ${typeToOperator(filter.operator)} ?`;
            } else {
                queryParams.push(filter.value);
                return `${targetProperty} ${typeToOperator(filter.operator)} ?`;
            }
        });
        query += " WHERE " + conditions.join(" AND ");
    }

    query += " GROUP BY i.id";

    if (sort.length > 0) {
        const sortConditions = sort.map((s) => {
            const property = s.property === SummaryProperty.Amount
                ? 'total_amount'
                : s.property === SummaryProperty.Date
                    ? 'i.issue_date'
                    : `i.${s.property}`;
            return `${property} ${typeToOperator(s.orientation)}`;
        });
        query += " ORDER BY " + sortConditions.join(", ");
    }

    const stmt = db.prepare(query);
    return stmt.all(...queryParams).map((row: {
        id: any;
        title: any;
        category: any;
        issue_date: any;
        sale_service_date: any;
        country_code: any;
        total_amount: any;
    }) => ({
        id: row.id,
        title: row.title,
        category: row.category,
        issueDate: row.issue_date,
        saleServiceDate: row.sale_service_date,
        countryCode: row.country_code,
        totalAmount: row.total_amount || 0
    }));
}

export function addInvoice(title: string, category: string): Invoice {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        const stmt = db.prepare(`
            INSERT INTO invoices (title, category, issue_date, sale_service_date, country_code)
            VALUES (?, ?, ?, ?, ?)
        `);

        const currentDate = dayjs().toISOString();
        stmt.run(title, category, currentDate, currentDate, 'FR'); // FR par défaut

        const invoiceId = db.prepare("SELECT last_insert_rowid() AS id").get().id;

        db.prepare('COMMIT').run();

        return {
            id: invoiceId,
            title,
            category,
            issueDate: currentDate,
            saleServiceDate: currentDate,
            countryCode: 'FR',
            totalAmount: 0
        };
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
}

export function deleteInvoice(invoiceId: number): void {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        // Supprimer d'abord les produits associés
        db.prepare('DELETE FROM invoice_products WHERE invoice_id = ?').run(invoiceId);
        // Supprimer les spécifications pays
        db.prepare('DELETE FROM invoice_country_specifications WHERE invoice_id = ?').run(invoiceId);
        // Supprimer la facture
        db.prepare('DELETE FROM invoices WHERE id = ?').run(invoiceId);

        db.prepare('COMMIT').run();
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
}