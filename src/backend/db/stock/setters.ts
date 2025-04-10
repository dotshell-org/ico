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
 * @param date
 * @param {string} stock_name - The name of the stock to associate with the addition.
 * @return {void} This function does not return a value.
 */
export function linkInvoiceProductInStock(product_id: number, addition_id: number, stock_name: string, date: string, name: string, quantity: number): void {
    // If addition_id <= 0, create a new record in additions
    if (addition_id <= 0) {
        // Insert stock_name directly into the additions table
        const additionStmt = db.prepare(`
            INSERT INTO additions (stock_name, date, object, quantity)
            VALUES (?, ?, ?, ?)
        `);
        const additionResult = additionStmt.run(stock_name, date, name, quantity);

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
                date = ?,
                stock_name = ?
            WHERE id = ?
        `);
        updateStmt.run(name, quantity, date, stock_name, addition_id);
    }
}

/**
 * Updates an existing movement record in the database with the provided details.
 * If the quantity sign changes (positive to negative or vice versa), it moves the record
 * from additions to deletions table or vice versa.
 *
 * @param id - The ID of the movement to update
 * @param {string} name - The name of the object being updated
 * @param {number} quantity - The updated quantity of the movement
 * @param {string} date - The updated date for the movement in YYYY-MM-DD format
 * @param {string} stock_name - The name of the stock associated with the movement
 * @return {void} This function does not return a value
 */
export function editMovement(id: number, name: string, quantity: number, date: string, stock_name: string): void {
    // First, check if we need to move the record between tables
    const findCurrentTableStmt = db.prepare(`
        SELECT 'additions' as table_name
        FROM additions
        WHERE id = ?
        UNION
        SELECT 'deletions' as table_name
        FROM deletions
        WHERE id = ?
    `);

    const currentTable = findCurrentTableStmt.get(id, id)?.table_name;

    // Determine target table based on quantity sign
    const targetTable = quantity < 0 ? 'deletions' : 'additions';
    const absQuantity = Math.abs(quantity);

    // If table changed, we need to move the record
    if (currentTable && currentTable !== targetTable) {
        // Begin transaction to ensure atomicity
        db.transaction(() => {
            // Insert into new table
            const insertStmt = db.prepare(`
                INSERT INTO ${targetTable} (stock_name, date, object, quantity)
                VALUES (?, ?, ?, ?)
            `);
            const insertResult = insertStmt.run(stock_name, date, name, absQuantity);

            // Delete from old table
            const deleteStmt = db.prepare(`
                DELETE FROM ${currentTable}
                WHERE id = ?
            `);
            deleteStmt.run(id);

            // If this movement is linked to an invoice_product, update the reference
            if (currentTable === 'additions') {
                const updateReferenceStmt = db.prepare(`
                    UPDATE invoice_products
                    SET addition_id = ?
                    WHERE addition_id = ?
                `);
                updateReferenceStmt.run(insertResult.lastInsertRowid, id);
            }
            // Note: If we need to handle deletion_id references in the future, add similar code here
        })();
    } else {
        // Just update the existing record if we're not changing tables
        const updateStmt = db.prepare(`
            UPDATE ${targetTable}
            SET object = ?,
                quantity = ?,
                date = ?,
                stock_name = ?
            WHERE id = ?
        `);

        updateStmt.run(name, absQuantity, date, stock_name, id);
    }
}

/**
 * Deletes a movement record from the database based on the specified ID.
 * If the movement is an addition linked to an invoice_product, the function
 * also unlinks the invoice_product by setting its addition_id to -1.
 *
 * @param {number} id - The ID of the movement record to be deleted.
 * @param {boolean} positive - Indicates whether the movement is positive (addition) or negative (deletion).
 * @return {void} This function does not return any value.
 */
export function deleteMovement(id: number, positive: boolean): void {
    // Use a transaction to ensure all operations occur atomically
    db.transaction(() => {
        if (positive) {
            // First, check if this addition is linked to any invoice_products
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

            // Now delete the addition
            const deleteStmt = db.prepare(`
                DELETE FROM additions
                WHERE id = ?
            `);
            deleteStmt.run(id);
        } else {
            // For deletions, we simply delete the record
            const deleteStmt = db.prepare(`
                DELETE FROM deletions
                WHERE id = ?
            `);
            deleteStmt.run(id);
        }
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
        INSERT INTO additions (stock_name, date, object, quantity)
        VALUES (?, ?, ?, ?)
    `);
    insertStmt.run(stock_name, date, name, quantity);
}
