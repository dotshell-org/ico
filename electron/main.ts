import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  getCredits, getCreditsList,
  getCreditsSumByCategory, getCreditTableFromId,
  getDebits, getDebitsSumByCategory,
  getTransactionsByMonth
} from "../src/db/database.ts";
import { Filter } from "../src/types/filter/Filter.ts"
import { Sort } from "../src/types/sort/Sort.ts"

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