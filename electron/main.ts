import {app, BrowserWindow, ipcMain} from 'electron';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import "../src/backend/db/accounting/tables.js"
import "../src/backend/db/stock/tables.js"
import "../src/backend/db/sales/tables.js"
import {
  addCreditGroup,
  addCreditRow,
  addCreditTable,
  addOtherCreditRow, deleteCreditGroup,
  deleteCreditRow,
  deleteCreditTable, getAllCategories,
  getCredits,
  getCreditsList,
  getCreditTableFromId,
  getOtherMoneyCreditsFromId,
  updateCreditCategory,
  updateCreditDate,
  updateCreditRow,
  updateCreditTitle,
  updateOtherCreditRow
} from "../src/backend/db/accounting/credits.js";
import {getCreditsSumByCategory, getDebitsSumByCategory, getTransactionsByMonth} from "../src/backend/db/accounting/reports.js";
import {  addInvoice,
  addInvoiceProduct,
  deleteInvoice,
  deleteInvoiceProduct,
  getInvoiceCountrySpecifications,
  getInvoiceExclTaxTotal,
  getInvoiceInclTaxTotal, getInvoiceNo,
  getInvoiceProducts,
  getInvoices,
  updateInvoiceCategory, updateInvoiceCountrySpecification,
  updateInvoiceIssueDate, updateInvoiceNo,
  updateInvoiceProductQuantity,
  updateInvoiceProductAmountExclTax,
  updateInvoiceSaleServiceDate,
  updateInvoiceTitle,
  updateInvoiceTotalAmount
} from "../src/backend/db/accounting/debits.js";
import {
  getAllObjectNames,
  getAllObjects,
  getAllStocks,
  getInventory,
  getMovements,
  getObjectAmountCurve, getStockLinkProps, getStockLinks
} from "../src/backend/db/stock/getters.js";
import {
  addMovement,
  deleteMovement,
  editMovement,
  ignoreInvoiceProductInStock,
  linkInvoiceProductInStock
} from "../src/backend/db/stock/setters.js";
import {getRevenueData, getSales, getSalesSummary, getAllSoldObjectNames} from "../src/backend/db/sales/getters.js";
import {
  addSale,
  editSale,
  deleteSale,
  migrateSalesToStockMovements
} from "../src/backend/db/sales/setters.js";
import { 
  getAccounts, 
  getCurrentAccount, 
  createAccount, 
  switchAccount, 
  deleteAccount,
  renameAccount
} from '../src/backend/account-manager.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  const iconPath = path.join(process.env.APP_ROOT || __dirname, 'public', 'app-icon-windows-linux.png');
  const win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });

  win.setMenu(null); // Supprime la barre de menu

  const isDev = process.env.VITE_DEV_SERVER_URL;
  if (isDev) {
    win.loadURL(isDev);
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function handleIpc(name: string, handler: (...args: any[]) => any) {
  ipcMain.handle(name, async (_event, ...args) => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error(`Error in ${name}`, error);
      throw error;
    }
  });
}

// Accounting

handleIpc("getCredits", getCredits);
handleIpc("getDebits", getInvoices);
handleIpc("getTransactionsByMonth", getTransactionsByMonth);
handleIpc("getCreditsSumByCategory", getCreditsSumByCategory);
handleIpc("getDebitsSumByCategory", getDebitsSumByCategory);
handleIpc("getAllCreditsSumByCategory", () => getCreditsSumByCategory(false));
handleIpc("getAllDebitsSumByCategory", () => getDebitsSumByCategory(false));
handleIpc("getCreditsList", getCreditsList);
handleIpc("getCreditTableFromId", getCreditTableFromId);
handleIpc("getOtherMoneyCreditsFromId", getOtherMoneyCreditsFromId);

handleIpc("addCreditRow", addCreditRow);
handleIpc("updateCreditRow", updateCreditRow);
handleIpc("updateOtherCreditRow", updateOtherCreditRow);
handleIpc("deleteCreditRow", deleteCreditRow);
handleIpc("addOtherCreditRow", addOtherCreditRow);

