#!/usr/bin/env node

import { db } from './src/backend/db/config.js';

// Test script to validate the debit invoice fix

console.log('🧪 Testing debit invoice fix...\n');

// Test 1: Check if total_amount column exists in invoices table
console.log('1. Checking if total_amount column exists in invoices table...');
try {
    const columns = db.prepare("PRAGMA table_info(invoices)").all();
    const totalAmountColumn = columns.find(col => col.name === 'total_amount');
    
    if (totalAmountColumn) {
        console.log('✅ total_amount column exists');
        console.log(`   Type: ${totalAmountColumn.type}, Default: ${totalAmountColumn.dflt_value}`);
    } else {
        console.log('❌ total_amount column does not exist');
        process.exit(1);
    }
} catch (error) {
    console.log(`❌ Error checking table schema: ${error.message}`);
    process.exit(1);
}

// Test 2: Test creating a debit invoice and setting its total amount
console.log('\n2. Testing debit invoice creation and total amount update...');
try {
    // Import the required functions
    const { addInvoice } = await import('./src/backend/db/accounting/debits.js');
    const { updateInvoiceTotalAmount } = await import('./src/backend/db/accounting/debits.js');
    const { getInvoices } = await import('./src/backend/db/accounting/debits.js');
    const { Country } = await import('./src/types/Country.js');
    
    // Create a test debit invoice
    const testInvoice = addInvoice("Test Debit Invoice", "Test Category", Country.Debit);
    console.log(`✅ Created test debit invoice with ID: ${testInvoice.id}`);
    
    // Update its total amount
    const testAmount = 123.45;
    updateInvoiceTotalAmount(testInvoice.id, testAmount);
    console.log(`✅ Updated total amount to €${testAmount}`);
    
    // Retrieve it and check if the amount persists
    const invoices = getInvoices([], []);
    const retrievedInvoice = invoices.find(inv => inv.id === testInvoice.id);
    
    if (retrievedInvoice && Math.abs(retrievedInvoice.totalAmount - testAmount) < 0.01) {
        console.log(`✅ Total amount persisted correctly: €${retrievedInvoice.totalAmount}`);
    } else {
        console.log(`❌ Total amount not persisted correctly. Expected: €${testAmount}, Got: €${retrievedInvoice?.totalAmount || 'undefined'}`);
        process.exit(1);
    }
    
    // Clean up - delete the test invoice
    const { deleteInvoice } = await import('./src/backend/db/accounting/debits.js');
    deleteInvoice(testInvoice.id);
    console.log('✅ Test invoice cleaned up');
    
} catch (error) {
    console.log(`❌ Error testing debit invoice: ${error.message}`);
    console.log(error.stack);
    process.exit(1);
}

console.log('\n🎉 All tests passed! Debit invoice fix is working correctly.');
