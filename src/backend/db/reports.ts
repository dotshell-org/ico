import { db } from './config';
import dayjs from "dayjs";

/**
 * Retrieves the total credit and debit transaction amounts grouped by the last 12 months
 * starting from 11 months before the current month.
 *
 * @return {number[][]} A two-dimensional array where the first nested array represents
 * the monthly credit transaction totals and the second nested array represents the
 * monthly debit transaction totals, both ordered chronologically for the past 12 months.
 */
export function getTransactionsByMonth(): number[][] {
    const startDate = dayjs().subtract(11, 'month').startOf('month').format('YYYY-MM-DD');

    const creditStmt = db.prepare(`
        SELECT cg.date, SUM(cr.quantity * cr.amount) AS amount
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date >= ?
        GROUP BY cg.date
    `);
    const creditRecords = creditStmt.all(startDate);

    const debitStmt = db.prepare(`
        SELECT i.issue_date as date, SUM(ip.amount_excl_tax * ip.quantity * (1 + ip.tax_rate/100)) as amount
        FROM invoices i
            JOIN invoice_products ip ON i.id = ip.invoice_id
        WHERE i.issue_date >= ?
        GROUP BY i.issue_date
    `);
    const debitRecords = debitStmt.all(startDate);

    const months: string[] = [];
    const startMonth = dayjs().subtract(11, 'month').startOf('month');
    for (let i = 0; i < 12; i++) {
        months.push(startMonth.add(i, 'month').format('YYYY-MM'));
    }

    const creditSums: number[] = Array(12).fill(0);
    const debitSums: number[] = Array(12).fill(0);

    for (const credit of creditRecords) {
        const monthKey = dayjs(credit.date).format('YYYY-MM');
        const monthIndex = months.indexOf(monthKey);
        if (monthIndex !== -1) {
            creditSums[monthIndex] += credit.amount;
        }
    }

    for (const debit of debitRecords) {
        const monthKey = dayjs(debit.date).format('YYYY-MM');
        const monthIndex = months.indexOf(monthKey);
        if (monthIndex !== -1) {
            debitSums[monthIndex] += debit.amount;
        }
    }

    return [creditSums, debitSums];
}

/**
 * Retrieves the sum of credits grouped by category over the past 12 months.
 *
 * This function queries the database to calculate the total credits
 * for each category by multiplying the quantity with the amount in
 * the credits rows. The results are grouped by category and include
 * only data from the last 12 months.
 *
 * @return {Object} An object containing two arrays:
 *                  - `categories`: An array of category names.
 *                  - `values`: An array of summed-up credit values corresponding to the categories.
 */
export function getCreditsSumByCategory(): { categories: string[]; values: number[] } {
    const dateThreshold = dayjs().subtract(12, "month").toISOString();
    const query = `
        SELECT cg.category, SUM(cr.quantity * cr.amount) as total
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date > ?
        GROUP BY cg.category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(dateThreshold);

    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}

/**
 * Retrieves the sum of debit amounts grouped by category for the past 12 months.
 *
 * @return {Object} An object containing two arrays:
 *         - 'categories' which lists the unique debit categories
 *         - 'values' which lists the corresponding total debit amounts for each category.
 */
export function getDebitsSumByCategory(): { categories: string[]; values: number[] } {
    const dateThreshold = dayjs().subtract(12, "month").toISOString();
    const query = `
        SELECT i.category,
               SUM(ip.amount_excl_tax * ip.quantity * (1 + ip.tax_rate/100)) as total
        FROM invoices i
                 JOIN invoice_products ip ON i.id = ip.invoice_id
        WHERE i.issue_date >= ?
        GROUP BY i.category
    `;
    const stmt = db.prepare(query);
    const rows = stmt.all(dateThreshold);

    const categories = rows.map((row: { category: string; total: number }) => row.category);
    const values = rows.map((row: { category: string; total: number }) => row.total);

    return { categories, values };
}