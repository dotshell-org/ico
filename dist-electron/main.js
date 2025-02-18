import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "module";
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = { verbose: console.log };
const CREATE_CREDITS_TABLE = `
    CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );
`;
const INSERT_CREDIT_QUERY = `
    INSERT INTO credits (date, title, amount, category)
    VALUES (?, ?, ?, ?)
`;
const SELECT_CREDITS_QUERY = "SELECT * FROM credits";
const db = new Database(DATABASE_PATH, DB_OPTIONS);
db.exec(CREATE_CREDITS_TABLE);
function addCredit(date, title, amount, category) {
  const stmt = db.prepare(INSERT_CREDIT_QUERY);
  return stmt.run(date, title, amount, category);
}
function getCredits() {
  const stmt = db.prepare(SELECT_CREDITS_QUERY);
  return stmt.all();
}
const __dirname = path.dirname(fileURLToPath(import.meta.url));
process.env.APP_ROOT = path.join(__dirname, "..");
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
path.join(process.env.APP_ROOT, "dist-electron");
const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
let win;
function createWindow() {
  win = new BrowserWindow({
    icon: path.join(process.env.VITE_PUBLIC, "../public/glome-icon.png"),
    // Chemin vers votre icône
    webPreferences: {
      preload: path.join(__dirname, "preload.mjs")
    }
  });
  win.setMenuBarVisibility(false);
  win.webContents.on("did-finish-load", () => {
    win == null ? void 0 : win.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  });
  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).then(() => {
      if (!win) {
        throw new Error('"win" is not defined');
      }
    });
  } else {
    win.loadFile(path.join(RENDERER_DIST, "index.html")).then(() => {
      if (!win) {
        throw new Error('"win" is not defined');
      }
    });
  }
}
ipcMain.handle("getCredits", async () => {
  try {
    return getCredits();
  } catch (error) {
    console.error("Erreur lors de la récupération des crédits", error);
    throw error;
  }
});
ipcMain.handle("addCredit", async (_event, credit) => {
  try {
    const { date, title, amount, category } = credit;
    return addCredit(date, title, amount, category);
  } catch (error) {
    console.error("Erreur lors de l'ajout du crédit", error);
    throw error;
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
app.whenReady().then(createWindow);
export {
  RENDERER_DIST,
  VITE_DEV_SERVER_URL
};
