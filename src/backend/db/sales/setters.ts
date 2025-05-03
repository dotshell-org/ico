import {db} from "../config.ts";

/**
 * Adds a new sale entry to the database.
 *
 * @param {string} name - The name of the object being sold.
 * @param {number} quantity - The quantity of the object sold.
 * @param {number} price - The price per unit of the object.
 * @param {string} date - The date of the sale in string format.
 * @param {string} stock - The stock from which the object was sold.
 * @return {void} Does not return a value.
 */
export function addSale(name: string, quantity: number, price: number, date: string, stock: string): void {
    const insertStmt = db.prepare(`
        INSERT INTO sales (date, object, quantity, price, stock)
        VALUES (?, ?, ?, ?, ?)
    `);
    insertStmt.run(date, name, quantity, price, stock);
}

/**
 * Edits an existing sale in the database.
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
    const updateStmt = db.prepare(`
        UPDATE sales
        SET object = ?,
            quantity = ?,
            price = ?,
            date = ?,
            stock = ?
        WHERE id = ?
    `);

    updateStmt.run(name, quantity, price, date, stock, id);
}

/**
 * Deletes a sale record from the database based on the specified ID.
 *
 * @param {number} id - The ID of the sale record to be deleted.
 * @return {void} This function does not return any value.
 */
export function deleteSale(id: number): void {
    const deleteStmt = db.prepare(`
        DELETE FROM sales
        WHERE id = ?
    `);
    deleteStmt.run(id);
}