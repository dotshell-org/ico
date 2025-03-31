import {db} from "../config.ts";

/**
 * Ignores the stock entry associated with a specific invoice product by deleting the linked addition and updating the product's addition reference.
 *
 * @param {number} product_id - The unique identifier of the invoice product whose stock entry should be ignored.
 * @return {void} This function does not return a value.
 */
export function ignoreInvoiceProductInStock(product_id: number): void {
    const deleteStmt = db.prepare(`
        DELETE
        FROM additions
        WHERE id = (SELECT addition_id
                    FROM invoice_products
                    WHERE id = ?);
    `);

    const updateStmt = db.prepare(`
        UPDATE invoice_products
        SET addition_id = -1
        WHERE id = ?;
    `);

    deleteStmt.run(product_id);
    updateStmt.run(product_id);
}

/**
 * Links an invoice product to a stock addition. If the addition_id is less than or equal to 0,
 * it creates a new stock addition entry and links it to the specified product.
 * Otherwise, it updates the existing stock addition with the provided details.
 *
 * @param {number} product_id - The unique identifier of the product in the invoice.
 * @param {number} addition_id - The identifier for the stock addition to link or update. If 0 or negative, a new addition entry will be created.
 * @param {string} name - The name or description of the stock addition.
 * @param {number} quantity - The quantity for the stock addition.
 * @param {string} stock_name - The name of the stock to associate with the addition.
 * @return {void} This function does not return a value.
 */
export function linkInvoiceProductInStock(product_id: number, addition_id: number, name: string, quantity: number, stock_name: string): void {
    // If addition_id <= 0, create a new record in additions
    if (addition_id <= 0) {
        // Insert stock_name directly into the additions table
        const additionStmt = db.prepare(`
            INSERT INTO additions (stock_name, date, object, quantity)
            VALUES (?, datetime('now'), ?, ?)
        `);
        const additionResult = additionStmt.run(stock_name, name, quantity);

        // Link the newly created addition to the relevant product
        const linkStmt = db.prepare(`
            UPDATE invoice_products
            SET addition_id = ?
            WHERE id = ?
        `);
        linkStmt.run(additionResult.lastInsertRowid, product_id);
    } else {
        // Otherwise, update the existing addition
        const updateStmt = db.prepare(`
            UPDATE additions
            SET object = ?,
                quantity = ?,
                stock_name = ?
            WHERE id = ?
        `);
        updateStmt.run(name, quantity, stock_name, addition_id);
    }
}
