import { ipcMain as E, app as n, BrowserWindow as l } from "electron";
import { fileURLToPath as u } from "node:url";
import t from "node:path";
import { createRequire as _ } from "module";
const w = _(import.meta.url), f = w("better-sqlite3"), I = "./local.db", h = {}, A = `
    CREATE TABLE IF NOT EXISTS credits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );
`, C = `
    INSERT INTO credits (date, title, amount, category)
    VALUES (?, ?, ?, ?)
`, P = "SELECT * FROM credits", a = new f(I, h);
a.exec(A);
function S(r, i, o, s) {
  return a.prepare(C).run(r, i, o, s);
}
function O() {
  return a.prepare(P).all();
}
const T = t.dirname(u(import.meta.url));
process.env.APP_ROOT = t.join(T, "..");
const c = process.env.VITE_DEV_SERVER_URL;
t.join(process.env.APP_ROOT, "dist-electron");
const R = t.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = c ? t.join(process.env.APP_ROOT, "public") : R;
let e;
function p() {
  e = new l({
    icon: t.join(process.env.VITE_PUBLIC, "../public/glome-icon.png"),
    // Path to your icon
    webPreferences: {
      preload: t.join(T, "preload.mjs")
    }
  }), e.setMenuBarVisibility(!1), e.webContents.on("did-finish-load", () => {
    e == null || e.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), c ? e.loadURL(c).then(() => {
    if (!e)
      throw new Error('"win" is not defined');
  }) : e.loadFile(t.join(R, "index.html")).then(() => {
    if (!e)
      throw new Error('"win" is not defined');
  });
}
E.handle("getCredits", async () => {
  try {
    return O();
  } catch (r) {
    throw console.error("Erreur lors de la récupération des crédits", r), r;
  }
});
E.handle("addCredit", async (r, i) => {
  try {
    const { date: o, title: s, amount: d, category: m } = i;
    return S(o, s, d, m);
  } catch (o) {
    throw console.error("Erreur lors de l'ajout du crédit", o), o;
  }
});
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  l.getAllWindows().length === 0 && p();
});
n.whenReady().then(p);
export {
  R as RENDERER_DIST,
  c as VITE_DEV_SERVER_URL
};
