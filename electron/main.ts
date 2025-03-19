import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import "../src/backend/db/database.ts"
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
} from "../src/backend/db/credits.ts";
import {getCreditsSumByCategory, getDebitsSumByCategory, getTransactionsByMonth} from "../src/backend/db/reports.ts";
import {
  addInvoice, addInvoiceProduct,
  deleteInvoice, deleteInvoiceProduct, getInvoiceExclTaxTotal, getInvoiceInclTaxTotal, getInvoiceProducts,
  getInvoices, updateInvoiceCategory,
  updateInvoiceIssueDate, updateInvoiceProductQuantity,
  updateInvoiceSaleServiceDate, updateInvoiceTitle
} from "../src/backend/db/debits.ts";

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
    // Ajout des options de taille minimale
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
    },
  })

  // Masquer la barre de menu
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

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
});

app.whenReady().then(createWindow)