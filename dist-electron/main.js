import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "module";
var FilterType = /* @__PURE__ */ ((FilterType2) => {
  FilterType2["Is"] = ": ";
  FilterType2["IsExactly"] = " = ";
  FilterType2["LessThan"] = " < ";
  FilterType2["MoreThan"] = " > ";
  return FilterType2;
})(FilterType || {});
var SortType = /* @__PURE__ */ ((SortType2) => {
  SortType2["Asc"] = "↓";
  SortType2["Desc"] = "↑";
  return SortType2;
})(SortType || {});
var SummaryProperty = /* @__PURE__ */ ((SummaryProperty2) => {
  SummaryProperty2["Date"] = "date";
  SummaryProperty2["Title"] = "title";
  SummaryProperty2["Amount"] = "amount";
  SummaryProperty2["Category"] = "category";
  return SummaryProperty2;
})(SummaryProperty || {});
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = {};
const CREATE_CREDITS_TABLE = `
    CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );
`;
const CREATE_DEBITS_TABLE = `
    CREATE TABLE IF NOT EXISTS debits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    )
`;
const db = new Database(DATABASE_PATH, DB_OPTIONS);
db.exec(CREATE_CREDITS_TABLE);
db.exec(CREATE_DEBITS_TABLE);
function addCredit(date, title, amount, category) {
  const INSERT_CREDIT_QUERY = `
        INSERT INTO credits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `;
  const stmt = db.prepare(INSERT_CREDIT_QUERY);
  return stmt.run(date, title, amount, category);
}
function getCredits(filters, sort) {
  let query = "SELECT * FROM credits";
  const queryParams = [];
  function typeToOperator(type) {
    if (type === FilterType.Is) {
      return "LIKE";
    } else if (type === FilterType.IsExactly) {
      return "=";
    } else if (type === FilterType.MoreThan) {
      return ">";
    } else if (type === FilterType.LessThan) {
      return "<";
    } else if (type === SortType.Asc) {
      return "ASC";
    } else if (type === SortType.Desc) {
      return "DESC";
    } else {
      throw new Error(`Unsupported operator type: ${type}`);
    }
  }
  if (filters.length > 0) {
    const conditions = filters.map((filter) => {
      if (filter.type === FilterType.Is && filter.property !== SummaryProperty.Amount) {
        queryParams.push(`%${filter.value}%`);
      } else {
        queryParams.push(filter.value);
      }
      return `${filter.property} ${typeToOperator(filter.type)} ?`;
    });
    query += " WHERE " + conditions.join(" AND ");
  }
  if (sort.length > 0) {
    const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.type)}`);
    query += " ORDER BY " + sortConditions.join(", ");
  }
  const stmt = db.prepare(query);
  return stmt.all(...queryParams);
}
function addDebit(date, title, amount, category) {
  const INSERT_CREDIT_QUERY = `
        INSERT INTO debits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `;
  const stmt = db.prepare(INSERT_CREDIT_QUERY);
  return stmt.run(date, title, amount, category);
}
function getDebits(filters, sort) {
  let query = "SELECT * FROM debits";
  const queryParams = [];
  function typeToOperator(type) {
    if (type === FilterType.Is) {
      return "LIKE";
    } else if (type === FilterType.IsExactly) {
      return "=";
    } else if (type === FilterType.MoreThan) {
      return ">";
    } else if (type === FilterType.LessThan) {
      return "<";
    } else if (type === SortType.Asc) {
      return "ASC";
    } else if (type === SortType.Desc) {
      return "DESC";
    } else {
      throw new Error(`Unsupported operator type: ${type}`);
    }
  }
  if (filters.length > 0) {
    const conditions = filters.map((filter) => {
      if (filter.type === FilterType.Is && filter.property !== SummaryProperty.Amount) {
        queryParams.push(`%${filter.value}%`);
      } else {
        queryParams.push(filter.value);
      }
      return `${filter.property} ${typeToOperator(filter.type)} ?`;
    });
    query += " WHERE " + conditions.join(" AND ");
  }
  if (sort.length > 0) {
    const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.type)}`);
    query += " ORDER BY " + sortConditions.join(", ");
  }
  const stmt = db.prepare(query);
  return stmt.all(...queryParams);
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
    // Path to your icon
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
ipcMain.handle("getCredits", async (_event, filters, sorts) => {
  try {
    return getCredits(filters, sorts);
  } catch (error) {
    console.error("Error when fetching credits", error);
    throw error;
  }
});
ipcMain.handle("addCredit", async (_event, credit) => {
  try {
    const { date, title, amount, category } = credit;
    return addCredit(date, title, amount, category);
  } catch (error) {
    console.error("Error when adding credit", error);
    throw error;
  }
});
ipcMain.handle("getDebits", async (_event, filters, sorts) => {
  try {
    return getDebits(filters, sorts);
  } catch (error) {
    console.error("Error when fetching debits", error);
    throw error;
  }
});
ipcMain.handle("addDebit", async (_event, debit) => {
  try {
    const { date, title, amount, category } = debit;
    return addDebit(date, title, amount, category);
  } catch (error) {
    console.error("Error when adding debit", error);
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
