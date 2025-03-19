import { db, typeToOperator } from './config';
import { Filter } from "../../types/filter/Filter";
import { Sort } from "../../types/sort/Sort";
import { Invoice } from "../../types/invoices/Invoice";  // Vous devrez créer ce type
import dayjs from "dayjs";
import { Operator } from "../../types/filter/Operator";
import { SummaryProperty } from "../../types/summary/SummaryProperty";
import {Country} from "../../types/Country.ts";
import {InvoiceProduct} from "../../types/invoices/InvoiceProduct.ts";

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
               COALESCE(SUM(ip.amount_excl_tax * ip.quantity * (1 + ip.tax_rate)), 0) as total_amount
        FROM invoices i
                 LEFT JOIN invoice_products ip ON i.id = ip.invoice_id
    `;
    const queryParams: any[] = [];
    const whereConditions: string[] = [];
    const havingConditions: string[] = [];

    if (filters.length > 0) {
        filters.forEach((filter) => {
            if (filter.property === SummaryProperty.Amount) {
                // Amount filters go to HAVING clause
                havingConditions.push(
                    `total_amount ${typeToOperator(filter.operator)} ?`
                );
                queryParams.push(filter.value);
            } else {
                // Other filters go to WHERE clause
                const targetProperty = filter.property === SummaryProperty.Date
                    ? 'i.issue_date'
                    : `i.${filter.property}`;

                if (filter.operator === Operator.Is) {
                    queryParams.push(`%${filter.value}%`);
                } else {
                    queryParams.push(filter.value);
                }
                whereConditions.push(
                    `${targetProperty} ${typeToOperator(filter.operator)} ?`
                );
            }
        });
    }

    if (whereConditions.length > 0) {
        query += " WHERE " + whereConditions.join(" AND ");
    }

    query += " GROUP BY i.id";

    if (havingConditions.length > 0) {
        query += " HAVING " + havingConditions.join(" AND ");
    }

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
        totalAmount: getInvoiceInclTaxTotal(row.id)
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

        const currentDate = dayjs().format('YYYY-MM-DD');
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

/**
 * Retrieves the list of products associated with a specific invoice.
 *
 * @param {number} invoiceId - The unique identifier of the invoice.
 * @return {InvoiceProduct[]} Array of products linked to the specified invoice, including their details such as id, name, amount excluding tax, quantity, and tax rate.
 */
export function getInvoiceProducts(invoiceId: number): InvoiceProduct[] {
    const stmt = db.prepare(`
        SELECT id,
               name,
               amount_excl_tax,
               quantity,
               tax_rate
        FROM invoice_products
        WHERE invoice_id = ?
    `);
    return stmt.all(invoiceId);
}

/**
 * Adds a product to an invoice in the database.
 *
 * @param {number} invoiceId - The ID of the invoice to which the product will be added.
 * @param {string} name - The name of the product.
 * @param {number} amountExclTax - The price of the product excluding tax.
 * @param {number} quantity - The quantity of the product being added.
 * @param {number} taxRate - The tax rate applicable to the product.
 * @return {void} This function does not return a value.
 */
export function addInvoiceProduct(invoiceId: number, name: string, amountExclTax: number, quantity: number, taxRate: number): void {
    const stmt = db.prepare(`
        INSERT INTO invoice_products (invoice_id, name, amount_excl_tax, quantity, tax_rate)
        VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(invoiceId, name, amountExclTax, quantity, taxRate);
}

/**
 * Updates the quantity of a specific product in the invoice.
 *
 * @param {number} invoiceProductId - The unique identifier of the product in the invoice to be updated.
 * @param {number} quantity - The new quantity to be set for the product.
 * @return {void} Does not return a value.
 */
export function updateInvoiceProductQuantity(invoiceProductId: number, quantity: number): void {
    const stmt = db.prepare(`
        UPDATE invoice_products
        SET quantity = ?
        WHERE id = ?
    `);
    stmt.run(quantity, invoiceProductId);
}

/**
 * Deletes an invoice product from the database identified by the given ID.
 *
 * @param {number} invoiceProductId - The ID of the invoice product to be deleted.
 * @return {void} This function does not return a value.
 */
export function deleteInvoiceProduct(invoiceProductId: number): void {
    const stmt = db.prepare(`
        DELETE FROM invoice_products
        WHERE id = ?
    `);
    stmt.run(invoiceProductId);
}

/**
 * Calculates the total amount excluding tax for a specified invoice.
 *
 * @param {number} invoiceId - The unique identifier of the invoice.
 * @return {number} The total amount excluding tax for the specified invoice.
 */
export function getInvoiceExclTaxTotal(invoiceId: number): number {
    const stmt = db.prepare(`
        SELECT SUM(amount_excl_tax * quantity) as total
        FROM invoice_products
        WHERE invoice_id = ?
    `);
    return stmt.get(invoiceId).total || 0;
}

/**
 * Calculates the total amount of an invoice including tax.
 *
 * @param {number} invoiceId - The unique identifier of the invoice.
 * @return {number} The total amount of the invoice including tax. Returns 0 if no products are found for the invoice.
 */
export function getInvoiceInclTaxTotal(invoiceId: number): number {
    const stmt = db.prepare(`
        SELECT SUM(amount_excl_tax * quantity * (1 + tax_rate/100)) as total
        FROM invoice_products
        WHERE invoice_id = ?
    `);
    return stmt.get(invoiceId).total || 0;
}
