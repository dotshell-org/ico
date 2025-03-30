import {db} from "../config.ts";

/**
 * Ignores the stock of a product associated with an invoice by removing its addition entry and updating the addition ID.
 *
 * @param {number} product_id - The ID of the product within the invoice to be ignored in stock.
 * @return {*} The result of the execution of the database statement.
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
 * Links an invoice product to a stock entry. If the stock does not exist, it creates a new stock entry.
 * If `addition_id` is 0, it creates a new addition and links it to the invoice product. Otherwise,
 * it updates the existing addition.
 *
 * @param {number} product_id - The ID of the product in the invoice to be linked.
 * @param {number} addition_id - The ID of the existing addition. If 0, a new addition is created.
 * @param {string} name - The name or description of the addition or product.
 * @param {number} quantity - The quantity of the product to be added or updated in the addition.
 * @param {string} stock_name - The name of the stock to which the product should be associated.
 * @return {void}
 */
export function linkInvoiceProductInStock(product_id: number, addition_id: number, name: string, quantity: number, stock_name: string): void {
    if (addition_id === 0) {
        // First check if the stock exists, if not create it
        const stockCheckStmt = db.prepare('SELECT id FROM stocks WHERE name = ?');
        let stock = stockCheckStmt.get(stock_name);
        let stock_id;

        if (!stock) {
            // Create new stock if it doesn't exist
            const createStockStmt = db.prepare('INSERT INTO stocks (name) VALUES (?)');
            const result = createStockStmt.run(stock_name);
            stock_id = result.lastInsertRowid;
        } else {
            stock_id = stock.id;
        }

        // Create new addition
        const additionStmt = db.prepare(`
            INSERT INTO additions (stock_id, date, object, quantity)
            VALUES (?, datetime('now'), ?, ?)
        `);
        const additionResult = additionStmt.run(stock_id, name, quantity);

        // Link the addition to the invoice product
        const linkStmt = db.prepare(`
            UPDATE invoice_products
            SET addition_id = ?
            WHERE id = ?
        `);
        linkStmt.run(additionResult.lastInsertRowid, product_id);
    } else {
        // Update existing addition
        const updateStmt = db.prepare(`
            UPDATE additions
            SET object = ?,
                quantity = ?
            WHERE id = ?
        `);
        updateStmt.run(name, quantity, addition_id);
    }
}
