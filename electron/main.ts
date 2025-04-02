import {app, BrowserWindow, ipcMain} from 'electron';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import "../src/backend/db/accounting/tables.ts"
import "../src/backend/db/stock/tables.ts"
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
} from "../src/backend/db/accounting/credits.ts";
import {getCreditsSumByCategory, getDebitsSumByCategory, getTransactionsByMonth} from "../src/backend/db/accounting/reports.ts";
import {
  addInvoice,
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
  updateInvoiceSaleServiceDate,
  updateInvoiceTitle
} from "../src/backend/db/accounting/debits.ts";
import {
  getAllObjects,
  getAllStocks,
  getInventory,
  getMovements,
  getObjectAmountCurve, getStockLinkProps, getStockLinks
} from "../src/backend/db/stock/getters.ts";
import {ignoreInvoiceProductInStock, linkInvoiceProductInStock} from "../src/backend/db/stock/setters.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
path.join(process.env.APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC!, '../public/glome-icon.png'),
    // Add minimum size options
    minWidth: 900,
    minHeight: 650,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Hide menu bar
  win.setMenuBarVisibility(false)

  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then(() => {
      if (!win) {
        throw new Error('"win" is not defined')
      }
    })
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).then(() => {
      if (!win) {
        throw new Error('"win" is not defined')
      }
    })
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

handleIpc("getInvoiceProducts", getInvoiceProducts);
handleIpc("addInvoiceProduct", addInvoiceProduct);
handleIpc("deleteInvoiceProduct", deleteInvoiceProduct);
handleIpc("updateInvoiceProductQuantity", updateInvoiceProductQuantity);
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
handleIpc("getObjectAmountCurve", getObjectAmountCurve);

handleIpc("getMovements", getMovements);

handleIpc("getStockLinks", getStockLinks);

handleIpc("ignoreInvoiceProductInStock", ignoreInvoiceProductInStock);
handleIpc("linkInvoiceProductInStock", linkInvoiceProductInStock);
handleIpc("getStockLinkProps", getStockLinkProps);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);