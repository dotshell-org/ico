import { ipcMain as R, app as u, BrowserWindow as I } from "electron";
import { fileURLToPath as f } from "node:url";
import E from "node:path";
import { createRequire as w } from "module";
var c = /* @__PURE__ */ ((e) => (e.Is = ": ", e.IsExactly = " = ", e.LessThan = " < ", e.MoreThan = " > ", e))(c || {}), l = /* @__PURE__ */ ((e) => (e.Asc = "↓", e.Desc = "↑", e))(l || {}), h = /* @__PURE__ */ ((e) => (e.Date = "date", e.Title = "title", e.Amount = "amount", e.Category = "category", e))(h || {});
const C = w(import.meta.url), D = C("better-sqlite3"), g = "./local.db", S = {}, L = `
    CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );
`, N = `
    CREATE TABLE IF NOT EXISTS debits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    )
`, T = new D(g, S);
T.exec(L);
T.exec(N);
function b(e, s, t, n) {
  return T.prepare(`
        INSERT INTO credits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `).run(e, s, t, n);
}
function v(e, s) {
  let t = "SELECT * FROM credits";
  const n = [];
  function i(r) {
    if (r === c.Is)
      return "LIKE";
    if (r === c.IsExactly)
      return "=";
    if (r === c.MoreThan)
      return ">";
    if (r === c.LessThan)
      return "<";
    if (r === l.Asc)
      return "ASC";
    if (r === l.Desc)
      return "DESC";
    throw new Error(`Unsupported operator type: ${r}`);
  }
  if (e.length > 0) {
    const r = e.map((o) => (o.operator === c.Is && o.property !== h.Amount ? n.push(`%${o.value}%`) : n.push(o.value), `${o.property} ${i(o.operator)} ?`));
    t += " WHERE " + r.join(" AND ");
  }
  if (s.length > 0) {
    const r = s.map((o) => `${o.property} ${i(o.orientation)}`);
    t += " ORDER BY " + r.join(", ");
  }
  return T.prepare(t).all(...n);
}
function O(e, s, t, n) {
  return T.prepare(`
        INSERT INTO debits (date, title, amount, category)
        VALUES (?, ?, ?, ?)
    `).run(e, s, t, n);
}
function y(e, s) {
  let t = "SELECT * FROM debits";
  const n = [];
  function i(r) {
    if (r === c.Is)
      return "LIKE";
    if (r === c.IsExactly)
      return "=";
    if (r === c.MoreThan)
      return ">";
    if (r === c.LessThan)
      return "<";
    if (r === l.Asc)
      return "ASC";
    if (r === l.Desc)
      return "DESC";
    throw new Error(`Unsupported operator type: ${r}`);
  }
  if (e.length > 0) {
    const r = e.map((o) => (o.operator === c.Is && o.property !== h.Amount ? n.push(`%${o.value}%`) : n.push(o.value), `${o.property} ${i(o.operator)} ?`));
    t += " WHERE " + r.join(" AND ");
  }
  if (s.length > 0) {
    const r = s.map((o) => `${o.property} ${i(o.orientation)}`);
    t += " ORDER BY " + r.join(", ");
  }
  return T.prepare(t).all(...n);
}
const m = E.dirname(f(import.meta.url));
process.env.APP_ROOT = E.join(m, "..");
const p = process.env.VITE_DEV_SERVER_URL;
E.join(process.env.APP_ROOT, "dist-electron");
const A = E.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = p ? E.join(process.env.APP_ROOT, "public") : A;
let a;
function _() {
  a = new I({
    icon: E.join(process.env.VITE_PUBLIC, "../public/glome-icon.png"),
    // Path to your icon
    webPreferences: {
      preload: E.join(m, "preload.mjs")
    }
  }), a.setMenuBarVisibility(!1), a.webContents.on("did-finish-load", () => {
    a == null || a.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), p ? a.loadURL(p).then(() => {
    if (!a)
      throw new Error('"win" is not defined');
  }) : a.loadFile(E.join(A, "index.html")).then(() => {
    if (!a)
      throw new Error('"win" is not defined');
  });
}
R.handle("getCredits", async (e, s, t) => {
  try {
    return v(s, t);
  } catch (n) {
    throw console.error("Error when fetching credits", n), n;
  }
});
R.handle("addCredit", async (e, s) => {
  try {
    const { date: t, title: n, amount: i, category: d } = s;
    return b(t, n, i, d);
  } catch (t) {
    throw console.error("Error when adding credit", t), t;
  }
});
R.handle("getDebits", async (e, s, t) => {
  try {
    return y(s, t);
  } catch (n) {
    throw console.error("Error when fetching debits", n), n;
  }
});
R.handle("addDebit", async (e, s) => {
  try {
    const { date: t, title: n, amount: i, category: d } = s;
    return O(t, n, i, d);
  } catch (t) {
    console.error("Error when adding debit", t);
  }
});
u.on("window-all-closed", () => {
  process.platform !== "darwin" && (u.quit(), a = null);
});
u.on("activate", () => {
  I.getAllWindows().length === 0 && _();
});
u.whenReady().then(_);
export {
  A as RENDERER_DIST,
  p as VITE_DEV_SERVER_URL
};
