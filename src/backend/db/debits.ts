import { db, typeToOperator } from './config';
import { Filter } from "../../types/filter/Filter";
import { Sort } from "../../types/sort/Sort";
import { Invoice } from "../../types/invoices/Invoice";  // Vous devrez créer ce type
import dayjs from "dayjs";
import { Operator } from "../../types/filter/Operator";
import { SummaryProperty } from "../../types/summary/SummaryProperty";
import {Country} from "../../types/Country.ts";

/**
 * Retrieves a list of invoices based on the provided filters and sorting options.
 *
 * @param {Filter[]} filters - An array of filter objects used to filter the invoices.
 * Each filter should specify a property, an operator, and a value to match.
 * @param {Sort[]} sort - An array of sort objects used to determine the order of the results.
 * Each sort should specify a property and an orientation (ascending or descending).
 * @return {Invoice[]} An array of invoice objects, each containing details such as
 * ID, title, category, issue date, sale service date, country code, and total amount.
 */
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

/**
 * Adds a new invoice to the database with the specified title and category.
 *
 * @param {string} title - The title of the invoice.
 * @param {string} category - The category of the invoice.
 * @param {Country} country - The country of the invoice.
 * @return {Invoice} The newly created invoice object, which includes the invoice ID, title, category, issue date, sale/service date, country code, and total amount.
 */
export function addInvoice(title: string, category: string, country: Country): Invoice {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        const stmt = db.prepare(`
            INSERT INTO invoices (title, category, issue_date, sale_service_date, country_code)
            VALUES (?, ?, ?, ?, ?)
        `);

        const currentDate = dayjs().toISOString();
        stmt.run(title, category, currentDate, currentDate, country);

        const invoiceId = db.prepare("SELECT last_insert_rowid() AS id").get().id;

        db.prepare('COMMIT').run();

        return {
            id: invoiceId,
            title,
            category,
            issueDate: currentDate,
            saleServiceDate: currentDate,
            countryCode: country,
            totalAmount: 0
        };
    } catch (error) {
        db.prepare('ROLLBACK').run();
        throw error;
    }
}

/**
 * Deletes an invoice and all its associated data from the database.
 * Removes associated products and country-specific specifications before deleting the invoice.
 *
 * @param {number} invoiceId - The ID of the invoice to be deleted.
 * @return {void} This function does not return a value.
 */
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

/**
 * Updates the issue date of an invoice with the specified invoice ID.
 *
 * @param {number} invoiceId - The unique identifier of the invoice to be updated.
 * @param {string} date - The new issue date to be set for the invoice in ISO format (YYYY-MM-DD).
 * @return {object} The result of the database operation, including the number of rows affected.
 */
export function updateInvoiceIssueDate(invoiceId: number, date: string): void {
    const stmt = db.prepare(`
        UPDATE invoices
        SET issue_date = ?
        WHERE id = ?
    `);
    stmt.run(date, invoiceId);
}

/**
 * Updates the sale service date for a specific invoice.
 *
 * @param {number} invoiceId - The unique identifier of the invoice to be updated.
 * @param {string} date - The new sale service date to be set in the invoice.
 * @return {void} No return value.
 */
export function updateInvoiceSaleServiceDate(invoiceId: number, date: string): void {
    const stmt = db.prepare(`
        UPDATE invoices
        SET sale_service_date = ?
        WHERE id = ?
    `);
    stmt.run(date, invoiceId);
}

/**
 * Updates the category of a specified invoice in the database.
 *
 * @param {number} invoiceId - The unique identifier of the invoice to be updated.
 * @param {string} category - The new category to assign to the invoice.
 * @return {void}
 */
export function updateInvoiceCategory(invoiceId: number, category: string): void {
    const stmt = db.prepare(`
        UPDATE invoices
        SET category = ?
        WHERE id = ?
    `);
    stmt.run(category, invoiceId);
}

/**
 * Updates the title of an invoice identified by its ID.
 *
 * @param {number} invoiceId - The unique identifier of the invoice to be updated.
 * @param {string} newTitle - The new title to assign to the invoice.
 * @return {void} This function does not return a value.
 */
export function updateInvoiceTitle(invoiceId: number, newTitle: string): void {
    const stmt = db.prepare(`
        UPDATE invoices 
        SET title = ? 
        WHERE id = ?
    `);
    stmt.run(newTitle, invoiceId);
}