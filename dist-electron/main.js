import { ipcMain, app, BrowserWindow } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "module";
var Operator = /* @__PURE__ */ ((Operator2) => {
  Operator2["Is"] = ": ";
  Operator2["IsExactly"] = " = ";
  Operator2["LessThan"] = " < ";
  Operator2["MoreThan"] = " > ";
  return Operator2;
})(Operator || {});
var Orientation = /* @__PURE__ */ ((Orientation2) => {
  Orientation2["Asc"] = "↓";
  Orientation2["Desc"] = "↑";
  return Orientation2;
})(Orientation || {});
var SummaryProperty = /* @__PURE__ */ ((SummaryProperty2) => {
  SummaryProperty2["Date"] = "date";
  SummaryProperty2["Title"] = "title";
  SummaryProperty2["Amount"] = "amount";
  SummaryProperty2["Category"] = "category";
  return SummaryProperty2;
})(SummaryProperty || {});
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
function getDefaultExportFromCjs(x) {
  return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
}
var dayjs_min = { exports: {} };
(function(module, exports) {
  !function(t, e) {
    module.exports = e();
  }(commonjsGlobal, function() {
    var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
      var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
      return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
    } }, m = function(t2, e2, n2) {
      var r2 = String(t2);
      return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
    }, v = { s: m, z: function(t2) {
      var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
      return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
    }, m: function t2(e2, n2) {
      if (e2.date() < n2.date()) return -t2(n2, e2);
      var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
      return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
    }, a: function(t2) {
      return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
    }, p: function(t2) {
      return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
    }, u: function(t2) {
      return void 0 === t2;
    } }, g = "en", D = {};
    D[g] = M;
    var p = "$isDayjsObject", S = function(t2) {
      return t2 instanceof _ || !(!t2 || !t2[p]);
    }, w = function t2(e2, n2, r2) {
      var i2;
      if (!e2) return g;
      if ("string" == typeof e2) {
        var s2 = e2.toLowerCase();
        D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
        var u2 = e2.split("-");
        if (!i2 && u2.length > 1) return t2(u2[0]);
      } else {
        var a2 = e2.name;
        D[a2] = e2, i2 = a2;
      }
      return !r2 && i2 && (g = i2), i2 || !r2 && g;
    }, O = function(t2, e2) {
      if (S(t2)) return t2.clone();
      var n2 = "object" == typeof e2 ? e2 : {};
      return n2.date = t2, n2.args = arguments, new _(n2);
    }, b = v;
    b.l = w, b.i = S, b.w = function(t2, e2) {
      return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
    };
    var _ = function() {
      function M2(t2) {
        this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
      }
      var m2 = M2.prototype;
      return m2.parse = function(t2) {
        this.$d = function(t3) {
          var e2 = t3.date, n2 = t3.utc;
          if (null === e2) return /* @__PURE__ */ new Date(NaN);
          if (b.u(e2)) return /* @__PURE__ */ new Date();
          if (e2 instanceof Date) return new Date(e2);
          if ("string" == typeof e2 && !/Z$/i.test(e2)) {
            var r2 = e2.match($);
            if (r2) {
              var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
              return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
            }
          }
          return new Date(e2);
        }(t2), this.init();
      }, m2.init = function() {
        var t2 = this.$d;
        this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
      }, m2.$utils = function() {
        return b;
      }, m2.isValid = function() {
        return !(this.$d.toString() === l);
      }, m2.isSame = function(t2, e2) {
        var n2 = O(t2);
        return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
      }, m2.isAfter = function(t2, e2) {
        return O(t2) < this.startOf(e2);
      }, m2.isBefore = function(t2, e2) {
        return this.endOf(e2) < O(t2);
      }, m2.$g = function(t2, e2, n2) {
        return b.u(t2) ? this[e2] : this.set(n2, t2);
      }, m2.unix = function() {
        return Math.floor(this.valueOf() / 1e3);
      }, m2.valueOf = function() {
        return this.$d.getTime();
      }, m2.startOf = function(t2, e2) {
        var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
          var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
          return r2 ? i2 : i2.endOf(a);
        }, $2 = function(t3, e3) {
          return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
        }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
        switch (f2) {
          case h:
            return r2 ? l2(1, 0) : l2(31, 11);
          case c:
            return r2 ? l2(1, M3) : l2(0, M3 + 1);
          case o:
            var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
            return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
          case a:
          case d:
            return $2(v2 + "Hours", 0);
          case u:
            return $2(v2 + "Minutes", 1);
          case s:
            return $2(v2 + "Seconds", 2);
          case i:
            return $2(v2 + "Milliseconds", 3);
          default:
            return this.clone();
        }
      }, m2.endOf = function(t2) {
        return this.startOf(t2, false);
      }, m2.$set = function(t2, e2) {
        var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
        if (o2 === c || o2 === h) {
          var y2 = this.clone().set(d, 1);
          y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
        } else l2 && this.$d[l2]($2);
        return this.init(), this;
      }, m2.set = function(t2, e2) {
        return this.clone().$set(t2, e2);
      }, m2.get = function(t2) {
        return this[b.p(t2)]();
      }, m2.add = function(r2, f2) {
        var d2, l2 = this;
        r2 = Number(r2);
        var $2 = b.p(f2), y2 = function(t2) {
          var e2 = O(l2);
          return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
        };
        if ($2 === c) return this.set(c, this.$M + r2);
        if ($2 === h) return this.set(h, this.$y + r2);
        if ($2 === a) return y2(1);
        if ($2 === o) return y2(7);
        var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
        return b.w(m3, this);
      }, m2.subtract = function(t2, e2) {
        return this.add(-1 * t2, e2);
      }, m2.format = function(t2) {
        var e2 = this, n2 = this.$locale();
        if (!this.isValid()) return n2.invalidDate || l;
        var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
          return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
        }, d2 = function(t3) {
          return b.s(s2 % 12 || 12, t3, "0");
        }, $2 = f2 || function(t3, e3, n3) {
          var r3 = t3 < 12 ? "AM" : "PM";
          return n3 ? r3.toLowerCase() : r3;
        };
        return r2.replace(y, function(t3, r3) {
          return r3 || function(t4) {
            switch (t4) {
              case "YY":
                return String(e2.$y).slice(-2);
              case "YYYY":
                return b.s(e2.$y, 4, "0");
              case "M":
                return a2 + 1;
              case "MM":
                return b.s(a2 + 1, 2, "0");
              case "MMM":
                return h2(n2.monthsShort, a2, c2, 3);
              case "MMMM":
                return h2(c2, a2);
              case "D":
                return e2.$D;
              case "DD":
                return b.s(e2.$D, 2, "0");
              case "d":
                return String(e2.$W);
              case "dd":
                return h2(n2.weekdaysMin, e2.$W, o2, 2);
              case "ddd":
                return h2(n2.weekdaysShort, e2.$W, o2, 3);
              case "dddd":
                return o2[e2.$W];
              case "H":
                return String(s2);
              case "HH":
                return b.s(s2, 2, "0");
              case "h":
                return d2(1);
              case "hh":
                return d2(2);
              case "a":
                return $2(s2, u2, true);
              case "A":
                return $2(s2, u2, false);
              case "m":
                return String(u2);
              case "mm":
                return b.s(u2, 2, "0");
              case "s":
                return String(e2.$s);
              case "ss":
                return b.s(e2.$s, 2, "0");
              case "SSS":
                return b.s(e2.$ms, 3, "0");
              case "Z":
                return i2;
            }
            return null;
          }(t3) || i2.replace(":", "");
        });
      }, m2.utcOffset = function() {
        return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
      }, m2.diff = function(r2, d2, l2) {
        var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
          return b.m(y2, m3);
        };
        switch (M3) {
          case h:
            $2 = D2() / 12;
            break;
          case c:
            $2 = D2();
            break;
          case f:
            $2 = D2() / 3;
            break;
          case o:
            $2 = (g2 - v2) / 6048e5;
            break;
          case a:
            $2 = (g2 - v2) / 864e5;
            break;
          case u:
            $2 = g2 / n;
            break;
          case s:
            $2 = g2 / e;
            break;
          case i:
            $2 = g2 / t;
            break;
          default:
            $2 = g2;
        }
        return l2 ? $2 : b.a($2);
      }, m2.daysInMonth = function() {
        return this.endOf(c).$D;
      }, m2.$locale = function() {
        return D[this.$L];
      }, m2.locale = function(t2, e2) {
        if (!t2) return this.$L;
        var n2 = this.clone(), r2 = w(t2, e2, true);
        return r2 && (n2.$L = r2), n2;
      }, m2.clone = function() {
        return b.w(this.$d, this);
      }, m2.toDate = function() {
        return new Date(this.valueOf());
      }, m2.toJSON = function() {
        return this.isValid() ? this.toISOString() : null;
      }, m2.toISOString = function() {
        return this.$d.toISOString();
      }, m2.toString = function() {
        return this.$d.toUTCString();
      }, M2;
    }(), k = _.prototype;
    return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function(t2) {
      k[t2[1]] = function(e2) {
        return this.$g(e2, t2[0], t2[1]);
      };
    }), O.extend = function(t2, e2) {
      return t2.$i || (t2(e2, _, O), t2.$i = true), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
      return O(1e3 * t2);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
})(dayjs_min);
var dayjs_minExports = dayjs_min.exports;
const dayjs = /* @__PURE__ */ getDefaultExportFromCjs(dayjs_minExports);
const require2 = createRequire(import.meta.url);
const Database = require2("better-sqlite3");
function typeToOperator(type) {
  if (type === Operator.Is) {
    return "LIKE";
  } else if (type === Operator.IsExactly) {
    return "=";
  } else if (type === Operator.MoreThan) {
    return ">";
  } else if (type === Operator.LessThan) {
    return "<";
  } else if (type === Orientation.Asc) {
    return "ASC";
  } else if (type === Orientation.Desc) {
    return "DESC";
  } else {
    throw new Error(`Unsupported operator type: ${type}`);
  }
}
const DATABASE_PATH = "./local.db";
const DB_OPTIONS = {};
const db = new Database(DATABASE_PATH, DB_OPTIONS);
db.exec(`
    CREATE TABLE IF NOT EXISTS debits (
        id INTEGER PRIMARY KEY,
        date TEXT,
        title TEXT,
        amount REAL,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS credits_groups (
        id INTEGER PRIMARY KEY,
        date TEXT,
        title TEXT,
        category TEXT
    );

    CREATE TABLE IF NOT EXISTS credits_tables (
        id INTEGER PRIMARY KEY,
        group_id INTEGER,
        type TINYINT, -- 0: other, 1: banknotes, 2: coins, 3: cheques
        FOREIGN KEY (group_id) REFERENCES credits_groups(id)
    );

    CREATE TABLE IF NOT EXISTS credits_rows (
        id INTEGER PRIMARY KEY,
        table_id INTEGER,
        quantity TINYINT,
        amount REAL,
        FOREIGN KEY (table_id) REFERENCES credits_tables(id)
    );
`);
function getCredits(filters, sort) {
  let query = `
        SELECT
            cr.id AS id,
            cg.date,
            cg.title,
            SUM(cr.quantity * cr.amount) AS amount,
            cg.category
        FROM
            credits_groups cg
                JOIN
            credits_tables ct ON cg.id = ct.group_id
                JOIN
            credits_rows cr ON ct.id = cr.table_id
    `;
  const queryParams = [];
  function typeToOperator2(type) {
    if (type === Operator.Is) {
      return "LIKE";
    } else if (type === Operator.IsExactly) {
      return "=";
    } else if (type === Operator.MoreThan) {
      return ">";
    } else if (type === Operator.LessThan) {
      return "<";
    } else if (type === Orientation.Asc) {
      return "ASC";
    } else if (type === Orientation.Desc) {
      return "DESC";
    } else {
      throw new Error(`Unsupported operator type: ${type}`);
    }
  }
  if (filters.length > 0) {
    const conditions = filters.map((filter) => {
      if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
        queryParams.push(`%${filter.value}%`);
      } else {
        queryParams.push(filter.value);
      }
      return `${filter.property} ${typeToOperator2(filter.operator)} ?`;
    });
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " GROUP BY cg.id, cg.date, cg.title, cg.category";
  if (sort.length > 0) {
    const sortConditions = sort.map((s) => `${s.property} ${typeToOperator2(s.orientation)}`);
    query += " ORDER BY " + sortConditions.join(", ");
  }
  const stmt = db.prepare(query);
  return stmt.all(...queryParams);
}
function getDebits(filters, sort) {
  let query = "SELECT * FROM debits";
  const queryParams = [];
  if (filters.length > 0) {
    const conditions = filters.map((filter) => {
      if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
        queryParams.push(`%${filter.value}%`);
      } else {
        queryParams.push(filter.value);
      }
      return `${filter.property} ${typeToOperator(filter.operator)} ?`;
    });
    query += " WHERE " + conditions.join(" AND ");
  }
  if (sort.length > 0) {
    const sortConditions = sort.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
    query += " ORDER BY " + sortConditions.join(", ");
  }
  const stmt = db.prepare(query);
  return stmt.all(...queryParams);
}
function getTransactionsByMonth() {
  const startDate = dayjs().subtract(11, "month").startOf("month").format("YYYY-MM-DD");
  const creditStmt = db.prepare(`
        SELECT cg.date, SUM(cr.quantity * cr.amount) AS amount
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date >= ?
        GROUP BY cg.date
    `);
  const creditRecords = creditStmt.all(startDate);
  const debitStmt = db.prepare(`
        SELECT date, amount FROM debits
        WHERE date >= ?
    `);
  const debitRecords = debitStmt.all(startDate);
  const months = [];
  const startMonth = dayjs().subtract(11, "month").startOf("month");
  for (let i = 0; i < 12; i++) {
    months.push(startMonth.add(i, "month").format("YYYY-MM"));
  }
  const creditSums = Array(12).fill(0);
  const debitSums = Array(12).fill(0);
  for (const credit of creditRecords) {
    const monthKey = dayjs(credit.date).format("YYYY-MM");
    const monthIndex = months.indexOf(monthKey);
    if (monthIndex !== -1) {
      creditSums[monthIndex] += credit.amount;
    }
  }
  for (const debit of debitRecords) {
    const monthKey = dayjs(debit.date).format("YYYY-MM");
    const monthIndex = months.indexOf(monthKey);
    if (monthIndex !== -1) {
      debitSums[monthIndex] += debit.amount;
    }
  }
  return [creditSums, debitSums];
}
function getCreditsSumByCategory() {
  const dateThreshold = dayjs().subtract(12, "month").toISOString();
  const query = `
        SELECT cg.category, SUM(cr.quantity * cr.amount) as total
        FROM credits_groups cg
                 JOIN credits_tables ct ON cg.id = ct.group_id
                 JOIN credits_rows cr ON ct.id = cr.table_id
        WHERE cg.date > ?
        GROUP BY cg.category
    `;
  const stmt = db.prepare(query);
  const rows = stmt.all(dateThreshold);
  const categories = rows.map((row) => row.category);
  const values = rows.map((row) => row.total);
  return { categories, values };
}
function getDebitsSumByCategory() {
  const dateThreshold = dayjs().subtract(12, "month").toISOString();
  const query = `
        SELECT category, SUM(amount) as total
        FROM debits
        WHERE date >= ?
        GROUP BY category
    `;
  const stmt = db.prepare(query);
  const rows = stmt.all(dateThreshold);
  const categories = rows.map((row) => row.category);
  const values = rows.map((row) => row.total);
  return { categories, values };
}
function getCreditsList(filters, sorts) {
  let query = `
        SELECT
            cg.id AS group_id,
            cg.title AS group_title,
            JSON_GROUP_ARRAY(ct.type) AS table_types,
            SUM(cr.quantity * cr.amount) AS total_amount
        FROM
            credits_groups cg
                JOIN
            credits_tables ct ON cg.id = ct.group_id
                JOIN
            credits_rows cr ON ct.id = cr.table_id
    `;
  const queryParams = [];
  if (filters.length > 0) {
    const conditions = filters.map((filter) => {
      if (filter.operator === Operator.Is && filter.property !== SummaryProperty.Amount) {
        queryParams.push(`%${filter.value}%`);
      } else {
        queryParams.push(filter.value);
      }
      return `${filter.property} ${typeToOperator(filter.operator)} ?`;
    });
    query += " WHERE " + conditions.join(" AND ");
  }
  query += " GROUP BY cg.id, cg.title";
  if (sorts.length > 0) {
    const sortConditions = sorts.map((s) => `${s.property} ${typeToOperator(s.orientation)}`);
    query += " ORDER BY " + sortConditions.join(", ");
  }
  const stmt = db.prepare(query);
  const rows = stmt.all(...queryParams);
  return rows.map((row) => ({
    id: row.group_id,
    title: row.group_title,
    types: JSON.parse(row.table_types).filter((_, index) => index % 2 === 0),
    totalAmount: row.total_amount
  }));
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
    // Ajout des options de taille minimale
    minWidth: 900,
    minHeight: 600,
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
ipcMain.handle("getDebits", async (_event, filters, sorts) => {
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
ipcMain.handle("getCreditsList", async (_event, filters, sorts) => {
  try {
    return getCreditsList(filters, sorts);
  } catch (error) {
    console.error("Error when fetching creditsList", error);
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
