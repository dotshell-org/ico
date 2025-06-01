import {db} from "../config.js";

/**
 * Ignores the stock entry associated with a specific invoice product by deleting the linked movement and updating the product's addition reference.
 *
 * @param {number} product_id - The unique identifier of the invoice product whose stock entry should be ignored.
 * @return {void} This function does not return a value.
 */
export function ignoreInvoiceProductInStock(product_id: number): void {
    const deleteStmt = db.prepare(`
        DELETE
        FROM stock_movements
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
 * Links an invoice product to a stock movement. If the addition_id is less than or equal to 0,
 * it creates a new stock movement entry and links it to the specified product.
 * Otherwise, it updates the existing stock movement with the provided details.
 *
 * @param {number} product_id - The unique identifier of the product in the invoice.
 * @param {number} addition_id - The identifier for the stock movement to link or update. If 0 or negative, a new movement entry will be created.
 * @param {string} name - The name or description of the stock movement.
 * @param {number} quantity - The quantity for the stock movement.
 * @param date
 * @param {string} stock_name - The name of the stock to associate with the movement.
 * @return {void} This function does not return a value.
 */
export function linkInvoiceProductInStock(product_id: number, addition_id: number, stock_name: string, date: string, name: string, quantity: number): void {
    // If addition_id <= 0, create a new record in stock_movements
    if (addition_id <= 0) {
        // Insert stock_name directly into the stock_movements table
        const movementStmt = db.prepare(`
            INSERT INTO stock_movements (stock_name, date, object, quantity)
            VALUES (?, ?, ?, ?)
        `);
        const movementResult = movementStmt.run(stock_name, date, name, quantity);

        // Link the newly created movement to the relevant product
        const linkStmt = db.prepare(`
            UPDATE invoice_products
            SET addition_id = ?
            WHERE id = ?
        `);
        linkStmt.run(movementResult.lastInsertRowid, product_id);
    } else {
        // Otherwise, update the existing movement
        const updateStmt = db.prepare(`
            UPDATE stock_movements
            SET object = ?,
                quantity = ?,
                date = ?,
                stock_name = ?
            WHERE id = ?
        `);
        updateStmt.run(name, quantity, date, stock_name, addition_id);
    }
}

export function editMovement(id: number, name: string, quantity: number, date: string, stock_name: string): void {
    // Simply update the movement in the single table
    const updateStmt = db.prepare(`
        UPDATE stock_movements
        SET object = ?,
            quantity = ?,
            date = ?,
            stock_name = ?
        WHERE id = ?
    `);

    updateStmt.run(name, quantity, date, stock_name, id);
}

/**
 * Deletes a movement record from the database based on the specified ID.
 * If the movement is linked to an invoice_product, the function
 * also unlinks the invoice_product by setting its addition_id to 0.
 *
 * @param {number} id - The ID of the movement record to be deleted.
 * @param {boolean} positive - Not used in this version but kept for backward compatibility.
 * @return {void} This function does not return any value.
 */
export function deleteMovement(id: number): void {
    // Use a transaction to ensure all operations occur atomically
    db.transaction(() => {
        // Check if this movement is linked to any invoice_products
        const checkLinkStmt = db.prepare(`
            SELECT id FROM invoice_products
            WHERE addition_id = ?
        `);

        const linkedProducts = checkLinkStmt.all(id);

        // If linked products exist, update them to set addition_id to 0
        if (linkedProducts.length > 0) {
            const unlinkStmt = db.prepare(`
                UPDATE invoice_products
                SET addition_id = 0
                WHERE addition_id = ?
            `);
            unlinkStmt.run(id);
        }

        // Delete the movement
        const deleteStmt = db.prepare(`
            DELETE FROM stock_movements
            WHERE id = ?
        `);
        deleteStmt.run(id);
    })();
}

/**
 * Adds a new movement entry in the database.
 *
 * @param {string} name - The name of the object associated with the movement.
 * @param {number} quantity - The quantity of the object involved in the movement.
 * @param {string} date - The date of the movement in string format.
 * @param {string} stock_name - The name of the stock involved in the movement.
 * @return {void} Does not return a value.
 */
export function addMovement(name: string, quantity: number, date: string, stock_name: string): void {
    const insertStmt = db.prepare(`
        INSERT INTO stock_movements (stock_name, date, object, quantity)
        VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(stock_name, date, name, quantity);
}
