import {db} from "../config.js";

/**
 * Adds a new sale entry to the database and creates a corresponding negative stock movement.
 *
 * @param {string} name - The name of the object being sold.
 * @param {number} quantity - The quantity of the object sold.
 * @param {number} price - The price per unit of the object.
 * @param {string} date - The date of the sale in string format.
 * @param {string} stock - The stock from which the object was sold.
 * @return {void} Does not return a value.
 */
export function addSale(name: string, quantity: number, price: number, date: string, stock: string): void {
    // Use a transaction to ensure both the sale and stock movement are created atomically
    db.transaction(() => {
        // Create the negative stock movement first
        const movementStmt = db.prepare(`
            INSERT INTO stock_movements (stock_name, date, object, quantity)
            VALUES (?, ?, ?, ?)
        `);
        // Negative quantity for stock reduction
        const movementResult = movementStmt.run(stock, date, name, -Math.abs(quantity));

        // Then create the sale with a reference to the movement
        const insertStmt = db.prepare(`
            INSERT INTO sales (date, object, quantity, price, stock, movement_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertStmt.run(date, name, quantity, price, stock, movementResult.lastInsertRowid);
    })();
}

/**
 * Edits an existing sale in the database and updates the corresponding stock movement.
 *
 * @param {number} id - The ID of the sale to edit.
 * @param {string} name - The new name of the object being sold.
 * @param {number} quantity - The new quantity of the object sold.
 * @param {number} price - The new price per unit of the object.
 * @param {string} date - The new date of the sale in string format.
 * @param {string} stock - The new stock from which the object was sold.
 * @return {void} Does not return a value.
 */
export function editSale(id: number, name: string, quantity: number, price: number, date: string, stock: string): void {
    // Use a transaction to ensure both sale and stock movement are updated atomically
    db.transaction(() => {
        // First, get the current sale to find the movement_id
        const getSaleStmt = db.prepare(`
            SELECT movement_id FROM sales WHERE id = ?
        `);
        const sale = getSaleStmt.get(id);

        if (sale && sale.movement_id) {
            // Update the associated stock movement
            const updateMovementStmt = db.prepare(`
                UPDATE stock_movements
                SET object = ?,
                    quantity = ?,
                    date = ?,
                    stock_name = ?
                WHERE id = ?
            `);
            // Negative quantity for stock reduction
            updateMovementStmt.run(name, -Math.abs(quantity), date, stock, sale.movement_id);
        } else {
            // No associated movement found, create a new one
            const movementStmt = db.prepare(`
                INSERT INTO stock_movements (stock_name, date, object, quantity)
                VALUES (?, ?, ?, ?)
            `);
            // Negative quantity for stock reduction
            const movementResult = movementStmt.run(stock, date, name, -Math.abs(quantity));

            // Store the new movement_id
            const updateMovementIdStmt = db.prepare(`
                UPDATE sales SET movement_id = ? WHERE id = ?
            `);
            updateMovementIdStmt.run(movementResult.lastInsertRowid, id);
        }

        // Update the sale
        const updateSaleStmt = db.prepare(`
            UPDATE sales
            SET object = ?,
                quantity = ?,
                price = ?,
                date = ?,
                stock = ?
            WHERE id = ?
        `);
        updateSaleStmt.run(name, quantity, price, date, stock, id);
    })();
}

/**
 * Deletes a sale record and its associated stock movement from the database.
 *
 * @param {number} id - The ID of the sale record to be deleted.
 * @return {void} This function does not return any value.
 */
export function deleteSale(id: number): void {
    // Use a transaction to ensure both sale and stock movement are deleted atomically
    db.transaction(() => {
        // First, get the movement_id from the sale
        const getSaleStmt = db.prepare(`
            SELECT movement_id FROM sales WHERE id = ?
        `);
        const sale = getSaleStmt.get(id);

        // Delete the sale
        const deleteSaleStmt = db.prepare(`
            DELETE FROM sales
            WHERE id = ?
        `);
        deleteSaleStmt.run(id);

        // If there's an associated movement, delete it too
        if (sale && sale.movement_id) {
            const deleteMovementStmt = db.prepare(`
                DELETE FROM stock_movements
                WHERE id = ?
            `);
            deleteMovementStmt.run(sale.movement_id);
        }
    })();
}

/**
 * Migrates existing sales by creating corresponding negative stock movements for any sale
 * that doesn't already have a movement_id associated with it.
 * 
 * @return {number} The number of sales that were migrated.
 */
export function migrateSalesToStockMovements(): number {
    let migratedCount = 0;

    // Use a transaction for the entire migration
    db.transaction(() => {
        // Find all sales without an associated movement_id or with a null/0 movement_id
        const findSalesStmt = db.prepare(`
            SELECT id, date, object, quantity, stock
            FROM sales
            WHERE movement_id IS NULL OR movement_id = 0
        `);

        const sales = findSalesStmt.all();

        for (const sale of sales) {
            // Create a negative stock movement
            const movementStmt = db.prepare(`
                INSERT INTO stock_movements (stock_name, date, object, quantity)
                VALUES (?, ?, ?, ?)
            `);
            // Negative quantity for stock reduction
            const movementResult = movementStmt.run(sale.stock, sale.date, sale.object, -Math.abs(sale.quantity));

            // Update the sale with the new movement_id
            const updateSaleStmt = db.prepare(`
                UPDATE sales
                SET movement_id = ?
                WHERE id = ?
            `);
            updateSaleStmt.run(movementResult.lastInsertRowid, sale.id);

            migratedCount++;
        }
    })();

    return migratedCount;
}
