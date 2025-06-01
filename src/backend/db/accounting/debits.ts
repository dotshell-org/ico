import { db, typeToOperator } from '../config.js';
import { Filter } from "../../../types/accounting/filter/Filter.js";
import { Sort } from "../../../types/accounting/sort/Sort.js";
import { Invoice } from "../../../types/accounting/invoices/Invoice.js";
import dayjs from "dayjs";
import { Operator } from "../../../types/accounting/filter/Operator.js";
import { SummaryProperty } from "../../../types/accounting/summary/SummaryProperty.js";
import {Country} from "../../../types/Country.js";
import {InvoiceProduct} from "../../../types/accounting/invoices/InvoiceProduct.js";

/**
 * Retrieves a list of invoices based on the specified filters and sorting options.
 *
 * @param {Filter[]} filters - An array of filter objects to apply to the query. Each filter specifies a property, operator, and value for filtering the invoices.
 * @param {Sort[]} sort - An array of sorting objects to define the ordering of the query results. Each sorting object specifies a property and orientation (ascending or descending).
 * @return {Invoice[]} An array of invoice objects that match the applied filters and are sorted according to the specified criteria.
 */
export function getInvoices(filters: Filter[], sort: Sort[]): Invoice[] {
    let query = `        
        SELECT i.id,
            i.title,
            i.category,
            i.issue_date,
            i.sale_service_date,
            i.country_code,
            COALESCE(SUM((ip.amount_excl_tax * ip.quantity * (1 - ip.discount_percentage / 100) * (1 + ip.tax_rate / 100)) - ip.discount_amount), 0) as total_amount
        FROM invoices i
            LEFT JOIN invoice_products ip ON i.id = ip.invoice_id`;
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
        totalAmount: row.total_amount
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
 * Removes associated products, their linked stock movements, and country-specific specifications before deleting the invoice.
 *
 * @param {number} invoiceId - The ID of the invoice to be deleted.
 * @return {void} This function does not return a value.
 */
export function deleteInvoice(invoiceId: number): void {
    db.prepare('BEGIN TRANSACTION').run();
    try {
        // Find all stock movements linked to this invoice's products
        const productMovementsStmt = db.prepare(`
            SELECT addition_id 
            FROM invoice_products 
            WHERE invoice_id = ? AND addition_id > 0
        `);
        const linkedMovements = productMovementsStmt.all(invoiceId);

        // Delete associated products first
        db.prepare('DELETE FROM invoice_products WHERE invoice_id = ?').run(invoiceId);

        // Now delete any stock movements that were linked to the products
        if (linkedMovements.length > 0) {
            linkedMovements.forEach((movement: { addition_id: number }) => {
                db.prepare(`DELETE FROM stock_movements WHERE id = ?`).run(movement.addition_id);
            });
        }

        // Delete country specifications
        db.prepare('DELETE FROM invoice_country_specifications WHERE invoice_id = ?').run(invoiceId);

        // Delete the invoice
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
               tax_rate,
               discount_percentage,
               discount_amount
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
 * @param discountPercentage
 * @param discountAmount
 * @return {void} This function does not return a value.
 */
export function addInvoiceProduct(invoiceId: number, name: string, amountExclTax: number, quantity: number, taxRate: number, discountPercentage: number, discountAmount: number): void {
    const stmt = db.prepare(`
        INSERT INTO invoice_products (invoice_id, addition_id, name, amount_excl_tax, quantity, tax_rate, discount_percentage, discount_amount)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(invoiceId, 0, name, amountExclTax, quantity, taxRate, discountPercentage, discountAmount);
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
 * Updates the amount excluding tax of a specific product in the invoice.
 *
 * @param {number} invoiceProductId - The unique identifier of the product in the invoice to be updated.
 * @param {number} amountExclTax - The new amount excluding tax to be set for the product.
 * @return {void} Does not return a value.
 */
export function updateInvoiceProductAmountExclTax(invoiceProductId: number, amountExclTax: number): void {
    const stmt = db.prepare(`
        UPDATE invoice_products
        SET amount_excl_tax = ?
        WHERE id = ?
    `);
    stmt.run(amountExclTax, invoiceProductId);
}

/**
 * Deletes an invoice product from the database identified by the given ID.
 * Also deletes any associated stock movement.
 *
 * @param {number} invoiceProductId - The ID of the invoice product to be deleted.
 * @return {void} This function does not return a value.
 */
export function deleteInvoiceProduct(invoiceProductId: number): void {
    // Check if this product has a linked stock movement
    const checkStmt = db.prepare(`
        SELECT addition_id
        FROM invoice_products
        WHERE id = ? AND addition_id > 0
    `);
    const result = checkStmt.get(invoiceProductId);

    // If there's a linked stock movement, delete it
    if (result && result.addition_id) {
        const deleteMovementStmt = db.prepare(`
            DELETE FROM stock_movements
            WHERE id = ?
        `);
        deleteMovementStmt.run(result.addition_id);
    }

    // Delete the invoice product
    const deleteProductStmt = db.prepare(`
        DELETE FROM invoice_products
        WHERE id = ?
    `);
    deleteProductStmt.run(invoiceProductId);
}

/**
 * Calculates the total amount excluding tax for a specified invoice, including discounts.
 *
 * @param {number} invoiceId - The unique identifier of the invoice.
 * @return {number} The total amount excluding tax for the specified invoice.
 */
export function getInvoiceExclTaxTotal(invoiceId: number): number {
    const stmt = db.prepare(`
        SELECT SUM(amount_excl_tax * quantity * (1 - discount_percentage / 100) - discount_amount) as total
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
        SELECT SUM(amount_excl_tax * quantity * (1 - discount_percentage / 100) * (1 + tax_rate/100) - discount_amount) as total
        FROM invoice_products
        WHERE invoice_id = ?
    `);
    return stmt.get(invoiceId).total || 0;
}

/**
 * Retrieves the country-specific specifications for an invoice.
 *
 * @param {number} invoiceId - The ID of the invoice to retrieve specifications for.
 * @return {Record<string, string>} A dictionary containing keys and their corresponding values.
 */
export function getInvoiceCountrySpecifications(invoiceId: number): Record<string, string> {
    const stmt = db.prepare(`
        SELECT key, value
        FROM invoice_country_specifications
        WHERE invoice_id = ?
    `);

    const rows = stmt.all(invoiceId);
    const specifications: Record<string, string> = {};

    rows.forEach((row: { key: string; value: string; }) => {
        specifications[row.key] = row.value;
    });

    return specifications;
}

/**
 * Updates the country-specific information for an invoice
 *
 * @param {number} invoiceId - The ID of the invoice to update
 * @param {string} key - The specification key to update
 * @param {string} value - The new value for the specification
 * @returns {void}
 */
export function updateInvoiceCountrySpecification(invoiceId: number, key: string, value: string): void {
    const existingSpec = db.prepare(`
        SELECT id
        FROM invoice_country_specifications
        WHERE invoice_id = ? AND key = ?
    `).get(invoiceId, key);

    if (existingSpec) {
        // Update existing specification
        db.prepare(`
            UPDATE invoice_country_specifications
            SET value = ?
            WHERE invoice_id = ? AND key = ?
        `).run(value, invoiceId, key);
    } else {
        // Insert new specification
        db.prepare(`
            INSERT INTO invoice_country_specifications (invoice_id, key, value)
            VALUES (?, ?, ?)
        `).run(invoiceId, key, value);
    }
}

/**
 * Retrieves the invoice number associated with the given invoice ID.
 *
 * @param {number} invoiceId - The unique identifier of the invoice to retrieve the number for.
 * @return {string} The invoice number if found, otherwise an empty string.
 */
export function getInvoiceNo(invoiceId: number): string {
    const stmt = db.prepare(`
        SELECT no
        FROM invoices
        WHERE id = ?
    `);
    return stmt.get(invoiceId).no || '';
}

/**
 * Updates the invoice number for the specified invoice ID in the database.
 *
 * @param {number} invoiceId - The ID of the invoice to update.
 * @param {string} no - The new invoice number to set.
 * @return {void} No return value.
 */
export function updateInvoiceNo(invoiceId: number, no: string): void {
    const stmt = db.prepare(`
        UPDATE invoices
        SET no = ?
        WHERE id = ?
    `);
    stmt.run(no, invoiceId);
}