handleIpc("deleteCreditTable", deleteCreditTable);
handleIpc("updateCreditDate", updateCreditDate);
handleIpc("addCreditTable", addCreditTable);

handleIpc("updateCreditTitle", updateCreditTitle);
handleIpc("updateCreditCategory", updateCreditCategory);

handleIpc("getAllCategories", getAllCategories);

handleIpc("addCreditGroup", addCreditGroup);
handleIpc("deleteCreditGroup", deleteCreditGroup);

handleIpc("addInvoice", addInvoice);
handleIpc("deleteInvoice", deleteInvoice);

handleIpc("updateInvoiceIssueDate", updateInvoiceIssueDate);
handleIpc("updateInvoiceSaleServiceDate", updateInvoiceSaleServiceDate);
handleIpc("updateInvoiceCategory", updateInvoiceCategory);
handleIpc("updateInvoiceTitle", updateInvoiceTitle);
handleIpc("updateInvoiceTotalAmount", updateInvoiceTotalAmount);

handleIpc("getInvoiceProducts", getInvoiceProducts);
handleIpc("addInvoiceProduct", addInvoiceProduct);
handleIpc("deleteInvoiceProduct", deleteInvoiceProduct);
handleIpc("updateInvoiceProductQuantity", updateInvoiceProductQuantity);
handleIpc("updateInvoiceProductAmountExclTax", updateInvoiceProductAmountExclTax);
handleIpc("getInvoiceExclTaxTotal", getInvoiceExclTaxTotal);
handleIpc("getInvoiceInclTaxTotal", getInvoiceInclTaxTotal);

handleIpc("getInvoiceCountrySpecifications", getInvoiceCountrySpecifications);
handleIpc("updateInvoiceCountrySpecification", updateInvoiceCountrySpecification);
handleIpc("getInvoiceNo", getInvoiceNo);
handleIpc("updateInvoiceNo", updateInvoiceNo);

// Stock

handleIpc("getInventory", getInventory);
handleIpc("getAllObjects", getAllObjects);
handleIpc("getAllStocks", getAllStocks);
handleIpc("getAllObjectNames", getAllObjectNames);
handleIpc("getObjectAmountCurve", getObjectAmountCurve);

handleIpc("getMovements", getMovements);

handleIpc("getStockLinks", getStockLinks);

handleIpc("ignoreInvoiceProductInStock", ignoreInvoiceProductInStock);
handleIpc("linkInvoiceProductInStock", linkInvoiceProductInStock);
handleIpc("getStockLinkProps", getStockLinkProps);
handleIpc("editMovement", editMovement);
handleIpc("deleteMovement", deleteMovement);
handleIpc("addMovement", addMovement);

// Sales

handleIpc("getSales", getSales);
handleIpc("getSalesSummary", getSalesSummary);
handleIpc("getRevenueData", getRevenueData);
handleIpc("getAllSoldObjectNames", getAllSoldObjectNames);
handleIpc("addSale", addSale);
handleIpc("editSale", editSale);
handleIpc("deleteSale", deleteSale);
handleIpc("migrateSalesToStockMovements", migrateSalesToStockMovements);

// Account management

ipcMain.handle('getAccounts', () => getAccounts())
ipcMain.handle('getCurrentAccount', () => getCurrentAccount())
ipcMain.handle('createAccount', (_event, name: string) => createAccount(name))
ipcMain.handle('switchAccount', (_event, id: string) => {
  const account = switchAccount(id)
  // After switching accounts, we need to restart the app to load the new database
  app.relaunch()
  app.exit(0)
  return account
})
ipcMain.handle('deleteAccount', (_event, id: string) => {
  deleteAccount(id)
  return getAccounts()
})

ipcMain.handle('renameAccount', (_event, id: string, newName: string) => {
  return renameAccount(id, newName)
})

// Language management
ipcMain.handle('changeLanguage', (_event, lang: string) => {
  if (win) {
    // Send the new language to the renderer process
    win.webContents.send('language-changed', lang);
  }
  return lang;
})

// Get current system language
ipcMain.handle('getSystemLanguage', () => {
  return app.getLocale().substring(0, 2);
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
});

app.commandLine.appendSwitch('gtk-version', '3');

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
