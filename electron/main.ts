import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  addCreditGroup,
  addCreditRow,
  addCreditTable,
  addOtherCreditRow, deleteCreditGroup,
  deleteCreditRow,
  deleteCreditTable, getAllCategories,
  getCredits,
  getCreditsList,
  getCreditsSumByCategory,
  getCreditTableFromId,
  getDebits,
  getDebitsSumByCategory,
  getOtherMoneyCreditsFromId,
  getTransactionsByMonth,
  updateCreditCategory,
  updateCreditDate,
  updateCreditRow,
  updateCreditTitle,
  updateOtherCreditRow
} from "../src/backend/database.ts";
import { Filter } from "../src/types/filter/Filter.ts"
import { Sort } from "../src/types/sort/Sort.ts"
import {MoneyType} from "../src/types/detailed-credits/MoneyType.ts";

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

ipcMain.handle("getCredits", async (_event, filters: Filter[], sorts: Sort[]) => {
  try {
    return getCredits(filters, sorts);
  } catch (error) {
    console.error("Error when fetching credits", error);
    throw error;
  }
});
ipcMain.handle("getDebits", async (_event, filters: Filter[], sorts: Sort[]) => {
  try {
    return getDebits(filters, sorts);
  } catch (error) {
    console.error("Error when fetching debits", error);
    throw error;
  }
});

ipcMain.handle("getTransactionsByMonth", async (_event) => {
  try {
    return getTransactionsByMonth();
  } catch (error) {
    console.error("Error when fetching transactions by month", error);
    throw error;
  }
});

ipcMain.handle("getCreditsSumByCategory", async (_event) => {
  try {
    return getCreditsSumByCategory();
  } catch (error) {
    console.error("Error when fetching credits sum by category", error);
  }
});
ipcMain.handle("getDebitsSumByCategory", async (_event) => {
  try {
    return getDebitsSumByCategory();
  } catch (error) {
    console.error("Error when fetching debits sum by category", error);
  }
});

ipcMain.handle("getCreditsList", async (_event, filters: Filter[], sorts: Sort[]) => {
  try {
    return getCreditsList(filters, sorts);
  } catch (error) {
    console.error("Error when fetching creditsList", error);
  }
})
ipcMain.handle("getCreditTableFromId", async (_event, id: number) => {
  try {
    return getCreditTableFromId(id);
  } catch (error) {
    console.error("Error when fetching creditTableFromId", error);
  }
})
ipcMain.handle("getOtherMoneyCreditsFromId", async (_event, id: number) => {
  try {
    return getOtherMoneyCreditsFromId(id);
  } catch (error) {
    console.error("Error when fetching creditTableFromId", error);
  }
})

ipcMain.handle("addCreditRow", async (_event, tableId: number, amount: number, quantity: number) => {
  try {
    return addCreditRow(tableId, amount, quantity);
  } catch (error) {
    console.error("Error when adding credit row", error);
    throw error;
  }
});

ipcMain.handle("updateCreditRow", async (_event, rowId: number, quantity: number) => {
  try {
    return updateCreditRow(rowId, quantity);
  } catch (error) {
    console.error("Error when updating credit row", error);
    throw error;
  }
});

ipcMain.handle("updateOtherCreditRow", async (_event, rowId: number, amount: number) => {
  try {
    return updateOtherCreditRow(rowId, amount);
  } catch (error) {
    console.error("Error when updating other credit row", error);
    throw error;
  }
});

ipcMain.handle("deleteCreditRow", async (_event, rowId: number) => {
  try {
    return deleteCreditRow(rowId);
  } catch (error) {
    console.error("Error when deleting credit row", error);
    throw error;
  }
});

ipcMain.handle("addOtherCreditRow", async (_event, groupId: number, amount: number) => {
  try {
    return addOtherCreditRow(groupId, amount);
  } catch (error) {
    console.error("Error when adding other credit row", error);
    throw error;
  }
});

ipcMain.handle("deleteCreditTable", async (_event, tableId: number) => {
  try {
    return deleteCreditTable(tableId);
  } catch (error) {
    console.error("Error when deleting credit table", error);
    throw error;
  }
});

ipcMain.handle("updateCreditDate", async (_event, creditId: number, newDate: string) => {
  try {
    return updateCreditDate(creditId, newDate);
  } catch (error) {
    console.error("Error when updating credit date :", error);
    throw error;
  }
});

ipcMain.handle("addCreditTable", async (_event, creditId: number, tableType: MoneyType) => {
  try {
    return addCreditTable(creditId, tableType);
  } catch (error) {
    console.error("Error when adding credit table", error);
    throw error;
  }
})

ipcMain.handle("updateCreditTitle", async (_event, creditId: number, newTitle: string) => {
  try {
    return updateCreditTitle(creditId, newTitle);
  } catch (error) {
    console.error("Error when updating the title:", error);
    throw error;
  }
});

ipcMain.handle("updateCreditCategory", async (_event, creditId: number, newCategory: string) => {
  try {
    return updateCreditCategory(creditId, newCategory);
  } catch (error) {
    console.error("Error when updating credit category", error);
    throw error;
  }
});

ipcMain.handle("getAllCategories", async (_event) => {
  try {
    return getAllCategories();
  } catch (error) {
    console.error("Error when fetching all categories", error);
  }
});

ipcMain.handle("addCreditGroup", async (_event, title: string, category: string) => {
  try {
    return addCreditGroup(title, category);
  } catch (error) {
    console.error("Error when adding credit group", error);
  }
})
ipcMain.handle("deleteCreditGroup", async (_event, groupId: number) => {
  try {
    return deleteCreditGroup(groupId);
  } catch (error) {
    console.error("Error when deleting credit group", error);
  }
})

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