"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/tsup/assets/cjs_shims.js
var getImportMetaUrl, importMetaUrl;
var init_cjs_shims = __esm({
  "node_modules/tsup/assets/cjs_shims.js"() {
    "use strict";
    getImportMetaUrl = () => typeof document === "undefined" ? new URL(`file:${__filename}`).href : document.currentScript && document.currentScript.tagName.toUpperCase() === "SCRIPT" ? document.currentScript.src : new URL("main.js", document.baseURI).href;
    importMetaUrl = /* @__PURE__ */ getImportMetaUrl();
  }
});

// src/core/calendar.ts
function parseContributionDate(date) {
  if (!ISO_DATE_PATTERN.test(date)) {
    throw new Error(`Invalid contribution date: "${date}"`);
  }
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  if (!Number.isFinite(timestamp) || new Date(timestamp).toISOString().slice(0, 10) !== date) {
    throw new Error(`Invalid contribution date: "${date}"`);
  }
  return timestamp;
}
function formatContributionDate(timestamp) {
  return new Date(timestamp).toISOString().slice(0, 10);
}
function getContributionDayOfWeek(date) {
  return new Date(parseContributionDate(date)).getUTCDay();
}
function normalizeContributionWeeks(weeks) {
  const daysByDate = /* @__PURE__ */ new Map();
  for (const week of weeks) {
    for (const day of week.days) {
      parseContributionDate(day.date);
      if (daysByDate.has(day.date)) {
        throw new Error(`Duplicate contribution date: "${day.date}"`);
      }
      daysByDate.set(day.date, day);
    }
  }
  const sortedDays = [...daysByDate.values()].sort((a, b) => a.date.localeCompare(b.date));
  const weeksByFirstDay = /* @__PURE__ */ new Map();
  for (const day of sortedDays) {
    const timestamp = parseContributionDate(day.date);
    const firstDay = formatContributionDate(timestamp - new Date(timestamp).getUTCDay() * DAY_MS);
    const days = weeksByFirstDay.get(firstDay) ?? [];
    days.push(day);
    weeksByFirstDay.set(firstDay, days);
  }
  return [...weeksByFirstDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([firstDay, days]) => ({ firstDay, days }));
}
var DAY_MS, ISO_DATE_PATTERN;
var init_calendar = __esm({
  "src/core/calendar.ts"() {
    "use strict";
    init_cjs_shims();
    DAY_MS = 864e5;
    ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
  }
});

// src/core/stats.ts
function computeStats(weeks) {
  if (weeks.length === 0) {
    return {
      total: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostActiveDay: "Monday",
      // Default for empty data
      activeDays: 0,
      busiestMonth: "",
      fromDate: "",
      toDate: ""
    };
  }
  const allDays = normalizeContributionWeeks(weeks).flatMap((week) => week.days);
  if (allDays.length === 0) {
    return {
      total: 0,
      longestStreak: 0,
      currentStreak: 0,
      mostActiveDay: "Monday",
      activeDays: 0,
      busiestMonth: "",
      fromDate: "",
      toDate: ""
    };
  }
  const total = allDays.reduce((sum, day) => sum + day.count, 0);
  const activeDays = allDays.filter((day) => day.count > 0).length;
  const monthTotals = /* @__PURE__ */ new Map();
  for (const day of allDays) {
    if (day.count > 0) {
      const month = day.date.slice(0, 7);
      monthTotals.set(month, (monthTotals.get(month) ?? 0) + day.count);
    }
  }
  let busiestMonth = "";
  let busiestMonthTotal = 0;
  for (const [month, monthTotal] of monthTotals) {
    if (monthTotal > busiestMonthTotal) {
      busiestMonth = month;
      busiestMonthTotal = monthTotal;
    }
  }
  let longestStreak = 0;
  let currentStreakCount = 0;
  let previousTimestamp;
  for (const day of allDays) {
    const timestamp = Date.parse(`${day.date}T00:00:00.000Z`);
    if (day.count > 0) {
      currentStreakCount = previousTimestamp !== void 0 && timestamp - previousTimestamp === DAY_MS2 ? currentStreakCount + 1 : 1;
      longestStreak = Math.max(longestStreak, currentStreakCount);
    } else {
      currentStreakCount = 0;
    }
    previousTimestamp = timestamp;
  }
  let currentStreak = 0;
  let laterTimestamp;
  for (let i = allDays.length - 1; i >= 0; i--) {
    const day = allDays[i];
    const timestamp = Date.parse(`${day.date}T00:00:00.000Z`);
    if (day.count <= 0 || laterTimestamp !== void 0 && laterTimestamp - timestamp !== DAY_MS2) {
      break;
    }
    currentStreak++;
    laterTimestamp = timestamp;
  }
  const dayTotals = [0, 0, 0, 0, 0, 0, 0];
  for (const day of allDays) {
    dayTotals[getContributionDayOfWeek(day.date)] += day.count;
  }
  let maxDayIndex = 0;
  let maxContributions = dayTotals[0];
  for (let i = 1; i < dayTotals.length; i++) {
    if (dayTotals[i] > maxContributions) {
      maxContributions = dayTotals[i];
      maxDayIndex = i;
    }
  }
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const mostActiveDay = dayNames[maxDayIndex];
  return {
    total,
    longestStreak,
    currentStreak,
    mostActiveDay,
    activeDays,
    busiestMonth,
    fromDate: allDays[0].date,
    toDate: allDays[allDays.length - 1].date
  };
}
var DAY_MS2;
var init_stats = __esm({
  "src/core/stats.ts"() {
    "use strict";
    init_cjs_shims();
    init_calendar();
    DAY_MS2 = 864e5;
  }
});

// src/core/presets.ts
function isVillagePreset(value) {
  return value in VILLAGE_PRESETS;
}
var VILLAGE_PRESETS, DEFAULT_VILLAGE_PRESET;
var init_presets = __esm({
  "src/core/presets.ts"() {
    "use strict";
    init_cjs_shims();
    VILLAGE_PRESETS = {
      nature: {
        displayName: "Nature",
        description: "Fewer buildings, with more forests and open terrain",
        density: 2
      },
      balanced: {
        displayName: "Balanced",
        description: "A mix of nature, farms, villages, and cities",
        density: 5
      },
      civilization: {
        displayName: "Civilization",
        description: "More buildings across everyday contribution levels",
        density: 9
      }
    };
    DEFAULT_VILLAGE_PRESET = "balanced";
  }
});

// src/core/settings/errors.ts
var InputValidationError;
var init_errors = __esm({
  "src/core/settings/errors.ts"() {
    "use strict";
    init_cjs_shims();
    InputValidationError = class extends Error {
      constructor(issues) {
        super(issues.map((issue) => `${issue.path}: ${issue.message}`).join("; "));
        this.issues = issues;
      }
      name = "InputValidationError";
      code = "INVALID_INPUT";
    };
  }
});

// src/core/settings/boundary.ts
function readJsonInput(input) {
  let json;
  try {
    json = typeof input === "string" ? input : JSON.stringify(input);
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    throw new InputValidationError([{ path: "$", message: "Expected JSON-compatible input" }]);
  }
  if (json !== void 0 && (json.length > MAX_IMPORT_BYTES || new TextEncoder().encode(json).length > MAX_IMPORT_BYTES)) {
    throw new InputValidationError([{ path: "$", message: "Import exceeds 2 MiB limit" }]);
  }
  if (typeof input !== "string") return input;
  try {
    const parsed = JSON.parse(input);
    return parsed;
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    throw new InputValidationError([{ path: "$", message: "Malformed JSON" }]);
  }
}
function parseBoundary(schema, input, prefix = "") {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new InputValidationError(
    result.error.issues.map((issue) => ({
      path: [prefix, ...issue.path.map(String)].filter(Boolean).join(".") || "$",
      message: issue.message
    }))
  );
}
var MAX_IMPORT_BYTES, MAX_CONTRIBUTION_DAYS, MAX_ARCHIVE_SNAPSHOTS;
var init_boundary = __esm({
  "src/core/settings/boundary.ts"() {
    "use strict";
    init_cjs_shims();
    init_errors();
    MAX_IMPORT_BYTES = 2 * 1024 * 1024;
    MAX_CONTRIBUTION_DAYS = 2e4;
    MAX_ARCHIVE_SNAPSHOTS = 20;
  }
});

// src/core/settings/schema.ts
var import_zod, xml10TextSchema, villageStyleSchema, usernameSchema, yearSchema, fixedNormalizationSchema, normalizationSchema, renderSettingsSchema, renderSettingsInputSchema;
var init_schema = __esm({
  "src/core/settings/schema.ts"() {
    "use strict";
    init_cjs_shims();
    import_zod = require("zod");
    xml10TextSchema = import_zod.z.string().refine(
      (value) => Array.from(value).every((character) => {
        const codePoint = character.codePointAt(0);
        return codePoint !== void 0 && (codePoint === 9 || codePoint === 10 || codePoint === 13 || codePoint >= 32 && codePoint <= 55295 || codePoint >= 57344 && codePoint <= 65533 || codePoint >= 65536 && codePoint <= 1114111);
      }),
      "Expected XML 1.0 compatible text"
    );
    villageStyleSchema = import_zod.z.enum(["classic", "korean"]);
    usernameSchema = import_zod.z.string().trim().min(1).max(39).regex(/^[a-z\d](?:[a-z\d-]*[a-z\d])?$/i, "Expected a GitHub username");
    yearSchema = import_zod.z.number().int().min(1).max(9999);
    fixedNormalizationSchema = import_zod.z.strictObject({
      kind: import_zod.z.literal("fixed"),
      maxCount: import_zod.z.number().finite().positive()
    });
    normalizationSchema = import_zod.z.discriminatedUnion("kind", [
      import_zod.z.strictObject({ kind: import_zod.z.literal("relative") }),
      fixedNormalizationSchema
    ]);
    renderSettingsSchema = import_zod.z.strictObject({
      preset: import_zod.z.enum(["nature", "balanced", "civilization"]),
      density: import_zod.z.number().int().min(1).max(10),
      title: xml10TextSchema.max(1e3),
      hemisphere: import_zod.z.enum(["north", "south"]),
      motion: import_zod.z.enum(["full", "subtle", "off"]),
      layout: import_zod.z.enum(["banner", "card"]),
      style: villageStyleSchema,
      normalization: normalizationSchema,
      layoutSeed: xml10TextSchema.max(256).optional()
    });
    renderSettingsInputSchema = renderSettingsSchema.partial().extend({ villageStyle: villageStyleSchema.optional() }).superRefine((settings, context) => {
      if (settings.style !== void 0 && settings.villageStyle !== void 0 && settings.style !== settings.villageStyle) {
        context.addIssue({
          code: "custom",
          path: ["villageStyle"],
          message: "villageStyle conflicts with style"
        });
      }
    }).transform(({ villageStyle, ...settings }) => {
      const style = settings.style ?? villageStyle;
      return { ...settings, ...style === void 0 ? {} : { style } };
    });
  }
});

// src/core/settings/resolve.ts
function resolveRenderSettings(explicit = {}, loaded = {}, username = "") {
  const overrides = parseBoundary(renderSettingsInputSchema, explicit, "settings");
  const stored = parseBoundary(renderSettingsInputSchema, loaded, "settings");
  const preset = overrides.preset ?? stored.preset ?? "balanced";
  const layoutSeed = overrides.layoutSeed ?? stored.layoutSeed;
  return {
    preset,
    density: overrides.density ?? stored.density ?? VILLAGE_PRESETS[preset].density,
    title: overrides.title ?? stored.title ?? (username ? `@${username}` : "My Village"),
    hemisphere: overrides.hemisphere ?? stored.hemisphere ?? "north",
    motion: overrides.motion ?? stored.motion ?? "full",
    layout: overrides.layout ?? stored.layout ?? "banner",
    style: overrides.style ?? stored.style ?? "classic",
    normalization: overrides.normalization ?? stored.normalization ?? { kind: "relative" },
    ...layoutSeed === void 0 ? {} : { layoutSeed }
  };
}
var init_resolve = __esm({
  "src/core/settings/resolve.ts"() {
    "use strict";
    init_cjs_shims();
    init_presets();
    init_boundary();
    init_schema();
  }
});

// src/core/settings/normalization.ts
function computeP90Max(counts) {
  const positive = counts.filter((count) => count > 0).sort((a, b) => a - b);
  return positive[Math.min(Math.floor(positive.length * 0.9), positive.length - 1)] ?? 1;
}
function normalizeCount100(count, maxCount) {
  if (count === 0) return 0;
  const ratio = Math.max(0, Math.min(count / maxCount, 1));
  return Math.max(1, Math.min(Math.round(Math.sqrt(ratio) * 98) + 1, 99));
}
var init_normalization = __esm({
  "src/core/settings/normalization.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/core/svg.ts
function svgElement(tag, attrs, children) {
  const attrString = Object.entries(attrs).map(([key, value]) => `${key}="${escapeXml(String(value))}"`).join(" ");
  if (children !== void 0) {
    return `<${tag} ${attrString}>${children}</${tag}>`;
  }
  return `<${tag} ${attrString}/>`;
}
function svgRoot(attrs, content, accessibility) {
  const mergedAttrs = {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 840 240",
    ...attrs
  };
  if (!accessibility) {
    return svgElement("svg", mergedAttrs, content);
  }
  const namespace = accessibility.namespace ?? "maeul-svg";
  mergedAttrs.role = "img";
  mergedAttrs["aria-labelledby"] = `${namespace}-title ${namespace}-description`;
  mergedAttrs.focusable = "false";
  const accessibleContent = `<title id="${escapeXml(namespace)}-title">${escapeXml(accessibility.title)}</title><desc id="${escapeXml(namespace)}-description">${escapeXml(accessibility.description)}</desc>` + content;
  return svgElement("svg", mergedAttrs, accessibleContent);
}
function svgStyle(css) {
  return `<style><![CDATA[${css}]]></style>`;
}
function svgText(x, y, text, attrs) {
  const mergedAttrs = {
    x,
    y,
    ...attrs
  };
  return svgElement("text", mergedAttrs, escapeXml(text));
}
function formatNumber(n) {
  const text = n.toString();
  if (text.includes("e")) return text;
  const [integer = "", fraction] = text.split(".");
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return fraction === void 0 ? grouped : `${grouped}.${fraction}`;
}
function escapeXml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
function svgNumber(value) {
  return String(Math.round(value * 100) / 100);
}
var init_svg = __esm({
  "src/core/svg.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/utils/math.ts
function lerp(a, b, t) {
  return a + (b - a) * t;
}
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
function hash(str) {
  let hash2 = 5381;
  for (let i = 0; i < str.length; i++) {
    hash2 = hash2 * 33 ^ str.charCodeAt(i);
  }
  return hash2 >>> 0;
}
function seededRandom(seed) {
  return function() {
    let t = seed += 1831565813;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
var init_math = __esm({
  "src/utils/math.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/shared.ts
function renderTitle(title, palette) {
  return [
    `<text`,
    ` x="24"`,
    ` y="17"`,
    ` font-family="${FONT_FAMILY}"`,
    ` font-size="14"`,
    ` fill="${palette.text.primary}"`,
    ` font-weight="600"`,
    `>${escapeXml(title)}</text>`
  ].join("");
}
function formatIsoDate(date) {
  const [year, month, day] = date.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${Number(day)}, ${year}`;
}
function formatMonth(month) {
  const [year, monthNumber] = month.split("-");
  return `${MONTH_NAMES[Number(monthNumber) - 1]} ${year}`;
}
function renderSubtitle(stats, wonderCount, palette) {
  const details = [];
  if (stats.fromDate && stats.toDate) {
    details.push(`${formatIsoDate(stats.fromDate)} to ${formatIsoDate(stats.toDate)}`);
  }
  if (wonderCount > 0) {
    details.push(`${wonderCount} ${wonderCount === 1 ? "wonder" : "wonders"} discovered`);
  }
  if (details.length === 0) return "";
  return `<text x="24" y="32" font-family="${FONT_FAMILY}" font-size="9" fill="${palette.text.secondary}">${escapeXml(details.join(" \xB7 "))}</text>`;
}
function renderStatsBar(stats, palette) {
  const items = [
    `${formatNumber(stats.total)} contributions`,
    `${formatNumber(stats.activeDays)} active days`,
    `${formatNumber(stats.currentStreak)}d current streak`,
    `${formatNumber(stats.longestStreak)}d longest streak`,
    `Busiest: ${stats.busiestMonth ? formatMonth(stats.busiestMonth) : "None"}`,
    `Most active: ${stats.activeDays ? stats.mostActiveDay : "None"}`
  ];
  const segments = items.map(
    (text, i) => `<text x="${24 + i * 136}" y="233" font-family="${FONT_FAMILY}" font-size="10" fill="${palette.text.secondary}">${escapeXml(text)}</text>`
  ).join("");
  return `<g class="stats-bar">${segments}</g>`;
}
function contributionGrid(data, options) {
  const { cellSize, gap, offsetX, offsetY } = options;
  const cells = [];
  const weeks = normalizeContributionWeeks(data.weeks);
  const firstSunday = Date.parse(weeks[0]?.firstDay ?? "1970-01-04");
  for (const weekData of weeks) {
    const sunday = Date.parse(weekData.firstDay);
    const week = Math.round((sunday - firstSunday) / 6048e5);
    const absoluteWeek = Math.floor((sunday - Date.UTC(1970, 0, 4)) / 6048e5);
    for (const dayData of weekData.days) {
      const day = getContributionDayOfWeek(dayData.date);
      cells.push({
        week,
        day,
        absoluteWeek,
        x: offsetX + week * (cellSize + gap),
        y: offsetY + day * (cellSize + gap),
        level: dayData.level,
        count: dayData.count,
        date: dayData.date
      });
    }
  }
  return cells;
}
function enrichGridCells100(cells, data, normalization = { kind: "relative" }) {
  const maxCount = normalization.kind === "fixed" ? normalization.maxCount : computeP90Max(data.weeks.flatMap((week) => week.days.map((day) => day.count)));
  return cells.map((cell) => ({ ...cell, level100: normalizeCount100(cell.count, maxCount) }));
}
var FONT_FAMILY, MONTH_NAMES;
var init_shared = __esm({
  "src/themes/shared.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_normalization();
    init_calendar();
    init_math();
    FONT_FAMILY = "'Segoe UI', system-ui, sans-serif";
    MONTH_NAMES = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
  }
});

// src/themes/terrain/seasons.ts
function getSeasonZone(week, rotation = 0) {
  let w = (week + rotation) % 52;
  w = clamp(w, 0, 51);
  for (const bound of ZONE_BOUNDS) {
    if (w >= bound.start && w <= bound.end) {
      return bound.zone;
    }
  }
  return 4;
}
function getTransitionBlend(week, rotation = 0) {
  let w = (week + rotation) % 52;
  w = clamp(w, 0, 51);
  const zone = getSeasonZone(week, rotation);
  switch (zone) {
    case 0:
      return { from: "winter", to: "winter", t: 0 };
    case 1: {
      const bound = ZONE_BOUNDS[1];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: "winter", to: "spring", t };
    }
    case 2:
      return { from: "spring", to: "spring", t: 0 };
    case 3: {
      const bound = ZONE_BOUNDS[3];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: "spring", to: "summer", t };
    }
    case 4:
      return { from: "summer", to: "summer", t: 0 };
    case 5: {
      const bound = ZONE_BOUNDS[5];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: "summer", to: "autumn", t };
    }
    case 6:
      return { from: "autumn", to: "autumn", t: 0 };
    case 7: {
      const bound = ZONE_BOUNDS[7];
      const t = (w - bound.start) / (bound.end - bound.start);
      return { from: "autumn", to: "winter", t };
    }
  }
}
function getSeasonalTint(week, rotation = 0) {
  const { from, to, t } = getTransitionBlend(week, rotation);
  const a = SEASON_TINTS[from];
  const b = SEASON_TINTS[to];
  return lerpTint(a, b, t);
}
function lerpTint(a, b, t) {
  return {
    colorShift: lerp(a.colorShift, b.colorShift, t),
    colorTarget: [
      Math.round(lerp(a.colorTarget[0], b.colorTarget[0], t)),
      Math.round(lerp(a.colorTarget[1], b.colorTarget[1], t)),
      Math.round(lerp(a.colorTarget[2], b.colorTarget[2], t))
    ],
    greenMul: lerp(a.greenMul, b.greenMul, t),
    warmth: lerp(a.warmth, b.warmth, t),
    snowCoverage: lerp(a.snowCoverage, b.snowCoverage, t),
    saturation: lerp(a.saturation, b.saturation, t)
  };
}
function applyTint(r, g, b, tint) {
  const gray = 0.299 * r + 0.587 * g + 0.114 * b;
  let nr = gray + (r - gray) * tint.saturation;
  let ng = gray + (g - gray) * tint.saturation;
  let nb = gray + (b - gray) * tint.saturation;
  ng *= tint.greenMul;
  nr += tint.warmth;
  nb -= tint.warmth;
  if (tint.colorShift > 0) {
    nr = lerp(nr, tint.colorTarget[0], tint.colorShift);
    ng = lerp(ng, tint.colorTarget[1], tint.colorShift);
    nb = lerp(nb, tint.colorTarget[2], tint.colorShift);
  }
  if (tint.snowCoverage > 0) {
    nr = lerp(nr, 240, tint.snowCoverage);
    ng = lerp(ng, 244, tint.snowCoverage);
    nb = lerp(nb, 250, tint.snowCoverage);
  }
  return [
    clamp(Math.round(nr), 0, 255),
    clamp(Math.round(ng), 0, 255),
    clamp(Math.round(nb), 0, 255)
  ];
}
function applyTintToHex(hex, tint) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const [nr, ng, nb] = applyTint(r, g, b, tint);
  return "#" + [nr, ng, nb].map((c) => c.toString(16).padStart(2, "0")).join("");
}
function applyTintToRgb(rgb, tint) {
  const m = rgb.match(/(\d+)/g);
  if (!m || m.length < 3) return rgb;
  const [r, g, b] = [+m[0], +m[1], +m[2]];
  const [nr, ng, nb] = applyTint(r, g, b, tint);
  if (m.length >= 4) {
    return `rgba(${nr},${ng},${nb},${m[3].includes(".") ? m[3] : +m[3]})`;
  }
  return `rgb(${nr},${ng},${nb})`;
}
function getSeasonalPoolOverrides(week, rotation = 0, level = 50) {
  const { from, to, t } = getTransitionBlend(week, rotation);
  if (from === to) {
    const remove2 = SEASON_REMOVE[from];
    const additions = SEASON_ADD[from];
    const add2 = getLevelAdditions(additions, level);
    return { add: add2, remove: remove2 };
  }
  const remove = /* @__PURE__ */ new Set();
  for (const r of SEASON_REMOVE[from]) remove.add(r);
  for (const r of SEASON_REMOVE[to]) remove.add(r);
  const fromAdd = getLevelAdditions(SEASON_ADD[from], level);
  const toAdd = getLevelAdditions(SEASON_ADD[to], level);
  const fromCount = Math.round(fromAdd.length * (1 - t));
  const toCount = Math.round(toAdd.length * t);
  const add = [...fromAdd.slice(0, fromCount), ...toAdd.slice(0, toCount)];
  return { add, remove };
}
function getLevelAdditions(additions, level) {
  const result = [...additions.general];
  if (level >= 31 && level <= 65) {
    result.push(...additions.nature);
  } else if (level >= 66) {
    result.push(...additions.settlement);
  }
  return result;
}
var ZONE_BOUNDS, SEASON_TINTS, SEASON_REMOVE, SEASON_ADD;
var init_seasons = __esm({
  "src/themes/terrain/seasons.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    ZONE_BOUNDS = [
      { zone: 0, start: 0, end: 4 },
      // Winter peak
      { zone: 1, start: 5, end: 13 },
      // Winter -> Spring (longer transition)
      { zone: 2, start: 14, end: 18 },
      // Spring peak
      { zone: 3, start: 19, end: 27 },
      // Spring -> Summer (longer transition)
      { zone: 4, start: 28, end: 32 },
      // Summer peak
      { zone: 5, start: 33, end: 40 },
      // Summer -> Autumn (longer transition)
      { zone: 6, start: 41, end: 45 },
      // Autumn peak
      { zone: 7, start: 46, end: 51 }
      // Autumn -> Winter (longer transition)
    ];
    SEASON_TINTS = {
      winter: {
        colorShift: 0.35,
        colorTarget: [238, 242, 248],
        // #eef2f8 — snowy white
        greenMul: 0.6,
        warmth: -5,
        snowCoverage: 0.35,
        saturation: 0.65
      },
      spring: {
        colorShift: 0.05,
        colorTarget: [255, 220, 230],
        // pink warmth
        greenMul: 1.15,
        warmth: 5,
        snowCoverage: 0,
        saturation: 1.15
      },
      summer: {
        colorShift: 0,
        colorTarget: [0, 0, 0],
        greenMul: 1,
        warmth: 0,
        snowCoverage: 0,
        saturation: 1
      },
      autumn: {
        colorShift: 0.12,
        colorTarget: [210, 170, 60],
        // golden-yellow with hint of orange
        greenMul: 0.65,
        // some green remains (late summer trees)
        warmth: 15,
        // moderate warmth (yellow-orange, not red)
        snowCoverage: 0,
        saturation: 1.12
        // vivid but natural
      }
    };
    SEASON_REMOVE = {
      winter: /* @__PURE__ */ new Set([
        "flower",
        "butterfly",
        "wildflowerPatch",
        "tulip",
        "tulipField",
        "cherryBlossom",
        "cherryBlossomSmall",
        "cherryPetals",
        "crocus",
        "lamb",
        "sprout",
        "gardenBed",
        "birdhouse",
        "nest",
        "parasol",
        "beachTowel",
        "surfboard",
        "swimmingPool",
        "sunflower",
        "watermelon",
        "hammock",
        "iceCreamCart",
        "lemonade",
        "sprinkler",
        "fireflies",
        "sandcastleSummer"
      ]),
      spring: /* @__PURE__ */ new Set([
        "snowPine",
        "snowDeciduous",
        "snowman",
        "snowdrift",
        "igloo",
        "frozenPond",
        "icicle",
        "sled",
        "snowCoveredRock",
        "bareBush",
        "winterBird",
        "firewood",
        "parasol",
        "beachTowel",
        "surfboard",
        "swimmingPool",
        "iceCreamCart",
        "lemonade",
        "sprinkler",
        "sandcastleSummer"
      ]),
      summer: /* @__PURE__ */ new Set([
        "snowPine",
        "snowDeciduous",
        "snowman",
        "snowdrift",
        "igloo",
        "frozenPond",
        "icicle",
        "sled",
        "snowCoveredRock",
        "bareBush",
        "winterBird",
        "firewood",
        "autumnMaple",
        "autumnOak",
        "autumnBirch",
        "autumnGinkgo",
        "fallenLeaves",
        "leafSwirl",
        "cornStalk",
        "scarecrowAutumn",
        "harvestBasket",
        "hotDrink",
        "autumnWreath"
      ]),
      autumn: /* @__PURE__ */ new Set([
        "snowPine",
        "snowDeciduous",
        "snowman",
        "snowdrift",
        "igloo",
        "frozenPond",
        "icicle",
        "sled",
        "snowCoveredRock",
        "bareBush",
        "winterBird",
        "firewood",
        "flower",
        "butterfly",
        "wildflowerPatch",
        "tulip",
        "tulipField",
        "cherryBlossom",
        "cherryBlossomSmall",
        "cherryPetals",
        "crocus",
        "lamb",
        "sprout",
        "gardenBed",
        "birdhouse",
        "nest",
        "parasol",
        "beachTowel",
        "surfboard",
        "swimmingPool",
        "sunflower",
        "watermelon",
        "hammock",
        "iceCreamCart",
        "lemonade",
        "sprinkler",
        "fireflies",
        "sandcastleSummer"
      ])
    };
    SEASON_ADD = {
      winter: {
        nature: ["snowPine", "snowDeciduous", "snowCoveredRock", "bareBush", "winterBird", "snowdrift"],
        settlement: [
          "snowman",
          "igloo",
          "sled",
          "firewood",
          "icicle",
          "snowdrift",
          "houseWinter",
          "houseBWinter",
          "barnWinter",
          "churchWinter",
          "christmasTree",
          "winterLantern",
          "frozenFountain"
        ],
        general: ["snowdrift", "snowCoveredRock", "bareBush", "icicle"]
      },
      spring: {
        nature: [
          "cherryBlossom",
          "cherryBlossomSmall",
          "cherryBlossomFull",
          "cherryBlossomBranch",
          "peachBlossom",
          "tulip",
          "tulipField",
          "sprout",
          "crocus",
          "lamb",
          "robinBird"
        ],
        settlement: [
          "cherryBlossom",
          "cherryBlossomFull",
          "tulipField",
          "nest",
          "birdhouse",
          "gardenBed",
          "rainPuddle",
          "cherryPetals",
          "flowerBed",
          "wateringCan",
          "umbrella",
          "butterflyGarden"
        ],
        general: ["sprout", "crocus", "cherryPetals", "rainPuddle", "seedling"]
      },
      summer: {
        nature: ["sunflower", "fireflies", "watermelon"],
        settlement: [
          "parasol",
          "beachTowel",
          "hammock",
          "iceCreamCart",
          "lemonade",
          "sprinkler",
          "swimmingPool"
        ],
        general: ["sunflower", "watermelon"]
      },
      autumn: {
        nature: [
          "autumnMaple",
          "autumnMaple",
          "autumnOak",
          "autumnOak",
          "autumnBirch",
          "autumnGinkgo",
          "fallenLeaves",
          "fallenLeaves",
          "fallenLeaves",
          "leafSwirl",
          "leafSwirl",
          "acorn",
          "pumpkinPatch"
        ],
        settlement: [
          "cornStalk",
          "scarecrowAutumn",
          "harvestBasket",
          "hotDrink",
          "autumnWreath",
          "fallenLeaves",
          "fallenLeaves",
          "hayMaze",
          "appleBasket",
          "rake",
          "autumnMaple"
        ],
        general: ["fallenLeaves", "fallenLeaves", "leafSwirl", "leafSwirl", "acorn", "pumpkinPatch"]
      }
    };
  }
});

// src/themes/terrain/palette/anchors.ts
var DARK_COLOR_ANCHORS, DARK_HEIGHT_ANCHORS, LIGHT_COLOR_ANCHORS;
var init_anchors = __esm({
  "src/themes/terrain/palette/anchors.ts"() {
    "use strict";
    init_cjs_shims();
    DARK_COLOR_ANCHORS = [
      { level: 0, rgb: [160, 130, 90] },
      // Desert sand
      { level: 4, rgb: [140, 120, 85] },
      // Dry earth
      { level: 8, rgb: [100, 115, 100] },
      // Scrubland
      { level: 12, rgb: [40, 80, 130] },
      // Shallow water / oasis
      { level: 18, rgb: [30, 70, 120] },
      // Deeper water
      { level: 24, rgb: [80, 130, 95] },
      // Wetland shore
      { level: 30, rgb: [130, 160, 90] },
      // Grassland
      { level: 40, rgb: [90, 145, 60] },
      // Lush grass
      { level: 52, rgb: [55, 120, 42] },
      // Forest
      { level: 65, rgb: [45, 105, 38] },
      // Dense forest
      { level: 75, rgb: [90, 140, 55] },
      // Rich green farmland
      { level: 85, rgb: [80, 125, 50] },
      // Village green
      { level: 93, rgb: [70, 110, 52] },
      // Town with parks
      { level: 99, rgb: [65, 100, 55] }
      // Lush city
    ];
    DARK_HEIGHT_ANCHORS = [
      { level: 0, height: 0 },
      { level: 8, height: 0 },
      { level: 12, height: 0 },
      // Water: flat
      { level: 18, height: 0 },
      { level: 24, height: 1 },
      { level: 30, height: 3 },
      { level: 40, height: 5 },
      { level: 52, height: 8 },
      { level: 65, height: 11 },
      { level: 75, height: 14 },
      { level: 85, height: 18 },
      { level: 93, height: 21 },
      { level: 99, height: 24 }
    ];
    LIGHT_COLOR_ANCHORS = [
      { level: 0, rgb: [195, 170, 130] },
      // Desert sand
      { level: 4, rgb: [180, 158, 120] },
      // Dry earth
      { level: 8, rgb: [145, 155, 135] },
      // Scrubland
      { level: 12, rgb: [100, 160, 210] },
      // Shallow water / oasis
      { level: 18, rgb: [85, 148, 200] },
      // Deeper water
      { level: 24, rgb: [120, 168, 140] },
      // Wetland shore
      { level: 30, rgb: [160, 195, 115] },
      // Grassland
      { level: 40, rgb: [115, 175, 80] },
      // Lush grass
      { level: 52, rgb: [75, 150, 58] },
      // Forest
      { level: 65, rgb: [65, 135, 52] },
      // Dense forest
      { level: 75, rgb: [115, 170, 75] },
      // Rich green farmland
      { level: 85, rgb: [100, 155, 68] },
      // Village green
      { level: 93, rgb: [90, 140, 65] },
      // Town with parks
      { level: 99, rgb: [80, 128, 62] }
      // Lush city
    ];
  }
});

// src/themes/terrain/palette/dark-assets.ts
var DARK_ASSETS;
var init_dark_assets = __esm({
  "src/themes/terrain/palette/dark-assets.ts"() {
    "use strict";
    init_cjs_shims();
    DARK_ASSETS = {
      trunk: "#6b4226",
      pine: "#2a6e1e",
      leaf: "#3d8c2a",
      bush: "#357a22",
      roofA: "#c45435",
      roofB: "#d4924a",
      wall: "#d4c8a0",
      wallShade: "#b0a078",
      church: "#e0d8c0",
      fence: "#9e8a60",
      wheat: "#d4b840",
      sheep: "#e8e8e0",
      sheepHead: "#333",
      cow: "#8b5e3c",
      cowSpot: "#f5f0e0",
      chicken: "#d4a030",
      whale: "#4a7a9e",
      whaleBelly: "#8ab4c8",
      boat: "#8b6840",
      sail: "#e8e0d0",
      fish: "#70b0c8",
      flag: "#cc3333",
      windmill: "#c8b888",
      windBlade: "#d8d0b8",
      well: "#7a6a4a",
      chimney: "#8a6a4a",
      path: "#a09068",
      water: "#3a6a9e",
      waterLight: "#5a90be",
      deer: "#8a6030",
      horse: "#6e4422",
      flower: "#e06080",
      flowerCenter: "#f0d040",
      mushroom: "#e8dcc8",
      mushroomCap: "#c44030",
      rock: "#808080",
      boulder: "#6a6a6a",
      palm: "#4a8828",
      willow: "#558838",
      seagull: "#e0e0e0",
      dock: "#7a6040",
      tent: "#c8b888",
      tentStripe: "#cc4444",
      hut: "#a08860",
      market: "#d8c898",
      marketAwning: "#cc5533",
      inn: "#c8a878",
      innSign: "#d4a040",
      blacksmith: "#555555",
      anvil: "#444444",
      castle: "#a0a0a0",
      castleRoof: "#606080",
      tower: "#909090",
      bridge: "#8a7a5a",
      cart: "#8a6a40",
      barrel: "#7a5a30",
      torch: "#6a5030",
      torchFlame: "#ff9922",
      cobble: "#888878",
      smoke: "rgba(180,180,180,0.4)",
      bird: "#444444",
      scarecrow: "#8a7040",
      scarecrowHat: "#5a4020",
      stump: "#6b4a26",
      riverOverlay: "rgba(35,85,160,0.60)",
      pondOverlay: "rgba(25,75,150,0.65)",
      reeds: "#6a8838",
      fountain: "#909090",
      fountainWater: "#70a8d0",
      canal: "#7a7a6a",
      gardenTree: "#4a9a3a",
      ricePaddy: "#8aaa48",
      ricePaddyWater: "#4a88b0",
      // New 118-type expansion colors
      jellyfish: "#9a70c0",
      coral: "#d06858",
      turtle: "#5a8848",
      buoy: "#cc4444",
      lighthouse: "#d8d0b8",
      crab: "#c06030",
      driftwood: "#8a7050",
      sandcastle: "#d8c890",
      tidePools: "#5a90b0",
      heron: "#a0a8b0",
      shellfish: "#c0a880",
      cattail: "#6a8838",
      frog: "#4a8830",
      lily: "#e088a0",
      rabbit: "#b0a090",
      fox: "#c06a28",
      butterfly: "#d070a0",
      butterflyWing: "#e0a040",
      beehive: "#c0a040",
      wildflower: "#d060d0",
      tallGrass: "#5a9838",
      birchBark: "#e0d8c8",
      haybale: "#c0a848",
      owl: "#8a7050",
      squirrel: "#a06030",
      moss: "#4a7a30",
      fern: "#3a8828",
      deadTree: "#6a5a40",
      log: "#7a5a30",
      berryBush: "#3a7828",
      berry: "#cc3030",
      spiderWeb: "rgba(200,200,200,0.5)",
      silo: "#a0a0a0",
      pig: "#e0a8a0",
      trough: "#7a6a50",
      haystack: "#c8a838",
      orchard: "#4a8828",
      orchardFruit: "#cc4430",
      beeFarm: "#c8b060",
      pumpkin: "#d07020",
      tavern: "#a08860",
      tavernSign: "#8a6830",
      bakery: "#c8a878",
      stable: "#8a7050",
      gardenFence: "#e0d8c0",
      laundry: "#e0d8e8",
      doghouse: "#8a6030",
      shrine: "#a0a0a8",
      wagon: "#8a6840",
      cathedral: "#c0b8a8",
      cathedralWindow: "#4080c0",
      library: "#b0a088",
      clocktower: "#a0a0a0",
      clockFace: "#e8e0c8",
      statue: "#909098",
      parkBench: "#6a5a40",
      warehouse: "#8a8078",
      gatehouse: "#a09888",
      manor: "#c8b898",
      manorGarden: "#4a8838",
      signpost: "#7a6040",
      lantern: "#6a5a40",
      lanternGlow: "#ffc840",
      woodpile: "#7a5a30",
      puddle: "#5a88b8",
      campfire: "#6a5030",
      campfireFlame: "#ff6622",
      // Seasonal: Winter
      snowCap: "#e8eef5",
      snowGround: "#d8e2ee",
      ice: "#a0c0e0",
      icicle: "#b0d4f0",
      frozenWater: "#6090b8",
      igloo: "#dce8f2",
      sledWood: "#8a5a30",
      sledRunner: "#607080",
      scarfRed: "#cc3030",
      snowmanCoal: "#2a2a2a",
      snowmanCarrot: "#e07020",
      winterBirdRed: "#cc3030",
      winterBirdBrown: "#8a6040",
      firewoodLog: "#6a4020",
      bareBranch: "#6a5a4a",
      frostWhite: "#e0e8f0",
      // Seasonal: Spring
      cherryPetalPink: "#f5a0b8",
      cherryPetalWhite: "#f8e0e8",
      cherryTrunk: "#6a4030",
      cherryBranch: "#7a5040",
      tulipRed: "#e04050",
      tulipYellow: "#f0d040",
      tulipPurple: "#9050c0",
      tulipStem: "#5a9a40",
      sproutGreen: "#80d050",
      nestBrown: "#7a5530",
      eggBlue: "#a8d8e8",
      eggWhite: "#f0ece0",
      crocusPurple: "#8040b0",
      crocusYellow: "#e8c830",
      lambWool: "#f0ece5",
      birdhouseWood: "#a07040",
      gardenSoil: "#5a4030",
      // Seasonal: Summer
      parasolRed: "#e04040",
      parasolBlue: "#4080d0",
      parasolYellow: "#e8c820",
      parasolStripe: "#ffffff",
      beachTowelA: "#e05050",
      beachTowelB: "#4090d0",
      sandcastleWall: "#d8c090",
      surfboardBody: "#e0e0e0",
      surfboardStripe: "#e04040",
      iceCreamCart: "#f0e8d0",
      iceCreamUmbrella: "#e04040",
      hammockFabric: "#d09050",
      sunflowerPetal: "#f0c820",
      sunflowerCenter: "#5a3a20",
      watermelonRind: "#40a040",
      watermelonFlesh: "#e04040",
      watermelonSeed: "#2a2a2a",
      lemonadeStand: "#f0d880",
      sprinklerMetal: "#8090a0",
      poolWater: "#60b8e0",
      poolEdge: "#c0c8d0",
      // Seasonal: Autumn
      mapleRed: "#c83020",
      mapleCrimson: "#a02020",
      mapleOrange: "#d07020",
      oakGold: "#c8a030",
      oakBrown: "#8a6030",
      birchYellow: "#d8c040",
      ginkgoYellow: "#d8c830",
      fallenLeafRed: "#c04030",
      fallenLeafOrange: "#d08030",
      fallenLeafGold: "#d0a030",
      fallenLeafBrown: "#8a5a30",
      acornBody: "#8a6030",
      acornCap: "#5a3820",
      cornStalkColor: "#c8a860",
      cornEar: "#d8c060",
      harvestApple: "#c83030",
      harvestGrape: "#6030a0",
      hotDrinkMug: "#c8a060",
      hotDrinkSteam: "#d0d8e0",
      wreathGreen: "#507038",
      wreathBerry: "#c03030",
      // Extended Seasonal: Autumn
      autumnGold: "#d4a84b",
      autumnBronze: "#b07830",
      autumnBurgundy: "#8b2040",
      autumnRust: "#c05530",
      autumnOlive: "#8b8b40",
      // Extended Seasonal: Spring
      blossomPink: "#ffb6c1",
      blossomWhite: "#fff0f5",
      peachPink: "#ffd5cc",
      // Extended Seasonal: Winter
      icicleBlue: "#d0e8f8",
      christmasRed: "#c41e3a",
      christmasGold: "#ffd700",
      christmasGreen: "#228b22",
      // Fruit Trees
      appleRed: "#c41e3a",
      oliveGreen: "#808060",
      oliveFruit: "#4a4a30",
      lemonYellow: "#fff44f",
      orangeFruit: "#ff8c00",
      pearGreen: "#d1e231",
      peachFruit: "#ffcba4",
      // Additional Livestock
      donkey: "#808080",
      goat: "#e8e0d0",
      goatHorn: "#b0a090",
      // Enhanced asset detail colors
      shadow: "#1a1a2e",
      bushDark: "#2d5a3d",
      leafLight: "#6db86d",
      flowerAlt: "#e8a0c0",
      // Epic building colors
      epicGold: "#ffd700",
      epicMarble: "#d8d0c0",
      epicJade: "#2e8b57",
      epicCrystal: "#7fdbff",
      epicMagic: "#9b59b6",
      epicPortal: "#00ced1"
    };
  }
});

// src/themes/terrain/palette/light-assets.ts
var LIGHT_ASSETS;
var init_light_assets = __esm({
  "src/themes/terrain/palette/light-assets.ts"() {
    "use strict";
    init_cjs_shims();
    LIGHT_ASSETS = {
      trunk: "#7a5030",
      pine: "#358025",
      leaf: "#4a9e35",
      bush: "#40882a",
      roofA: "#d05a3a",
      roofB: "#daa055",
      wall: "#f0e8d0",
      wallShade: "#d0c498",
      church: "#f0e8d8",
      fence: "#b09a68",
      wheat: "#dac040",
      sheep: "#f5f5f0",
      sheepHead: "#444",
      cow: "#9a6e45",
      cowSpot: "#fff",
      chicken: "#daa835",
      whale: "#4580aa",
      whaleBelly: "#90bcd0",
      boat: "#9a7848",
      sail: "#fff",
      fish: "#60a0b8",
      flag: "#dd3838",
      windmill: "#d8c898",
      windBlade: "#eee",
      well: "#8a7a55",
      chimney: "#9a7a55",
      path: "#b8a078",
      water: "#4578aa",
      waterLight: "#65a0cc",
      deer: "#9a7038",
      horse: "#7e5430",
      flower: "#f07090",
      flowerCenter: "#ffe050",
      mushroom: "#f0e8d8",
      mushroomCap: "#d05040",
      rock: "#909090",
      boulder: "#7a7a7a",
      palm: "#55a030",
      willow: "#609840",
      seagull: "#f0f0f0",
      dock: "#8a7050",
      tent: "#d8c898",
      tentStripe: "#dd5555",
      hut: "#b09870",
      market: "#e8d8a8",
      marketAwning: "#dd6644",
      inn: "#d8b888",
      innSign: "#e4b050",
      blacksmith: "#666666",
      anvil: "#555555",
      castle: "#b0b0b0",
      castleRoof: "#707090",
      tower: "#a0a0a0",
      bridge: "#9a8a6a",
      cart: "#9a7a50",
      barrel: "#8a6a38",
      torch: "#7a6038",
      torchFlame: "#ffaa33",
      cobble: "#989888",
      smoke: "rgba(160,160,160,0.35)",
      bird: "#555555",
      scarecrow: "#9a8050",
      scarecrowHat: "#6a5030",
      stump: "#7a5a30",
      riverOverlay: "rgba(60,130,210,0.55)",
      pondOverlay: "rgba(50,120,200,0.60)",
      reeds: "#7a9848",
      fountain: "#a0a0a0",
      fountainWater: "#80b8e0",
      canal: "#8a8a7a",
      gardenTree: "#55aa45",
      ricePaddy: "#9aba58",
      ricePaddyWater: "#5a98c0",
      // New 118-type expansion colors
      jellyfish: "#b080d8",
      coral: "#e07868",
      turtle: "#6a9858",
      buoy: "#dd5555",
      lighthouse: "#f0e8d8",
      crab: "#d07040",
      driftwood: "#9a8060",
      sandcastle: "#e8d8a0",
      tidePools: "#6aa0c0",
      heron: "#b0b8c0",
      shellfish: "#d0b890",
      cattail: "#7a9848",
      frog: "#5a9838",
      lily: "#f098b0",
      rabbit: "#c0b0a0",
      fox: "#d07a38",
      butterfly: "#e080b0",
      butterflyWing: "#f0b050",
      beehive: "#d0b050",
      wildflower: "#e070e0",
      tallGrass: "#6aa848",
      birchBark: "#f0e8d8",
      haybale: "#d0b858",
      owl: "#9a8060",
      squirrel: "#b07040",
      moss: "#5a8a38",
      fern: "#4a9838",
      deadTree: "#7a6a50",
      log: "#8a6a40",
      berryBush: "#4a8838",
      berry: "#dd4040",
      spiderWeb: "rgba(180,180,180,0.45)",
      silo: "#b0b0b0",
      pig: "#f0b8b0",
      trough: "#8a7a60",
      haystack: "#d8b848",
      orchard: "#55a038",
      orchardFruit: "#dd5540",
      beeFarm: "#d8c070",
      pumpkin: "#e08030",
      tavern: "#b09870",
      tavernSign: "#9a7838",
      bakery: "#d8b888",
      stable: "#9a8060",
      gardenFence: "#f0e8d0",
      laundry: "#f0e8f0",
      doghouse: "#9a7040",
      shrine: "#b0b0b8",
      wagon: "#9a7850",
      cathedral: "#d0c8b8",
      cathedralWindow: "#5090d0",
      library: "#c0b098",
      clocktower: "#b0b0b0",
      clockFace: "#f8f0d8",
      statue: "#a0a0a8",
      parkBench: "#7a6a50",
      warehouse: "#9a9088",
      gatehouse: "#b0a898",
      manor: "#d8c8a8",
      manorGarden: "#55a048",
      signpost: "#8a7050",
      lantern: "#7a6a50",
      lanternGlow: "#ffd850",
      woodpile: "#8a6a40",
      puddle: "#6a98c8",
      campfire: "#7a6038",
      campfireFlame: "#ff7733",
      // Seasonal: Winter
      snowCap: "#f0f4f8",
      snowGround: "#e4ecf4",
      ice: "#b0d0e8",
      icicle: "#c0e0f8",
      frozenWater: "#70a0c8",
      igloo: "#e8f0f8",
      sledWood: "#9a6a38",
      sledRunner: "#708090",
      scarfRed: "#dd4040",
      snowmanCoal: "#333333",
      snowmanCarrot: "#f08030",
      winterBirdRed: "#dd4040",
      winterBirdBrown: "#9a7050",
      firewoodLog: "#7a5030",
      bareBranch: "#7a6a5a",
      frostWhite: "#eef4f8",
      // Seasonal: Spring
      cherryPetalPink: "#f8b0c8",
      cherryPetalWhite: "#fce8f0",
      cherryTrunk: "#7a5040",
      cherryBranch: "#8a6050",
      tulipRed: "#f05060",
      tulipYellow: "#f8e050",
      tulipPurple: "#a060d0",
      tulipStem: "#6aaa50",
      sproutGreen: "#90e060",
      nestBrown: "#8a6540",
      eggBlue: "#b8e8f0",
      eggWhite: "#f8f4e8",
      crocusPurple: "#9050c0",
      crocusYellow: "#f0d838",
      lambWool: "#f8f4ed",
      birdhouseWood: "#b08050",
      gardenSoil: "#6a5040",
      // Seasonal: Summer
      parasolRed: "#f05050",
      parasolBlue: "#5090e0",
      parasolYellow: "#f0d030",
      parasolStripe: "#ffffff",
      beachTowelA: "#f06060",
      beachTowelB: "#50a0e0",
      sandcastleWall: "#e8d0a0",
      surfboardBody: "#f0f0f0",
      surfboardStripe: "#f05050",
      iceCreamCart: "#f8f0e0",
      iceCreamUmbrella: "#f05050",
      hammockFabric: "#e0a060",
      sunflowerPetal: "#f8d030",
      sunflowerCenter: "#6a4a30",
      watermelonRind: "#50b050",
      watermelonFlesh: "#f05050",
      watermelonSeed: "#333333",
      lemonadeStand: "#f8e890",
      sprinklerMetal: "#90a0b0",
      poolWater: "#70c8f0",
      poolEdge: "#d0d8e0",
      // Seasonal: Autumn
      mapleRed: "#d84030",
      mapleCrimson: "#b03030",
      mapleOrange: "#e08030",
      oakGold: "#d8b040",
      oakBrown: "#9a7040",
      birchYellow: "#e8d050",
      ginkgoYellow: "#e8d840",
      fallenLeafRed: "#d05040",
      fallenLeafOrange: "#e09040",
      fallenLeafGold: "#e0b040",
      fallenLeafBrown: "#9a6a40",
      acornBody: "#9a7040",
      acornCap: "#6a4830",
      cornStalkColor: "#d8b870",
      cornEar: "#e8d070",
      harvestApple: "#d84040",
      harvestGrape: "#7040b0",
      hotDrinkMug: "#d8b070",
      hotDrinkSteam: "#e0e8f0",
      wreathGreen: "#608048",
      wreathBerry: "#d04040",
      // Extended Seasonal: Autumn
      autumnGold: "#e0b85c",
      autumnBronze: "#c08840",
      autumnBurgundy: "#9b3050",
      autumnRust: "#d06540",
      autumnOlive: "#9b9b50",
      // Extended Seasonal: Spring
      blossomPink: "#ffc6d1",
      blossomWhite: "#fff8fb",
      peachPink: "#ffe5dc",
      // Extended Seasonal: Winter
      icicleBlue: "#e0f0ff",
      christmasRed: "#d42e4a",
      christmasGold: "#ffe720",
      christmasGreen: "#32a032",
      // Fruit Trees
      appleRed: "#d42e4a",
      oliveGreen: "#909070",
      oliveFruit: "#5a5a40",
      lemonYellow: "#ffff5f",
      orangeFruit: "#ff9c10",
      pearGreen: "#e1f241",
      peachFruit: "#ffdbb4",
      // Additional Livestock
      donkey: "#909090",
      goat: "#f0e8e0",
      goatHorn: "#c0b0a0",
      // Enhanced asset detail colors
      shadow: "#4a4a5e",
      bushDark: "#3d6a4d",
      leafLight: "#8dd88d",
      flowerAlt: "#f8b0d0",
      // Epic building colors
      epicGold: "#ffe740",
      epicMarble: "#f0e8d8",
      epicJade: "#3aad6a",
      epicCrystal: "#90e8ff",
      epicMagic: "#b070d0",
      epicPortal: "#20e8e0"
    };
  }
});

// src/themes/terrain/palette/interpolation.ts
function interpolateRGB(anchors, level) {
  const l = clamp(level, 0, 99);
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  if (lower.level === upper.level) return lower.rgb;
  const t = (l - lower.level) / (upper.level - lower.level);
  return [
    Math.round(lerp(lower.rgb[0], upper.rgb[0], t)),
    Math.round(lerp(lower.rgb[1], upper.rgb[1], t)),
    Math.round(lerp(lower.rgb[2], upper.rgb[2], t))
  ];
}
function interpolateHeight(anchors, level) {
  const l = clamp(level, 0, 99);
  let lower = anchors[0];
  let upper = anchors[anchors.length - 1];
  for (let i = 0; i < anchors.length - 1; i++) {
    if (l >= anchors[i].level && l <= anchors[i + 1].level) {
      lower = anchors[i];
      upper = anchors[i + 1];
      break;
    }
  }
  if (lower.level === upper.level) return lower.height;
  const t = (l - lower.level) / (upper.level - lower.level);
  return Math.round(lerp(lower.height, upper.height, t));
}
function darken(rgb, factor) {
  return `rgb(${Math.round(rgb[0] * factor)},${Math.round(rgb[1] * factor)},${Math.round(rgb[2] * factor)})`;
}
function rgbToHex(rgb) {
  return "#" + rgb.map((c) => c.toString(16).padStart(2, "0")).join("");
}
function makeElevation(rgb) {
  return {
    top: rgbToHex(rgb),
    left: darken(rgb, 0.75),
    right: darken(rgb, 0.6)
  };
}
var init_interpolation = __esm({
  "src/themes/terrain/palette/interpolation.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
  }
});

// src/themes/terrain/palette/factory.ts
function elevationGetter(anchors, tint) {
  const elevations = Array.from({ length: 100 });
  return (level) => {
    const cached = Number.isInteger(level) ? elevations[level] : void 0;
    if (cached) return { ...cached };
    const rgb = interpolateRGB(anchors, level);
    const elevation = makeElevation(tint ? applyTint(...rgb, tint) : rgb);
    if (Number.isInteger(level) && level >= 0 && level < 100) elevations[level] = elevation;
    return { ...elevation };
  };
}
function tintAssetColors(assets, tint) {
  const result = { ...assets };
  const colors = /* @__PURE__ */ new Map();
  for (const key in result) {
    const value = result[key];
    const cached = colors.get(value);
    if (cached !== void 0) {
      result[key] = cached;
      continue;
    }
    const tinted = value.startsWith("#") && value.length === 7 ? applyTintToHex(value, tint) : value.startsWith("rgb") ? applyTintToRgb(value, tint) : value;
    colors.set(value, tinted);
    result[key] = tinted;
  }
  return result;
}
function createTerrainPalette100(mode) {
  const getElevation = elevationGetter(mode === "dark" ? DARK_COLOR_ANCHORS : LIGHT_COLOR_ANCHORS);
  const getHeight = (level) => interpolateHeight(DARK_HEIGHT_ANCHORS, level);
  return {
    getElevation,
    getHeight,
    elevations: SAMPLE_LEVELS.map(getElevation),
    heights: SAMPLE_LEVELS.map(getHeight),
    text: mode === "dark" ? { primary: "#e6edf3", secondary: "#8b949e", accent: "#58a6ff" } : { primary: "#1f2328", secondary: "#656d76", accent: "#0969da" },
    bg: { subtle: mode === "dark" ? "#161b22" : "#f6f8fa" },
    cloud: mode === "dark" ? { fill: "rgba(200,210,220,0.12)", stroke: "rgba(200,210,220,0.06)", opacity: 0.8 } : { fill: "rgba(190,205,220,0.35)", stroke: "rgba(160,175,195,0.30)", opacity: 0.85 },
    assets: mode === "dark" ? DARK_ASSETS : LIGHT_ASSETS
  };
}
function createSeasonalPalette100(mode, tint, base) {
  if (tint.colorShift === 0 && tint.warmth === 0 && tint.snowCoverage === 0 && tint.greenMul === 1 && tint.saturation === 1)
    return base;
  const getElevation = elevationGetter(
    mode === "dark" ? DARK_COLOR_ANCHORS : LIGHT_COLOR_ANCHORS,
    tint
  );
  return {
    ...base,
    getElevation,
    elevations: SAMPLE_LEVELS.map(getElevation),
    assets: tintAssetColors(base.assets, tint)
  };
}
var SAMPLE_LEVELS;
var init_factory = __esm({
  "src/themes/terrain/palette/factory.ts"() {
    "use strict";
    init_cjs_shims();
    init_seasons();
    init_anchors();
    init_dark_assets();
    init_light_assets();
    init_interpolation();
    SAMPLE_LEVELS = [0, 5, 12, 25, 40, 55, 70, 82, 92, 99];
  }
});

// src/themes/terrain/palette/cache.ts
function copyPalette(palette, assets = { ...palette.assets }) {
  return {
    ...palette,
    elevations: palette.elevations.map((elevation) => ({ ...elevation })),
    heights: [...palette.heights],
    text: { ...palette.text },
    bg: { ...palette.bg },
    cloud: { ...palette.cloud },
    assets
  };
}
function getTerrainPalette100(mode) {
  return copyPalette(basePalettes[mode]);
}
function getSeasonalPalette100(mode, week, rotation = 0) {
  const seasonalWeek = clamp((week + rotation) % 52, 0, 51);
  if (!Number.isInteger(seasonalWeek)) {
    const base = basePalettes[mode];
    const palette2 = createSeasonalPalette100(mode, getSeasonalTint(week, rotation), base);
    return copyPalette(palette2, palette2 === base ? { ...palette2.assets } : palette2.assets);
  }
  const cached = seasonalPalettes[mode][seasonalWeek];
  if (cached) return copyPalette(cached);
  const palette = createSeasonalPalette100(
    mode,
    getSeasonalTint(week, rotation),
    basePalettes[mode]
  );
  seasonalPalettes[mode][seasonalWeek] = palette;
  return copyPalette(palette);
}
var basePalettes, seasonalPalettes;
var init_cache = __esm({
  "src/themes/terrain/palette/cache.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    init_seasons();
    init_factory();
    basePalettes = {
      dark: createTerrainPalette100("dark"),
      light: createTerrainPalette100("light")
    };
    seasonalPalettes = {
      dark: Array.from({ length: 52 }),
      light: Array.from({ length: 52 })
    };
  }
});

// src/themes/terrain/palette.ts
var init_palette = __esm({
  "src/themes/terrain/palette.ts"() {
    "use strict";
    init_cjs_shims();
    init_cache();
    init_cache();
  }
});

// src/themes/terrain/scene/season.ts
function dateSeasonPosition(date, hemisphere) {
  if (!date) return hemisphere === "south" ? 26 : 0;
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  const reference = new Date(timestamp);
  reference.setUTCMonth(11, 1);
  if (timestamp < reference.getTime()) reference.setUTCFullYear(reference.getUTCFullYear() - 1);
  return (Math.floor((timestamp - reference.getTime()) / 6048e5) + (hemisphere === "south" ? 26 : 0)) % 52;
}
function dateSeasonZone(date, hemisphere) {
  return getSeasonZone(0, dateSeasonPosition(date, hemisphere));
}
var init_season = __esm({
  "src/themes/terrain/scene/season.ts"() {
    "use strict";
    init_cjs_shims();
    init_seasons();
  }
});

// src/themes/terrain/scene/projection.ts
function toIsoCells(cells, palette, originX, originY) {
  const dates = /* @__PURE__ */ new Set();
  for (const cell of cells) {
    if (dates.has(cell.date))
      throw new InputValidationError([
        { path: "cells", message: `Duplicate contribution date: "${cell.date}"` }
      ]);
    dates.add(cell.date);
  }
  const calendarCells = cells.map((cell) => ({
    cell,
    day: getContributionDayOfWeek(cell.date),
    timestamp: Date.parse(cell.date)
  }));
  const firstSunday = calendarCells.reduce(
    (first, { timestamp, day }) => Math.min(first, timestamp - day * DAY_MS3),
    Infinity
  );
  const isoCells = calendarCells.map(({ cell, day, timestamp }) => {
    const week = cell.week ?? Math.floor((timestamp - firstSunday) / (7 * DAY_MS3));
    return {
      week,
      day,
      date: cell.date,
      count: cell.count,
      absoluteWeek: Math.floor((timestamp - day * DAY_MS3 - Date.UTC(1970, 0, 4)) / (7 * DAY_MS3)),
      level100: cell.level100,
      height: palette.getHeight(cell.level100),
      isoX: originX + (week - day) * THW,
      isoY: originY + (week + day) * THH,
      colors: palette.getElevation(cell.level100)
    };
  });
  isoCells.sort((a, b) => {
    const sumA = a.week + a.day;
    const sumB = b.week + b.day;
    if (sumA !== sumB) return sumA - sumB;
    return a.week - b.week;
  });
  return isoCells;
}
var THW, THH, DAY_MS3;
var init_projection = __esm({
  "src/themes/terrain/scene/projection.ts"() {
    "use strict";
    init_cjs_shims();
    init_errors();
    init_calendar();
    THW = 8;
    THH = 3.5;
    DAY_MS3 = 864e5;
  }
});

// src/themes/terrain/scene/block-shape.ts
function renderBlock(cell, isWater = false) {
  const { isoX: cx, isoY: cy, height: h, colors } = cell;
  if (h === 0) {
    const topPoints2 = [
      `${svgNumber(cx)},${svgNumber(cy - THH)}`,
      `${svgNumber(cx + THW)},${svgNumber(cy)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH)}`,
      `${svgNumber(cx - THW)},${svgNumber(cy)}`
    ].join(" ");
    if (isWater) {
      const inset = 1.5;
      const innerPoints = [
        `${svgNumber(cx)},${svgNumber(cy - THH + inset)}`,
        `${svgNumber(cx + THW - inset * 1.5)},${svgNumber(cy)}`,
        `${svgNumber(cx)},${svgNumber(cy + THH - inset)}`,
        `${svgNumber(cx - THW + inset * 1.5)},${svgNumber(cy)}`
      ].join(" ");
      return `<polygon points="${topPoints2}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/><polygon points="${innerPoints}" fill="${colors.top}" opacity="0.3" style="filter:brightness(1.3)"/><ellipse cx="${svgNumber(cx + 1)}" cy="${svgNumber(cy - 0.5)}" rx="1.5" ry="0.6" fill="#fff" opacity="0.15"/>`;
    }
    return `<polygon points="${topPoints2}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`;
  }
  const parts = [];
  const leftPoints = [
    `${svgNumber(cx - THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
    `${svgNumber(cx - THW)},${svgNumber(cy + h)}`
  ].join(" ");
  parts.push(`<polygon points="${leftPoints}" fill="${colors.left}"/>`);
  if (isWater && h > 0) {
    const midY = cy + THH + h * 0.5;
    const leftGradPoints = [
      `${svgNumber(cx - THW)},${svgNumber(cy + h * 0.5)}`,
      `${svgNumber(cx)},${svgNumber(midY)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
      `${svgNumber(cx - THW)},${svgNumber(cy + h)}`
    ].join(" ");
    parts.push(`<polygon points="${leftGradPoints}" fill="#1a3a6a" opacity="0.15"/>`);
  }
  const rightPoints = [
    `${svgNumber(cx + THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
    `${svgNumber(cx + THW)},${svgNumber(cy + h)}`
  ].join(" ");
  parts.push(`<polygon points="${rightPoints}" fill="${colors.right}"/>`);
  if (isWater && h > 0) {
    const midY = cy + THH + h * 0.5;
    const rightGradPoints = [
      `${svgNumber(cx + THW)},${svgNumber(cy + h * 0.5)}`,
      `${svgNumber(cx)},${svgNumber(midY)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH + h)}`,
      `${svgNumber(cx + THW)},${svgNumber(cy + h)}`
    ].join(" ");
    parts.push(`<polygon points="${rightGradPoints}" fill="#1a3a6a" opacity="0.12"/>`);
  }
  const topPoints = [
    `${svgNumber(cx)},${svgNumber(cy - THH)}`,
    `${svgNumber(cx + THW)},${svgNumber(cy)}`,
    `${svgNumber(cx)},${svgNumber(cy + THH)}`,
    `${svgNumber(cx - THW)},${svgNumber(cy)}`
  ].join(" ");
  if (isWater) {
    const inset = 1.5;
    const innerPoints = [
      `${svgNumber(cx)},${svgNumber(cy - THH + inset)}`,
      `${svgNumber(cx + THW - inset * 1.5)},${svgNumber(cy)}`,
      `${svgNumber(cx)},${svgNumber(cy + THH - inset)}`,
      `${svgNumber(cx - THW + inset * 1.5)},${svgNumber(cy)}`
    ].join(" ");
    parts.push(
      `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`
    );
    parts.push(
      `<polygon points="${innerPoints}" fill="${colors.top}" opacity="0.3" style="filter:brightness(1.3)"/>`
    );
    parts.push(
      `<ellipse cx="${svgNumber(cx + 1)}" cy="${svgNumber(cy - 0.5)}" rx="1.5" ry="0.6" fill="#fff" opacity="0.15"/>`
    );
  } else {
    parts.push(
      `<polygon points="${topPoints}" fill="${colors.top}" stroke="${colors.left}" stroke-width="0.3"/>`
    );
  }
  return parts.join("");
}
var init_block_shape = __esm({
  "src/themes/terrain/scene/block-shape.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_projection();
  }
});

// src/themes/terrain/scene/block-colors.ts
function parseColor(color) {
  if (color.startsWith("#")) {
    const hex = color.slice(1);
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    ];
  }
  const m = color.match(/(\d+)/g);
  if (m && m.length >= 3) return [+m[0], +m[1], +m[2]];
  return [128, 128, 128];
}
function toHex(r, g, b) {
  return "#" + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, "0")).join("");
}
function toRgb(r, g, b) {
  return `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`;
}
function blendColorTowardWater(color, waterRgb, strength) {
  const [r, g, b] = parseColor(color);
  const nr = r + (waterRgb[0] - r) * strength;
  const ng = g + (waterRgb[1] - g) * strength;
  const nb = b + (waterRgb[2] - b) * strength;
  return color.startsWith("#") ? toHex(nr, ng, nb) : toRgb(nr, ng, nb);
}
function getWaterBlendStrength(level, isRiver) {
  if (isRiver) return 0.4;
  if (level <= 14) return 0.25;
  return 0.45;
}
function blendWithWater(colors, isDark, level, isRiver) {
  const waterRgb = isDark ? [40, 80, 140] : [70, 140, 200];
  const strength = level !== void 0 ? getWaterBlendStrength(level, !!isRiver) : 0.35;
  return {
    top: blendColorTowardWater(colors.top, waterRgb, strength),
    left: blendColorTowardWater(colors.left, waterRgb, strength),
    right: blendColorTowardWater(colors.right, waterRgb, strength)
  };
}
var init_block_colors = __esm({
  "src/themes/terrain/scene/block-colors.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/blocks.ts
function renderPreparedTerrainBlocks(isoCells, weekPalettes, seasonRotation, biomeMap, hemisphere) {
  const blocks = isoCells.map((cell) => {
    const palette = weekPalettes[Math.min(cell.week, weekPalettes.length - 1)];
    const zone = hemisphere && cell.date ? dateSeasonZone(cell.date, hemisphere) : getSeasonZone(cell.week, seasonRotation);
    const colors = palette.getElevation(cell.level100);
    const biome = biomeMap?.get(`${cell.week},${cell.day}`);
    const naturalWater = cell.level100 >= 9 && cell.level100 <= 22;
    const water = biome?.isRiver || biome?.isPond || naturalWater;
    let shadedColors = colors;
    let liquid = !!water;
    if (water && naturalWater && (zone === 0 || zone === 7 || zone === 1)) {
      shadedColors = {
        top: palette.assets.ice || colors.top,
        left: palette.assets.frozenWater || colors.left,
        right: palette.assets.frozenWater || colors.right
      };
      liquid = false;
    } else if (water) {
      shadedColors = blendWithWater(
        colors,
        palette.text.primary.startsWith("#e"),
        cell.level100,
        biome?.isRiver
      );
    }
    const shape = renderBlock({ ...cell, colors: shadedColors }, liquid);
    if (!cell.date) return shape;
    return `<g data-date="${escapeXml(cell.date)}" data-count="${cell.count ?? 0}" data-level="${cell.level100}"><title>${escapeXml(cell.date)}: ${cell.count ?? 0} contributions</title>${shape}</g>`;
  });
  return `<g class="terrain-blocks">${blocks.join("")}</g>`;
}
var init_blocks = __esm({
  "src/themes/terrain/blocks.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_seasons();
    init_season();
    init_projection();
    init_block_shape();
    init_block_colors();
    init_projection();
    init_projection();
  }
});

// src/themes/terrain/assets/natural-pools.ts
function getNaturalPool(level) {
  if (level <= 4)
    return { types: ["rock", "boulder", "stump", "deadTree", "puddle"], chance: 0.08 };
  if (level <= 8)
    return { types: ["rock", "boulder", "bush", "stump", "deadTree", "signpost"], chance: 0.13 };
  if (level <= 14)
    return {
      types: [
        "whale",
        "fish",
        "fishSchool",
        "boat",
        "seagull",
        "dock",
        "waves",
        "kelp",
        "coral",
        "jellyfish",
        "turtle",
        "crab",
        "buoy"
      ],
      chance: 0.21
    };
  if (level <= 22)
    return {
      types: [
        "fish",
        "fishSchool",
        "boat",
        "seagull",
        "waves",
        "dock",
        "kelp",
        "coral",
        "turtle",
        "sailboat",
        "lighthouse",
        "crab",
        "buoy"
      ],
      chance: 0.24
    };
  if (level <= 27)
    return {
      types: [
        "rock",
        "boulder",
        "flower",
        "bush",
        "bird",
        "driftwood",
        "sandcastle",
        "tidePools",
        "heron",
        "shellfish",
        "cattail",
        "frog",
        "lily"
      ],
      chance: 0.21
    };
  if (level <= 30)
    return {
      types: [
        "bush",
        "flower",
        "rock",
        "fence",
        "driftwood",
        "tidePools",
        "heron",
        "cattail",
        "frog",
        "lily",
        "puddle"
      ],
      chance: 0.24
    };
  if (level <= 36)
    return {
      types: [
        "bush",
        "flower",
        "mushroom",
        "deer",
        "bird",
        "rabbit",
        "fox",
        "butterfly",
        "wildflowerPatch",
        "tallGrass",
        "signpost",
        "puddle"
      ],
      chance: 0.29
    };
  if (level <= 42)
    return {
      types: [
        "pine",
        "deciduous",
        "bush",
        "mushroom",
        "flower",
        "deer",
        "rabbit",
        "fox",
        "butterfly",
        "beehive",
        "birch",
        "haybale",
        "tallGrass",
        "lantern"
      ],
      chance: 0.33
    };
  if (level <= 52)
    return {
      types: [
        "pine",
        "pine",
        "deciduous",
        "willow",
        "bird",
        "bush",
        "owl",
        "squirrel",
        "moss",
        "fern",
        "berryBush",
        "log",
        "woodpile"
      ],
      chance: 0.39
    };
  if (level <= 58)
    return {
      types: [
        "pine",
        "deciduous",
        "willow",
        "palm",
        "bird",
        "pine",
        "stump",
        "owl",
        "moss",
        "fern",
        "deadTree",
        "log",
        "spider",
        "campfire"
      ],
      chance: 0.42
    };
  if (level <= 65)
    return {
      types: [
        "deciduous",
        "willow",
        "pine",
        "palm",
        "bird",
        "mushroom",
        "squirrel",
        "berryBush",
        "fern",
        "moss",
        "log",
        "woodpile"
      ],
      chance: 0.36
    };
  return void 0;
}
var init_natural_pools = __esm({
  "src/themes/terrain/assets/natural-pools.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/settlement-pools.ts
function getSettlementPool(level) {
  if (level <= 70)
    return {
      types: [
        "wheat",
        "fence",
        "sheep",
        "goat",
        "chicken",
        "bush",
        "ricePaddy",
        "pumpkin",
        "orchard",
        "appleTree",
        "pearTree",
        "trough",
        "haystack",
        "signpost"
      ],
      chance: 0.39
    };
  if (level <= 75)
    return {
      types: [
        "wheat",
        "fence",
        "scarecrow",
        "cow",
        "cow",
        "sheep",
        "goat",
        "chicken",
        "horse",
        "donkey",
        "ricePaddy",
        "silo",
        "pigpen",
        "trough",
        "orchard",
        "appleTree",
        "lemonTree",
        "orangeTree",
        "beeFarm",
        "pumpkin"
      ],
      chance: 0.46
    };
  if (level <= 78)
    return {
      types: [
        "barn",
        "sheep",
        "goat",
        "cow",
        "cow",
        "horse",
        "horse",
        "donkey",
        "wheat",
        "fence",
        "chicken",
        "cart",
        "ricePaddy",
        "silo",
        "pigpen",
        "haystack",
        "orchard",
        "appleTree",
        "oliveTree",
        "lemonTree",
        "peachTree",
        "beeFarm",
        "haybale"
      ],
      chance: 0.5
    };
  if (level <= 84)
    return {
      types: [
        "tent",
        "hut",
        "house",
        "well",
        "fence",
        "sheep",
        "barrel",
        "tavern",
        "bakery",
        "stable",
        "garden",
        "doghouse",
        "shrine",
        "lantern",
        "woodpile"
      ],
      chance: 0.5
    };
  if (level <= 90)
    return {
      types: [
        "house",
        "houseB",
        "church",
        "windmill",
        "well",
        "barrel",
        "torch",
        "tavern",
        "bakery",
        "stable",
        "garden",
        "laundry",
        "wagon",
        "shrine",
        "lantern",
        "signpost"
      ],
      chance: 0.55
    };
  if (level <= 95)
    return {
      types: [
        "house",
        "houseB",
        "market",
        "inn",
        "windmill",
        "flag",
        "cobblePath",
        "torch",
        "gardenTree",
        "flower",
        "bush",
        "cathedral",
        "library",
        "clocktower",
        "statue",
        "park",
        "warehouse",
        "lantern"
      ],
      chance: 0.62
    };
  return {
    types: [
      "castle",
      "tower",
      "church",
      "market",
      "inn",
      "blacksmith",
      "bridge",
      "flag",
      "cobblePath",
      "gardenTree",
      "flower",
      "fountain",
      "cathedral",
      "library",
      "clocktower",
      "statue",
      "park",
      "gatehouse",
      "manor",
      "warehouse",
      "lantern"
    ],
    chance: 0.72
  };
}
var init_settlement_pools = __esm({
  "src/themes/terrain/assets/settlement-pools.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/level-pool.ts
function getEffectiveLevel(level100, density) {
  if (level100 === 0) return 0;
  return clamp(level100 + (density - 5) * 5, 1, 99);
}
function getLevelPool100(level) {
  return getNaturalPool(level) ?? getSettlementPool(level);
}
var init_level_pool = __esm({
  "src/themes/terrain/assets/level-pool.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    init_natural_pools();
    init_settlement_pools();
  }
});

// src/themes/terrain/assets/biome-pool.ts
function blendWithBiome(pool, ctx, level) {
  const types = [...pool.types];
  let chance = pool.chance;
  if (ctx.isRiver) {
    if (level >= 91) types.push("bridge", "canal");
    else if (level >= 66) types.push("watermill", "canal", "reeds", "heron");
    else if (level >= 31) types.push("reeds", "reeds", "willow", "frog", "heron", "cattail");
    else types.push("reeds", "pondLily", "lily", "frog");
    chance = Math.max(chance, 0.35);
  } else if (ctx.isPond) {
    if (level >= 79) types.push("fountain", "pondLily", "reeds", "lily");
    else types.push("pondLily", "pondLily", "reeds", "lily", "frog", "cattail");
    chance = Math.max(chance, 0.3);
  } else if (ctx.nearWater) {
    if (level >= 79) types.push("fountain", "gardenTree");
    else types.push("willow", "reeds", "bush", "driftwood", "heron");
    chance += 0.05;
  }
  if (ctx.forestDensity > 0.3) {
    const treesToAdd = ctx.forestDensity > 0.6 ? 3 : 1;
    for (let i = 0; i < treesToAdd; i++) {
      if (level >= 91) types.push("gardenTree", "flower");
      else if (level >= 79) types.push("gardenTree");
      else if (level >= 43) types.push("pine", "deciduous", "owl", "squirrel", "moss", "fern");
      else types.push("pine", "birch");
    }
    chance += ctx.forestDensity * 0.08;
  }
  if (level >= 96) {
    types.push("gardenTree", "fountain", "park");
  } else if (level >= 91) {
    types.push("gardenTree", "lantern");
  }
  return { types, chance: Math.min(chance, 0.65) };
}
var init_biome_pool = __esm({
  "src/themes/terrain/assets/biome-pool.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/style-pool.ts
function applyVillageStyle(pool, style) {
  if (style === "classic") return pool;
  const types = pool.types.map((type) => KOREAN_REPLACEMENTS[type] ?? type);
  if (types.includes("hanok") || types.includes("pavilion")) {
    if (!types.includes("stoneWall")) types.push("stoneWall");
    if (!types.includes("onggi")) types.push("onggi");
  }
  return { ...pool, types };
}
var KOREAN_REPLACEMENTS;
var init_style_pool = __esm({
  "src/themes/terrain/assets/style-pool.ts"() {
    "use strict";
    init_cjs_shims();
    KOREAN_REPLACEMENTS = {
      house: "hanok",
      houseB: "hanok",
      houseWinter: "hanok",
      houseBWinter: "hanok",
      hut: "hanok",
      tavern: "hanok",
      inn: "hanok",
      manor: "hanok",
      church: "pavilion",
      churchWinter: "pavilion",
      shrine: "pavilion",
      fence: "stoneWall",
      gatehouse: "stoneWall",
      barrel: "onggi",
      well: "onggi"
    };
  }
});

// src/themes/terrain/assets/date-seed.ts
function assetCellIdentity(cell) {
  return cell.date ?? `cell:${cell.week},${cell.day}`;
}
function assetDateSeed(seed, date, purpose) {
  return hash(`${seed}:${date}:${purpose}`);
}
function dateSeasonWeek(date, hemisphere) {
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  const value = new Date(timestamp);
  const winterYear = value.getUTCMonth() === 11 ? value.getUTCFullYear() : value.getUTCFullYear() - 1;
  const week = Math.floor((timestamp - Date.UTC(winterYear, 11, 1)) / (7 * 864e5));
  return (week + (hemisphere === "south" ? 26 : 0)) % 52;
}
var init_date_seed = __esm({
  "src/themes/terrain/assets/date-seed.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
  }
});

// src/core/animation.ts
function currentMotionContext() {
  return currentContext;
}
function withMotionContext(context, render) {
  const previous = currentContext;
  currentContext = context;
  try {
    return render();
  } finally {
    currentContext = previous;
  }
}
function motionMarkup(fragment) {
  return currentContext.mode === "full" ? fragment : "";
}
function motionId(localId) {
  if (!currentContext.namespace) return localId;
  const encode = (value) => Array.from(
    value,
    (character) => /^[A-Za-z0-9-]$/.test(character) ? character : `_${character.codePointAt(0)?.toString(16)}_`
  ).join("");
  return `m-${encode(currentContext.namespace)}--${encode(localId)}`;
}
var DEFAULT_MOTION, currentContext;
var init_animation = __esm({
  "src/core/animation.ts"() {
    "use strict";
    init_cjs_shims();
    DEFAULT_MOTION = { mode: "full", namespace: "" };
    currentContext = DEFAULT_MOTION;
  }
});

// src/themes/terrain/assets/renderers/water-whale.ts
function svgWhale(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.5" rx="3" ry="1.5" fill="${c.whale}" transform="rotate(-15)"/><ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${c.whaleBelly}" opacity="0.5"/><path d="M2.5,-1.5 Q4,-3 5,-3.5 M2.5,-1.5 Q4,-2 5,-1" stroke="${c.whale}" fill="none" stroke-width="0.8"/><ellipse cx="5" cy="-3.5" rx="1" ry="0.4" fill="${c.whale}"/><ellipse cx="5" cy="-1" rx="1" ry="0.4" fill="${c.whale}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="2.2" ry="1.3" fill="${c.whale}"/><ellipse cx="0" cy="-0.3" rx="1.5" ry="0.6" fill="${c.whaleBelly}" opacity="0.5"/><path d="M2,-0.8 Q3,-0.8 3.5,-1.8 M2,-0.8 Q3,-0.8 3.5,0.2" stroke="${c.whale}" fill="none" stroke-width="0.7"/><ellipse cx="3.5" cy="-1.8" rx="0.8" ry="0.3" fill="${c.whale}"/><ellipse cx="3.5" cy="0.2" rx="0.8" ry="0.3" fill="${c.whale}"/><circle cx="-1.2" cy="-1" r="0.3" fill="#fff"/><circle cx="-1.2" cy="-1" r="0.15" fill="#222"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.2" rx="3.5" ry="2" fill="${c.whale}"/><ellipse cx="0" cy="-0.5" rx="2.5" ry="1" fill="${c.whaleBelly}" opacity="0.5"/><path d="M3,-1.2 Q4.5,-1.2 5,-2.5 M3,-1.2 Q4.5,-1.2 5,0" stroke="${c.whale}" fill="none" stroke-width="1"/><ellipse cx="5" cy="-2.5" rx="1.2" ry="0.4" fill="${c.whale}"/><ellipse cx="5" cy="0" rx="1.2" ry="0.4" fill="${c.whale}"/><circle cx="-2" cy="-1.5" r="0.4" fill="#fff"/><circle cx="-2" cy="-1.5" r="0.2" fill="#222"/><line x1="-0.5" y1="-3.2" x2="-1.2" y2="-4.5" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/><line x1="-0.5" y1="-3.2" x2="-0.5" y2="-4.8" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/><line x1="-0.5" y1="-3.2" x2="0.2" y2="-4.5" stroke="${c.waterLight}" stroke-width="0.3" opacity="0.6"/></g>`;
}
function svgFish(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.5" rx="1.3" ry="0.5" fill="${c.fish}"/><polygon points="0.3,-0.5 1,-1.3 1,0.3" fill="${c.fish}"/><ellipse cx="1" cy="-1.5" rx="1.1" ry="0.4" fill="${c.fish}" opacity="0.8"/><polygon points="2.1,-1.5 2.6,-2.1 2.6,-0.9" fill="${c.fish}" opacity="0.8"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2.2" ry="0.9" fill="${c.fish}"/><polygon points="2.2,-1 3.2,-2.2 3.2,0.2" fill="${c.fish}"/><line x1="-0.5" y1="-0.3" x2="-0.5" y2="-1.7" stroke="${c.whaleBelly}" stroke-width="0.3" opacity="0.4"/><line x1="0.5" y1="-0.3" x2="0.5" y2="-1.7" stroke="${c.whaleBelly}" stroke-width="0.3" opacity="0.4"/><circle cx="-1.3" cy="-1.1" r="0.3" fill="#fff"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="1.8" ry="0.7" fill="${c.fish}"/><polygon points="1.8,-0.8 2.8,-2 2.8,0.4" fill="${c.fish}"/><circle cx="-1" cy="-0.9" r="0.25" fill="#fff"/></g>`;
}
function svgFishSchool(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.5" rx="1" ry="0.4" fill="${c.fish}" opacity="0.8"/><ellipse cx="1" cy="-1.2" rx="0.8" ry="0.35" fill="${c.fish}" opacity="0.7"/><ellipse cx="0.5" cy="0" rx="0.9" ry="0.4" fill="${c.fish}" opacity="0.6"/></g>`;
}
function svgBoat(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-3,0 -2,-1.5 3,-1.5 3.5,0" fill="${c.boat}"/><line x1="0" y1="-1.5" x2="0" y2="-6" stroke="${c.trunk}" stroke-width="0.4"/><polygon points="0,-5.5 0,-2 2.5,-2.5" fill="${c.sail}" opacity="0.9"/><polygon points="0,-5 0,-2.5 -2,-3" fill="${c.sail}" opacity="0.7"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 -1.5,-1 2.5,-1 3,0" fill="${c.boat}"/><line x1="2" y1="-1" x2="3.5" y2="-3" stroke="${c.trunk}" stroke-width="0.3"/><line x1="3.5" y1="-3" x2="4" y2="-1.5" stroke="${c.waterLight}" stroke-width="0.2" opacity="0.6"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-3,0 -2,-1.5 3,-1.5 3.5,0" fill="${c.boat}"/><line x1="0" y1="-1.5" x2="0" y2="-6" stroke="${c.trunk}" stroke-width="0.4"/><polygon points="0,-5.5 0,-2 2.5,-2.5" fill="${c.sail}" opacity="0.9"/></g>`;
}
function svgSeagull(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="1.2" ry="0.7" fill="${c.seagull}"/><circle cx="-0.8" cy="-1.5" r="0.4" fill="${c.seagull}"/><polygon points="-1.2,-1.4 -1.7,-1.3 -1.2,-1.2" fill="${c.wheat}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><g><path d="M-1.5,-3 Q-0.5,-4.5 0.5,-3" stroke="${c.seagull}" fill="none" stroke-width="0.5"/><path d="M1,-4.5 Q2,-5.5 3,-4.5" stroke="${c.seagull}" fill="none" stroke-width="0.4" opacity="0.7"/>` + motionMarkup(
      `<animateMotion path="M0,0 C2,-1 3,0 2,1 C1,2 -1,1 -2,0 C-3,-1 -1,-2 0,0" dur="10s" repeatCount="indefinite"/>`
    ) + `</g></g>`;
  }
  return `<g transform="translate(${x},${y})"><g><path d="M-2,-3 Q-1,-4.5 0,-3 Q1,-4.5 2,-3" stroke="${c.seagull}" fill="none" stroke-width="0.6"/><circle cx="0" cy="-3" r="0.4" fill="${c.seagull}"/>` + motionMarkup(
    `<animateMotion path="M0,0 C2,-1 3,0 2,1 C1,2 -1,1 -2,0 C-3,-1 -1,-2 0,0" dur="10s" repeatCount="indefinite"/>`
  ) + `</g></g>`;
}
function svgDock(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-0.5" width="6" height="1" fill="${c.dock}" rx="0.2"/><line x1="-2" y1="0.5" x2="-2" y2="1.5" stroke="${c.dock}" stroke-width="0.5"/><line x1="2" y1="0.5" x2="2" y2="1.5" stroke="${c.dock}" stroke-width="0.5"/></g>`;
}
function svgWaves(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5" stroke="${c.waterLight}" fill="none" stroke-width="0.4" opacity="0.5">` + motionMarkup(
    `<animate attributeName="d" values="M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5;M-3,-0.3 Q-1.5,-1.2 0,-0.8 Q1.5,0.2 3,-0.3;M-3,-0.5 Q-1.5,-1.5 0,-0.5 Q1.5,0.5 3,-0.5" dur="4s" repeatCount="indefinite"/>`
  ) + `</path></g>`;
}
function svgKelp(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M0,0 Q-1,-2 0,-4 Q1,-6 0,-7" stroke="${c.fern}" fill="none" stroke-width="0.6" opacity="0.7"/><path d="M1,0 Q2,-1.5 1,-3.5 Q0,-5 1,-6" stroke="${c.fern}" fill="none" stroke-width="0.5" opacity="0.6"/></g>`;
}
function svgCoral(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M0,0 Q-1,-2 -2,-3 M0,0 Q0,-2.5 -0.5,-4 M0,0 Q1,-2 2,-3" stroke="${c.coral}" fill="none" stroke-width="0.8"/><circle cx="-2" cy="-3" r="0.5" fill="${c.coral}"/><circle cx="-0.5" cy="-4" r="0.5" fill="${c.coral}"/><circle cx="2" cy="-3" r="0.5" fill="${c.coral}"/></g>`;
}
function svgJellyfish(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="2" ry="1.5" fill="${c.jellyfish}" opacity="0.7">` + motionMarkup(
    `<animate attributeName="cy" values="-2;-3;-2" dur="3s" repeatCount="indefinite"/>`
  ) + `</ellipse><path d="M-1.5,-0.5 Q-1.2,-1.5 -0.8,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/><path d="M-0.3,-0.5 Q0,-1.5 0.3,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/><path d="M0.8,-0.5 Q1.2,-1.5 1.5,0" stroke="${c.jellyfish}" fill="none" stroke-width="0.3" opacity="0.5"/></g>`;
}
var init_water_whale = __esm({
  "src/themes/terrain/assets/renderers/water-whale.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/water-turtle.ts
function svgTurtle(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><g><ellipse cx="0" cy="-1" rx="2" ry="1.2" fill="${c.turtle}"/><ellipse cx="0" cy="-1.3" rx="1.5" ry="0.8" fill="${c.moss}" opacity="0.5"/><circle cx="-2" cy="-1.2" r="0.5" fill="${c.turtle}"/><circle cx="-2.3" cy="-1.3" r="0.12" fill="#222"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="translate" values="0,0;3,0;0,0" dur="8s" repeatCount="indefinite"/>`
  ) + `</g></g>`;
}
function svgBuoy(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.3" rx="1.2" ry="0.5" fill="${c.waterLight}" opacity="0.3"/><rect x="-0.6" y="-2.5" width="1.2" height="2.2" fill="${c.buoy}" rx="0.3"/><rect x="-0.6" y="-1.8" width="1.2" height="0.5" fill="#fff"/><line x1="0" y1="-2.5" x2="0" y2="-3.5" stroke="${c.buoy}" stroke-width="0.3"/></g>`;
}
function svgSailboat(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-3.5,0 -2.5,-1.5 3.5,-1.5 4,0" fill="${c.boat}"/><line x1="0" y1="-1.5" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.4"/><polygon points="0,-6.5 0,-2 3,-2.5" fill="${c.sail}" opacity="0.9"/><polygon points="0,-6 0,-2.5 -2,-3" fill="${c.sail}" opacity="0.7"/></g>`;
}
function svgLighthouse(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-1.5,0 1.5,0 1,-8 -1,-8" fill="${c.lighthouse}"/><rect x="-1.5" y="-1" width="3" height="1" fill="${c.rock}"/><rect x="-0.8" y="-9" width="1.6" height="1.2" fill="${c.lighthouse}" stroke="${c.rock}" stroke-width="0.2"/><polygon points="-1,-9 0,-10.5 1,-9" fill="${c.buoy}"/><circle cx="0" cy="-8.4" r="0.4" fill="${c.lanternGlow}" opacity="0.8"/></g>`;
}
function svgCrab(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="1.5" ry="1" fill="${c.crab}"/><path d="M-1.5,-0.8 L-2.5,-1.8 L-2.8,-1.2" stroke="${c.crab}" fill="none" stroke-width="0.4"/><path d="M1.5,-0.8 L2.5,-1.8 L2.8,-1.2" stroke="${c.crab}" fill="none" stroke-width="0.4"/><circle cx="-0.5" cy="-1.2" r="0.15" fill="#222"/><circle cx="0.5" cy="-1.2" r="0.15" fill="#222"/></g>`;
}
var init_water_turtle = __esm({
  "src/themes/terrain/assets/renderers/water-turtle.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/shore-wetland-rock.ts
function svgRock(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2" ry="1.3" fill="${c.rock}"/><ellipse cx="-0.4" cy="-1.4" rx="1" ry="0.5" fill="${c.boulder}" opacity="0.6"/><ellipse cx="-0.6" cy="-1.2" rx="0.3" ry="0.15" fill="${c.snowCap}" opacity="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.5" ry="0.8" fill="${c.shadow}" opacity="0.2"/><ellipse cx="0" cy="-0.5" rx="2.4" ry="0.7" fill="${c.rock}"/><ellipse cx="0.4" cy="-1.2" rx="1.6" ry="0.5" fill="${c.boulder}"/><ellipse cx="0.2" cy="-1.8" rx="0.8" ry="0.3" fill="${c.rock}"/><ellipse cx="-0.3" cy="-1.5" rx="0.2" ry="0.1" fill="${c.snowCap}" opacity="0.25"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-1.5,0 -1.2,-1.8 -0.2,-2.5 0.8,-2.2 1.5,-1 1.2,0" fill="${c.rock}"/><polygon points="-0.8,-0.5 -0.5,-1.6 0.3,-1.8 0.8,-1 0.5,-0.3" fill="${c.boulder}" opacity="0.5"/><line x1="-0.5" y1="-1.2" x2="0.3" y2="-1.5" stroke="${c.shadow}" stroke-width="0.15" opacity="0.3"/></g>`;
}
function svgBoulder(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="2.5" ry="1.8" fill="${c.boulder}"/><ellipse cx="-0.5" cy="-2" rx="1.5" ry="1" fill="${c.rock}" opacity="0.5"/></g>`;
}
function svgFlower(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.pine}" stroke-width="0.3"/><circle cx="0" cy="-3" r="1" fill="${c.flowerCenter}"/><circle cx="0" cy="-3" r="0.4" fill="${c.flower}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="-0.8" y1="0" x2="-0.8" y2="-2" stroke="${c.pine}" stroke-width="0.25"/><line x1="0.8" y1="0" x2="0.8" y2="-2.2" stroke="${c.pine}" stroke-width="0.25"/><circle cx="-0.8" cy="-2.5" r="0.7" fill="${c.wildflower}"/><circle cx="0.8" cy="-2.7" r="0.7" fill="${c.wildflower}"/><circle cx="0" cy="-2.3" r="0.5" fill="${c.wildflower}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.pine}" stroke-width="0.3"/><circle cx="0" cy="-3" r="1" fill="${c.flower}"/><circle cx="0" cy="-3" r="0.4" fill="${c.flowerCenter}"/></g>`;
}
function svgBush(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.6" rx="3.2" ry="1.2" fill="${c.bushDark}"/><ellipse cx="-0.8" cy="-1" rx="1.8" ry="0.9" fill="${c.bush}"/><ellipse cx="0.9" cy="-0.9" rx="1.6" ry="0.8" fill="${c.bush}"/><ellipse cx="0" cy="-1.2" rx="1.2" ry="0.6" fill="${c.leafLight}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2.3" ry="1.6" fill="${c.bushDark}"/><ellipse cx="-0.5" cy="-1.5" rx="1.5" ry="1.1" fill="${c.bush}"/><ellipse cx="0.6" cy="-1.3" rx="1.3" ry="1" fill="${c.bush}"/><ellipse cx="0" cy="-1.8" rx="0.9" ry="0.6" fill="${c.leafLight}"/><circle cx="-0.9" cy="-2.1" r="0.35" fill="${c.flower}"/><circle cx="0.4" cy="-2.4" r="0.3" fill="${c.flowerAlt}"/><circle cx="0.9" cy="-1.8" r="0.28" fill="${c.flower}"/><circle cx="-0.3" cy="-2.6" r="0.25" fill="${c.flowerAlt}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2.2" ry="1.6" fill="${c.bushDark}"/><ellipse cx="-0.4" cy="-1.5" rx="1.4" ry="1" fill="${c.bush}"/><ellipse cx="0.5" cy="-1.3" rx="1.2" ry="0.9" fill="${c.bush}"/><ellipse cx="0" cy="-1.8" rx="0.8" ry="0.5" fill="${c.leafLight}"/></g>`;
}
function svgDriftwood(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M-3,-0.3 Q-1,-1 1,-0.5 Q2.5,-0.2 3.5,0" stroke="${c.driftwood}" fill="none" stroke-width="0.8" stroke-linecap="round"/><path d="M1,-0.5 Q1.5,-1.5 2,-1.8" stroke="${c.driftwood}" fill="none" stroke-width="0.5"/></g>`;
}
function svgSandcastle(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-2" width="4" height="2" fill="${c.sandcastle}"/><rect x="-1" y="-3.5" width="2" height="1.8" fill="${c.sandcastle}"/><rect x="-0.3" y="-4.5" width="0.6" height="1.2" fill="${c.sandcastle}"/><line x1="0" y1="-4.5" x2="0.8" y2="-4.5" stroke="${c.buoy}" stroke-width="0.2"/></g>`;
}
function svgTidePools(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.3" rx="1.5" ry="0.6" fill="${c.tidePools}" opacity="0.5"/><ellipse cx="1.2" cy="-0.5" rx="1" ry="0.4" fill="${c.tidePools}" opacity="0.4"/><circle cx="-1.5" cy="-0.5" r="0.25" fill="${c.rock}"/><circle cx="0.8" cy="-0.3" r="0.2" fill="${c.rock}"/></g>`;
}
function svgHeron(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-3" stroke="${c.heron}" stroke-width="0.3"/><line x1="0.5" y1="0" x2="0.5" y2="-3" stroke="${c.heron}" stroke-width="0.3"/><ellipse cx="0.3" cy="-4" rx="1" ry="1.5" fill="${c.heron}"/><circle cx="-0.2" cy="-5.5" r="0.6" fill="${c.heron}"/><line x1="-0.8" y1="-5.4" x2="-1.8" y2="-5.2" stroke="${c.wheat}" stroke-width="0.3"/></g>`;
}
function svgShellfish(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.3" rx="0.8" ry="0.5" fill="${c.shellfish}"/><ellipse cx="0.5" cy="-0.2" rx="0.6" ry="0.4" fill="${c.shellfish}" opacity="0.8"/><ellipse cx="1.5" cy="-0.5" rx="0.7" ry="0.45" fill="${c.shellfish}" opacity="0.7"/></g>`;
}
function svgCattail(x, y, c, _v) {
  return `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-gentle"')}><line x1="-0.5" y1="0" x2="-0.7" y2="-4.5" stroke="${c.cattail}" stroke-width="0.3"/><line x1="0.5" y1="0" x2="0.3" y2="-5" stroke="${c.cattail}" stroke-width="0.3"/><ellipse cx="-0.7" cy="-5" rx="0.3" ry="0.9" fill="${c.trunk}"/><ellipse cx="0.3" cy="-5.5" rx="0.3" ry="0.9" fill="${c.trunk}"/></g>`;
}
function svgFrog(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.5" rx="1" ry="0.7" fill="${c.frog}"/><circle cx="-0.5" cy="-1.1" r="0.3" fill="${c.frog}"/><circle cx="0.5" cy="-1.1" r="0.3" fill="${c.frog}"/><circle cx="-0.5" cy="-1.2" r="0.12" fill="#222"/><circle cx="0.5" cy="-1.2" r="0.12" fill="#222"/></g>`;
}
function svgLily(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.8" ry="0.7" fill="${c.pine}" opacity="0.6"/><path d="M0,-0.4 Q-0.3,-1.2 0,-1 Q0.3,-1.2 0,-0.4" fill="${c.lily}" opacity="0.9"/><circle cx="0" cy="-0.7" r="0.2" fill="${c.flowerCenter}"/></g>`;
}
var init_shore_wetland_rock = __esm({
  "src/themes/terrain/assets/renderers/shore-wetland-rock.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/grassland-pine.ts
function svgPine(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/><rect x="-0.4" y="-1.8" width="0.8" height="1.8" fill="${c.trunk}"/><polygon points="0,-5.5 -3.2,-1.5 3.2,-1.5" fill="${c.bushDark}"/><polygon points="0,-5.5 -2.8,-2 2.8,-2" fill="${c.pine}"/><polygon points="0,-7 -2.4,-3.5 2.4,-3.5" fill="${c.bushDark}" opacity="0.9"/><polygon points="0,-7 -2,-4 2,-4" fill="${c.pine}"/><polygon points="0,-8 -1.2,-5.5 1.2,-5.5" fill="${c.leafLight}" opacity="0.8"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0.5" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/><path d="M0,0 Q0.4,-1.5 0.8,-3" stroke="${c.trunk}" fill="none" stroke-width="0.7"/><polygon points="1,-8.5 -1.8,-3 3.8,-3" fill="${c.bushDark}"/><polygon points="1,-8.5 -1.4,-3.5 3.4,-3.5" fill="${c.pine}"/><polygon points="1.2,-10 -0.8,-6 3.2,-6" fill="${c.bushDark}" opacity="0.9"/><polygon points="1.2,-10 -0.4,-6.5 2.8,-6.5" fill="${c.pine}"/><polygon points="1.2,-10.8 0,-7.5 2.4,-7.5" fill="${c.leafLight}" opacity="0.7"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="0.8" ry="0.25" fill="${c.shadow}" opacity="0.15"/><rect x="-0.35" y="-2.5" width="0.7" height="2.5" fill="${c.trunk}"/><polygon points="0,-8.5 -2.8,-2 2.8,-2" fill="${c.bushDark}"/><polygon points="0,-8.5 -2.4,-2.5 2.4,-2.5" fill="${c.pine}"/><polygon points="0,-10.5 -2,-5.5 2,-5.5" fill="${c.bushDark}" opacity="0.9"/><polygon points="0,-10.5 -1.6,-6 1.6,-6" fill="${c.pine}"/><polygon points="0,-11.5 -0.9,-8 0.9,-8" fill="${c.leafLight}" opacity="0.7"/></g>`;
}
function svgDeciduous(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="0.8" ry="0.25" fill="${c.shadow}" opacity="0.15"/><rect x="-0.35" y="-4.5" width="0.7" height="4.5" fill="${c.trunk}"/><line x1="-0.3" y1="-3.5" x2="-1" y2="-4.5" stroke="${c.trunk}" stroke-width="0.3"/><line x1="0.3" y1="-4" x2="0.8" y2="-5" stroke="${c.trunk}" stroke-width="0.25"/><ellipse cx="0" cy="-7.5" rx="2.3" ry="3.8" fill="${c.bushDark}"/><ellipse cx="-0.3" cy="-7" rx="1.8" ry="3" fill="${c.leaf}"/><ellipse cx="0.5" cy="-7.8" rx="1.4" ry="2.5" fill="${c.bush}" opacity="0.8"/><ellipse cx="-0.2" cy="-8.5" rx="1" ry="1.5" fill="${c.leafLight}" opacity="0.6"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.4" fill="${c.shadow}" opacity="0.15"/><rect x="-0.4" y="-3" width="0.8" height="3" fill="${c.trunk}"/><line x1="0" y1="-2.5" x2="-2" y2="-4" stroke="${c.trunk}" stroke-width="0.45"/><line x1="0" y1="-2.5" x2="2" y2="-4" stroke="${c.trunk}" stroke-width="0.45"/><circle cx="-2" cy="-5.5" r="2.3" fill="${c.bushDark}"/><circle cx="-2" cy="-5.5" r="2" fill="${c.leaf}"/><circle cx="-2.5" cy="-6" r="1.2" fill="${c.leafLight}" opacity="0.6"/><circle cx="2" cy="-5.5" r="2.3" fill="${c.bushDark}"/><circle cx="2" cy="-5.5" r="2" fill="${c.leaf}"/><circle cx="1.5" cy="-6" r="1.2" fill="${c.leafLight}" opacity="0.6"/><circle cx="0" cy="-6" r="2" fill="${c.bush}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1" ry="0.3" fill="${c.shadow}" opacity="0.15"/><rect x="-0.35" y="-3.5" width="0.7" height="3.5" fill="${c.trunk}"/><line x1="-0.2" y1="-3" x2="-1.2" y2="-4" stroke="${c.trunk}" stroke-width="0.3"/><line x1="0.2" y1="-2.8" x2="1" y2="-3.8" stroke="${c.trunk}" stroke-width="0.25"/><circle cx="0" cy="-6" r="3.2" fill="${c.bushDark}"/><circle cx="0" cy="-6" r="2.9" fill="${c.leaf}"/><circle cx="-1" cy="-5.5" r="2" fill="${c.bush}" opacity="0.75"/><circle cx="0.8" cy="-6.5" r="1.5" fill="${c.leafLight}" opacity="0.6"/></g>`;
}
function svgMushroom(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-1.2" y="-1.5" width="0.6" height="1.5" fill="${c.mushroom}"/><ellipse cx="-0.9" cy="-1.7" rx="1" ry="0.7" fill="${c.trunk}"/><rect x="0.5" y="-1.8" width="0.5" height="1.8" fill="${c.mushroom}"/><ellipse cx="0.75" cy="-2" rx="0.8" ry="0.6" fill="${c.trunk}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-3" width="0.6" height="3" fill="${c.mushroom}"/><ellipse cx="0" cy="-3.2" rx="1" ry="0.6" fill="${c.mushroomCap}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-2" width="0.8" height="2" fill="${c.mushroom}"/><ellipse cx="0" cy="-2.2" rx="1.5" ry="1" fill="${c.mushroomCap}"/><circle cx="-0.5" cy="-2.5" r="0.3" fill="${c.mushroom}" opacity="0.7"/></g>`;
}
function svgStump(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/><rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.stump}" opacity="0.7"/><circle cx="1.2" cy="-1.2" r="0.4" fill="${c.mushroom}"/><circle cx="1.5" cy="-0.8" r="0.3" fill="${c.mushroom}" opacity="0.8"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/><rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.moss}" opacity="0.6"/><ellipse cx="-0.5" cy="-1" rx="0.8" ry="0.3" fill="${c.moss}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.8" fill="${c.stump}"/><rect x="-1.5" y="-1.5" width="3" height="1.5" fill="${c.trunk}"/><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.6" fill="${c.stump}" opacity="0.7"/></g>`;
}
function svgDeer(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/><circle cx="-2.2" cy="-1.8" r="0.6" fill="${c.deer}"/><line x1="-2.5" y1="-2.4" x2="-2.8" y2="-3.2" stroke="${c.trunk}" stroke-width="0.25"/><line x1="-1.9" y1="-2.4" x2="-1.5" y2="-3.2" stroke="${c.trunk}" stroke-width="0.25"/><line x1="-1" y1="-0.8" x2="-1" y2="0" stroke="${c.deer}" stroke-width="0.4"/><line x1="1" y1="-0.8" x2="1" y2="0" stroke="${c.deer}" stroke-width="0.4"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/><circle cx="-2" cy="-3" r="0.7" fill="${c.deer}"/><line x1="-2.3" y1="-3.7" x2="-3" y2="-4.8" stroke="${c.trunk}" stroke-width="0.3"/><line x1="-1.7" y1="-3.7" x2="-1" y2="-4.8" stroke="${c.trunk}" stroke-width="0.3"/><line x1="-1.2" y1="-0.8" x2="-1.8" y2="0.3" stroke="${c.deer}" stroke-width="0.4"/><line x1="0.8" y1="-0.8" x2="1.5" y2="0.3" stroke="${c.deer}" stroke-width="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${c.deer}"/><circle cx="-2" cy="-3" r="0.7" fill="${c.deer}"/><line x1="-2.3" y1="-3.7" x2="-3" y2="-5" stroke="${c.trunk}" stroke-width="0.3"/><line x1="-3" y1="-5" x2="-3.5" y2="-5.3" stroke="${c.trunk}" stroke-width="0.25"/><line x1="-1.7" y1="-3.7" x2="-1" y2="-5" stroke="${c.trunk}" stroke-width="0.3"/><line x1="-1" y1="-5" x2="-0.5" y2="-5.3" stroke="${c.trunk}" stroke-width="0.25"/><line x1="-1" y1="-0.8" x2="-1" y2="0" stroke="${c.deer}" stroke-width="0.4"/><line x1="1" y1="-0.8" x2="1" y2="0" stroke="${c.deer}" stroke-width="0.4"/></g>`;
}
var init_grassland_pine = __esm({
  "src/themes/terrain/assets/renderers/grassland-pine.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/grassland-rabbit.ts
function svgRabbit(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="1" ry="0.7" fill="${c.rabbit}"/><circle cx="-0.8" cy="-1.6" r="0.45" fill="${c.rabbit}"/><ellipse cx="-1" cy="-2.3" rx="0.18" ry="0.5" fill="${c.rabbit}"/><ellipse cx="-0.6" cy="-2.3" rx="0.18" ry="0.5" fill="${c.rabbit}"/><circle cx="-1" cy="-1.7" r="0.1" fill="#222"/><line x1="0.8" y1="-0.5" x2="1.5" y2="0.2" stroke="${c.rabbit}" stroke-width="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-0.5" cy="-0.8" rx="1" ry="0.7" fill="${c.rabbit}"/><circle cx="-1.3" cy="-1.4" r="0.4" fill="${c.rabbit}"/><ellipse cx="-1.5" cy="-2" rx="0.15" ry="0.45" fill="${c.rabbit}"/><ellipse cx="-1.1" cy="-2" rx="0.15" ry="0.45" fill="${c.rabbit}"/><ellipse cx="1.5" cy="-0.6" rx="0.8" ry="0.5" fill="${c.rabbit}" opacity="0.8"/><circle cx="0.9" cy="-1" r="0.3" fill="${c.rabbit}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="1.2" ry="0.8" fill="${c.rabbit}"/><circle cx="-0.8" cy="-1.5" r="0.5" fill="${c.rabbit}"/><ellipse cx="-1.1" cy="-2.3" rx="0.2" ry="0.6" fill="${c.rabbit}"/><ellipse cx="-0.6" cy="-2.3" rx="0.2" ry="0.6" fill="${c.rabbit}"/><circle cx="-1" cy="-1.6" r="0.1" fill="#222"/></g>`;
}
function svgFox(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="1.5" ry="0.8" fill="${c.fox}"/><circle cx="-1" cy="-1.2" r="0.5" fill="${c.fox}"/><polygon points="-1.3,-1.7 -1.5,-2.1 -1,-1.8" fill="${c.fox}"/><polygon points="-0.7,-1.7 -0.5,-2.1 -1,-1.8" fill="${c.fox}"/><path d="M1.5,-0.5 Q1.2,-0.2 0.5,-0.5" stroke="${c.fox}" fill="none" stroke-width="0.5"/><circle cx="0.5" cy="-0.5" r="0.25" fill="#fff" opacity="0.8"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="1.8" ry="0.9" fill="${c.fox}"/><circle cx="-1.5" cy="-2.3" r="0.55" fill="${c.fox}"/><polygon points="-1.8,-2.8 -2,-3.3 -1.5,-2.9" fill="${c.fox}"/><polygon points="-1.2,-2.8 -1,-3.3 -1.5,-2.9" fill="${c.fox}"/><circle cx="-1.7" cy="-2.4" r="0.1" fill="#222"/><line x1="-0.8" y1="-0.6" x2="-1.3" y2="0.3" stroke="${c.fox}" stroke-width="0.3"/><line x1="0.8" y1="-0.6" x2="1.3" y2="0.3" stroke="${c.fox}" stroke-width="0.3"/><path d="M1.8,-1.3 Q2.5,-1.5 3,-1" stroke="${c.fox}" fill="none" stroke-width="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.2" rx="1.8" ry="1" fill="${c.fox}"/><circle cx="-1.5" cy="-2" r="0.6" fill="${c.fox}"/><polygon points="-1.8,-2.6 -2,-3.2 -1.5,-2.7" fill="${c.fox}"/><polygon points="-1.2,-2.6 -1,-3.2 -1.5,-2.7" fill="${c.fox}"/><circle cx="-1.7" cy="-2.1" r="0.1" fill="#222"/><path d="M1.8,-1 Q2.5,-0.8 3,-1.5" stroke="${c.fox}" fill="none" stroke-width="0.6"/><circle cx="3" cy="-1.5" r="0.3" fill="#fff" opacity="0.8"/></g>`;
}
function svgButterfly(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><g><ellipse cx="-1" cy="-3.5" rx="1" ry="0.7" fill="${c.butterfly}" opacity="0.8"/><ellipse cx="1" cy="-3.5" rx="1" ry="0.7" fill="${c.butterflyWing}" opacity="0.8"/><ellipse cx="-0.6" cy="-2.8" rx="0.6" ry="0.4" fill="${c.butterflyWing}" opacity="0.7"/><ellipse cx="0.6" cy="-2.8" rx="0.6" ry="0.4" fill="${c.butterfly}" opacity="0.7"/><line x1="0" y1="-2.5" x2="0" y2="-4" stroke="${c.bird}" stroke-width="0.2"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="translate" values="0,0;2,-1;-1,0.5;0,0" dur="6s" repeatCount="indefinite"/>`
  ) + `</g></g>`;
}
function svgBeehive(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="-5" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.5"/><path d="M-1,-5 Q1,-4.5 1,-5" stroke="${c.trunk}" fill="none" stroke-width="0.3"/><ellipse cx="0" cy="-3.5" rx="1.2" ry="1.8" fill="${c.beehive}"/><line x1="-1.2" y1="-3.5" x2="1.2" y2="-3.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.4"/><line x1="-1" y1="-2.5" x2="1" y2="-2.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.4"/><circle cx="0" cy="-1.8" r="0.25" fill="${c.trunk}"/></g>`;
}
function svgWildflowerPatch(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><circle cx="-1.5" cy="-1.5" r="0.5" fill="${c.flower}"/><circle cx="0" cy="-1.8" r="0.6" fill="${c.wildflower}"/><circle cx="1.2" cy="-1.3" r="0.5" fill="${c.butterflyWing}"/><circle cx="-0.5" cy="-1" r="0.4" fill="${c.flower}" opacity="0.8"/><circle cx="0.8" cy="-2" r="0.35" fill="${c.wildflower}" opacity="0.7"/><line x1="-1.5" y1="-1" x2="-1.5" y2="0" stroke="${c.pine}" stroke-width="0.2"/><line x1="0" y1="-1.2" x2="0" y2="0" stroke="${c.pine}" stroke-width="0.2"/><line x1="1.2" y1="-0.8" x2="1.2" y2="0" stroke="${c.pine}" stroke-width="0.2"/></g>`;
}
function svgTallGrass(x, y, c, _v) {
  return `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-gentle"')}><line x1="-1" y1="0" x2="-1.3" y2="-3.5" stroke="${c.tallGrass}" stroke-width="0.4"/><line x1="0" y1="0" x2="0.2" y2="-4" stroke="${c.tallGrass}" stroke-width="0.4"/><line x1="1" y1="0" x2="0.8" y2="-3.2" stroke="${c.tallGrass}" stroke-width="0.4"/><line x1="-0.5" y1="0" x2="-0.8" y2="-3.8" stroke="${c.tallGrass}" stroke-width="0.3" opacity="0.7"/></g>`;
}
function svgBirch(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="-2" y1="0" x2="-2" y2="-5.5" stroke="${c.birchBark}" stroke-width="0.5"/><circle cx="-2" cy="-6.5" r="1.5" fill="${c.leaf}" opacity="0.7"/><line x1="0" y1="0" x2="0" y2="-7" stroke="${c.birchBark}" stroke-width="0.6"/><circle cx="0" cy="-8" r="1.8" fill="${c.leaf}" opacity="0.8"/><line x1="2" y1="0" x2="2" y2="-5" stroke="${c.birchBark}" stroke-width="0.5"/><circle cx="2" cy="-6" r="1.3" fill="${c.leaf}" opacity="0.6"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M0,0 Q-1,-3.5 -0.5,-7" stroke="${c.birchBark}" fill="none" stroke-width="0.7"/><line x1="-0.7" y1="-2" x2="-0.3" y2="-2" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/><line x1="-0.5" y1="-4.5" x2="-0.1" y2="-4.5" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/><circle cx="-0.5" cy="-8.5" r="2" fill="${c.leaf}" opacity="0.8"/><circle cx="-1.5" cy="-8" r="1.3" fill="${c.leaf}" opacity="0.6"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-7" stroke="${c.birchBark}" stroke-width="0.7"/><line x1="-0.2" y1="-2" x2="0.2" y2="-2" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/><line x1="-0.2" y1="-4" x2="0.2" y2="-4" stroke="${c.trunk}" stroke-width="0.2" opacity="0.5"/><circle cx="0" cy="-8.5" r="2.2" fill="${c.leaf}" opacity="0.8"/><circle cx="-1" cy="-8" r="1.5" fill="${c.leaf}" opacity="0.6"/></g>`;
}
function svgHaybale(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2" ry="1" fill="${c.haybale}"/><rect x="-2" y="-1" width="4" height="1" fill="${c.haybale}"/><ellipse cx="0" cy="0" rx="2" ry="0.6" fill="${c.haybale}" opacity="0.7"/><line x1="-1.5" y1="-0.5" x2="1.5" y2="-0.5" stroke="${c.wheat}" stroke-width="0.2" opacity="0.4"/></g>`;
}
var init_grassland_rabbit = __esm({
  "src/themes/terrain/assets/renderers/grassland-rabbit.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/forest-willow.ts
function svgWillow(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-3" stroke="${c.trunk}" stroke-width="0.9"/><circle cx="0" cy="-4" r="2.5" fill="${c.willow}"/><path d="M-2.5,-3 Q-4,-1 -4,0" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/><path d="M2.5,-3 Q4,-1 4,0" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M0,0 Q-1,-2.5 0.5,-5" stroke="${c.trunk}" fill="none" stroke-width="1"/><circle cx="0.5" cy="-6" r="1.8" fill="${c.willow}"/><path d="M-1,-5 Q-2.5,-3 -3,-1" stroke="${c.willow}" fill="none" stroke-width="0.5" opacity="0.7"/><path d="M2,-5 Q2.5,-3 2,-1" stroke="${c.willow}" fill="none" stroke-width="0.5" opacity="0.7"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-5" stroke="${c.trunk}" stroke-width="0.8"/><circle cx="0" cy="-6" r="2" fill="${c.willow}"/><path d="M-2,-5 Q-3,-3 -3,-1" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/><path d="M2,-5 Q3,-3 3,-1" stroke="${c.willow}" fill="none" stroke-width="0.6" opacity="0.7"/><path d="M-1,-5.5 Q-2,-3.5 -2.5,-2" stroke="${c.willow}" fill="none" stroke-width="0.4" opacity="0.5"/></g>`;
}
function svgPalm(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M0,0 Q-2,-4 -1,-8" stroke="${c.trunk}" fill="none" stroke-width="0.7"/><path d="M-1,-8 Q2,-9 3,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/><path d="M-1,-8 Q-3,-9 -4,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/><path d="M-1,-8 Q1,-10 2,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M-1.5,0 Q-2,-3 -1,-6" stroke="${c.trunk}" fill="none" stroke-width="0.6"/><path d="M-1,-6 Q1,-7 2,-5.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/><path d="M-1,-6 Q-3,-7 -3.5,-5.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/><path d="M1.5,0 Q1,-3 2,-7" stroke="${c.trunk}" fill="none" stroke-width="0.6"/><path d="M2,-7 Q4,-8 4.5,-6.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/><path d="M2,-7 Q0,-8 -0.5,-6.5" stroke="${c.palm}" fill="none" stroke-width="0.7"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><path d="M0,0 Q-0.5,-4 0.5,-8" stroke="${c.trunk}" fill="none" stroke-width="0.7"/><path d="M0.5,-8 Q3,-9 4,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/><path d="M0.5,-8 Q-2,-9 -3,-7" stroke="${c.palm}" fill="none" stroke-width="0.8"/><path d="M0.5,-8 Q2,-10 3,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/><path d="M0.5,-8 Q-1,-10 -2,-9" stroke="${c.palm}" fill="none" stroke-width="0.6"/></g>`;
}
function svgBird(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><circle cx="0" cy="-4" r="0.6" fill="${c.bird}"/><ellipse cx="0" cy="-3.5" rx="0.5" ry="0.8" fill="${c.bird}"/><polygon points="-0.6,-4 -1,-3.9 -0.6,-3.8" fill="${c.wheat}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><g><path d="M-1.5,-4 Q0,-5.5 1.5,-4" stroke="${c.bird}" fill="none" stroke-width="0.5"/><path d="M0,-5.5 Q1.5,-7 3,-5.5" stroke="${c.bird}" fill="none" stroke-width="0.4" opacity="0.7"/>` + motionMarkup(
      `<animateTransform attributeName="transform" type="translate" values="0,0;4,-1;0,0" dur="12s" repeatCount="indefinite"/>`
    ) + `</g></g>`;
  }
  return `<g transform="translate(${x},${y})"><g><path d="M-1.5,-4 Q0,-5.5 1.5,-4" stroke="${c.bird}" fill="none" stroke-width="0.5"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="translate" values="0,0;4,-1;0,0" dur="12s" repeatCount="indefinite"/>`
  ) + `</g></g>`;
}
function svgOwl(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="1.2" ry="1.5" fill="${c.owl}"/><circle cx="-0.4" cy="-2.5" r="0.5" fill="#fff"/><circle cx="0.4" cy="-2.5" r="0.5" fill="#fff"/><circle cx="-0.4" cy="-2.5" r="0.2" fill="#222"/><circle cx="0.4" cy="-2.5" r="0.2" fill="#222"/><polygon points="0,-2.1 -0.2,-1.8 0.2,-1.8" fill="${c.wheat}"/></g>`;
}
function svgSquirrel(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="0.8" ry="0.6" fill="${c.squirrel}"/><circle cx="-0.6" cy="-1.3" r="0.4" fill="${c.squirrel}"/><circle cx="-0.7" cy="-1.4" r="0.1" fill="#222"/><path d="M0.8,-0.8 Q1.5,-1.5 1.2,-2.2" stroke="${c.squirrel}" fill="none" stroke-width="0.5"/></g>`;
}
function svgMoss(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.2" rx="1.5" ry="0.5" fill="${c.moss}" opacity="0.7"/><ellipse cx="1" cy="-0.3" rx="1.2" ry="0.4" fill="${c.moss}" opacity="0.6"/><ellipse cx="0" cy="-0.1" rx="0.8" ry="0.3" fill="${c.moss}" opacity="0.5"/></g>`;
}
function svgFern(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M0,0 Q-2,-2 -3,-3.5" stroke="${c.fern}" fill="none" stroke-width="0.4"/><path d="M0,0 Q0,-2.5 0,-4" stroke="${c.fern}" fill="none" stroke-width="0.4"/><path d="M0,0 Q2,-2 3,-3.5" stroke="${c.fern}" fill="none" stroke-width="0.4"/><circle cx="-1" cy="-1.5" r="0.3" fill="${c.fern}" opacity="0.6"/><circle cx="1" cy="-1.5" r="0.3" fill="${c.fern}" opacity="0.6"/><circle cx="0" cy="-2.5" r="0.3" fill="${c.fern}" opacity="0.5"/></g>`;
}
function svgDeadTree(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-6" stroke="${c.deadTree}" stroke-width="0.8"/><line x1="0" y1="-4" x2="-2" y2="-5.5" stroke="${c.deadTree}" stroke-width="0.4"/><line x1="0" y1="-3" x2="1.5" y2="-4.5" stroke="${c.deadTree}" stroke-width="0.4"/><line x1="0" y1="-5" x2="-1" y2="-6.5" stroke="${c.deadTree}" stroke-width="0.3"/></g>`;
}
function svgLog(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-1" width="6" height="1" fill="${c.log}" rx="0.5"/><ellipse cx="-3" cy="-0.5" rx="0.5" ry="0.5" fill="${c.trunk}"/><ellipse cx="3" cy="-0.5" rx="0.5" ry="0.5" fill="${c.trunk}"/></g>`;
}
function svgBerryBush(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="2.2" ry="1.5" fill="${c.berryBush}"/><circle cx="-0.8" cy="-1.8" r="0.3" fill="${c.berry}"/><circle cx="0.5" cy="-2" r="0.3" fill="${c.berry}"/><circle cx="0" cy="-1.2" r="0.25" fill="${c.berry}"/><circle cx="1.2" cy="-1.5" r="0.25" fill="${c.berry}"/></g>`;
}
function svgSpider(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="-2.5" y1="-4" x2="2.5" y2="-1" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/><line x1="-2.5" y1="-1" x2="2.5" y2="-4" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/><line x1="0" y1="-5" x2="0" y2="0" stroke="${c.spiderWeb}" fill="none" stroke-width="0.15"/><path d="M-1.5,-1.5 Q0,-2 1.5,-1.5" stroke="${c.spiderWeb}" fill="none" stroke-width="0.12"/><path d="M-1,-3 Q0,-3.5 1,-3" stroke="${c.spiderWeb}" fill="none" stroke-width="0.12"/><circle cx="0" cy="-2.5" r="0.4" fill="${c.bird}"/></g>`;
}
var init_forest_willow = __esm({
  "src/themes/terrain/assets/renderers/forest-willow.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/farm-wheat.ts
function svgWheat(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="-1.5" y1="0" x2="-1.5" y2="-4" stroke="${c.wheat}" stroke-width="0.35"/><line x1="0" y1="0" x2="0" y2="-4.5" stroke="${c.wheat}" stroke-width="0.35"/><line x1="1.5" y1="0" x2="1.5" y2="-3.8" stroke="${c.wheat}" stroke-width="0.35"/><line x1="-0.7" y1="0" x2="-0.7" y2="-4.2" stroke="${c.wheat}" stroke-width="0.25" opacity="0.7"/><ellipse cx="-1.5" cy="-4.3" rx="0.4" ry="0.7" fill="${c.wheat}"/><ellipse cx="0" cy="-4.8" rx="0.4" ry="0.7" fill="${c.wheat}"/><ellipse cx="1.5" cy="-4.1" rx="0.4" ry="0.7" fill="${c.wheat}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="-2" y1="0" x2="-2" y2="-1.2" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/><line x1="-0.5" y1="0" x2="-0.5" y2="-1" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/><line x1="1" y1="0" x2="1" y2="-1.3" stroke="${c.wheat}" stroke-width="0.3" opacity="0.6"/><line x1="2.5" y1="0" x2="2.5" y2="-0.8" stroke="${c.wheat}" stroke-width="0.3" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="-1.5" y1="0" x2="-1.5" y2="-4" stroke="${c.wheat}" stroke-width="0.3"/><line x1="0" y1="0" x2="0" y2="-4.5" stroke="${c.wheat}" stroke-width="0.3"/><line x1="1.5" y1="0" x2="1.5" y2="-3.8" stroke="${c.wheat}" stroke-width="0.3"/><circle cx="-1.5" cy="-4.2" r="0.5" fill="${c.wheat}"/><circle cx="0" cy="-4.8" r="0.5" fill="${c.wheat}"/><circle cx="1.5" cy="-4" r="0.5" fill="${c.wheat}"/></g>`;
}
function svgFence(x, y, c, v) {
  const postCap = (px) => `<polygon points="${px - 0.3},-3 ${px},-3.5 ${px + 0.3},-3" fill="${c.fence}"/>`;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="-3" y1="-1.5" x2="0" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/><line x1="-3" y1="-2.3" x2="0" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/><rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/><rect x="-0.25" y="-3" width="0.5" height="3" fill="${c.fence}"/>` + postCap(-3) + postCap(0) + `<line x1="0" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/><line x1="0" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/><rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` + postCap(3) + `</g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="-3" y1="-1.5" x2="-0.7" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/><line x1="0.7" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/><line x1="-3" y1="-2.3" x2="-0.7" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/><line x1="0.7" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/><rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/><rect x="-0.85" y="-3.5" width="0.4" height="3.5" fill="${c.fence}"/><rect x="0.55" y="-3.5" width="0.4" height="3.5" fill="${c.fence}"/><rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` + postCap(-3) + `<circle cx="-0.65" cy="-3.7" r="0.25" fill="${c.fence}"/><circle cx="0.75" cy="-3.7" r="0.25" fill="${c.fence}"/>` + postCap(3) + `</g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="-3" y1="-1.5" x2="3" y2="-1.5" stroke="${c.fence}" stroke-width="0.5"/><line x1="-3" y1="-2.3" x2="3" y2="-2.3" stroke="${c.fence}" stroke-width="0.4"/><rect x="-3.2" y="-3" width="0.5" height="3" fill="${c.fence}"/><rect x="-0.25" y="-3" width="0.5" height="3" fill="${c.fence}"/><rect x="2.75" y="-3" width="0.5" height="3" fill="${c.fence}"/>` + postCap(-3) + postCap(0) + postCap(3) + `</g>`;
}
function svgScarecrow(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-6" stroke="${c.scarecrow}" stroke-width="0.5"/><line x1="-2.5" y1="-4" x2="2.5" y2="-4" stroke="${c.scarecrow}" stroke-width="0.4"/><circle cx="0" cy="-7" r="1" fill="${c.scarecrowHat}"/><rect x="-1.5" y="-8.2" width="3" height="0.8" fill="${c.scarecrowHat}" rx="0.2"/><path d="M2,-4.5 Q2.5,-5.5 3,-4.5" stroke="${c.bird}" fill="${c.bird}" stroke-width="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0.3" y2="-5.5" stroke="${c.scarecrow}" stroke-width="0.5"/><line x1="-2" y1="-3.5" x2="2.5" y2="-4.2" stroke="${c.scarecrow}" stroke-width="0.4"/><circle cx="0.3" cy="-6.5" r="0.9" fill="${c.scarecrowHat}"/><rect x="-1" y="-7.6" width="2.8" height="0.7" fill="${c.scarecrowHat}" rx="0.2" transform="rotate(-8 0.3 -7)"/><path d="M-2,-3.5 L-2.5,-2.5" stroke="${c.scarecrow}" stroke-width="0.3" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-6" stroke="${c.scarecrow}" stroke-width="0.5"/><line x1="-2.5" y1="-4" x2="2.5" y2="-4" stroke="${c.scarecrow}" stroke-width="0.4"/><circle cx="0" cy="-7" r="1" fill="${c.scarecrowHat}"/><rect x="-1.5" y="-8.2" width="3" height="0.8" fill="${c.scarecrowHat}" rx="0.2"/></g>`;
}
function svgBarn(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-4,0 0,2 4,0 4,-4.5 0,-2.5 -4,-4.5" fill="${c.roofA}" opacity="0.9"/><polygon points="-4,0 0,2 0,-2.5 -4,-4.5" fill="${c.wallShade}"/><polygon points="0,-7.5 -4.5,-4 0,-2.2 4.5,-4" fill="${c.roofA}"/><rect x="-0.5" y="-1.5" width="1" height="1.5" fill="${c.trunk}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2" y="-2.5" width="4" height="2.5" fill="${c.wallShade}"/><polygon points="-2.5,-2.5 0,-4 2.5,-2.5" fill="${c.roofB}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-3.5 0,-2 -3,-3.5" fill="${c.roofA}" opacity="0.8"/><polygon points="-3,0 0,1.5 0,-2 -3,-3.5" fill="${c.wallShade}"/><polygon points="0,-6 -3.5,-3.2 0,-1.8 3.5,-3.2" fill="${c.roofA}"/></g>`;
}
var init_farm_wheat = __esm({
  "src/themes/terrain/assets/renderers/farm-wheat.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/farm-sheep.ts
function svgSheep(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2" rx="2.2" ry="1.4" fill="${c.sheep}"/><circle cx="-1.3" cy="-2.3" r="1" fill="${c.sheep}"/><circle cx="1.3" cy="-2.3" r="1" fill="${c.sheep}"/><circle cx="0" cy="-2.8" r="0.9" fill="${c.sheep}"/><ellipse cx="-1.8" cy="-1.2" rx="0.7" ry="0.5" fill="${c.sheepHead}"/><ellipse cx="-1.3" cy="-1.8" rx="0.25" ry="0.4" fill="${c.sheepHead}"/><rect x="-1.1" y="-0.8" width="0.5" height="1" fill="${c.sheepHead}"/><rect x="0.6" y="-0.8" width="0.5" height="1" fill="${c.sheepHead}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="2.5" ry="1" fill="${c.sheep}"/><circle cx="-1.5" cy="-1.3" r="0.8" fill="${c.sheep}"/><circle cx="1.2" cy="-1.2" r="0.7" fill="${c.sheep}"/><circle cx="-2.2" cy="-1.5" r="0.6" fill="${c.sheepHead}"/><circle cx="-2.4" cy="-1.6" r="0.1" fill="#222"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.8" ry="0.4" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.2" rx="2" ry="1.3" fill="${c.sheep}"/><circle cx="-1.2" cy="-2.5" r="0.9" fill="${c.sheep}"/><circle cx="1" cy="-2.4" r="0.85" fill="${c.sheep}"/><circle cx="0" cy="-3" r="0.8" fill="${c.sheep}"/><ellipse cx="-2" cy="-2.8" rx="0.7" ry="0.55" fill="${c.sheepHead}"/><circle cx="-2.1" cy="-2.9" r="0.12" fill="#222"/><ellipse cx="-1.5" cy="-3.3" rx="0.2" ry="0.35" fill="${c.sheepHead}" transform="rotate(-15 -1.5 -3.3)"/><rect x="-1.2" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/><rect x="-0.4" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/><rect x="0.4" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/><rect x="1" y="-1" width="0.45" height="1.2" fill="${c.sheepHead}"/></g>`;
}
function svgCow(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/><ellipse cx="-0.5" cy="-2.5" rx="0.9" ry="0.7" fill="${c.cowSpot}"/><ellipse cx="1" cy="-1.8" rx="0.7" ry="0.5" fill="${c.cowSpot}"/><ellipse cx="2.5" cy="-1.5" rx="0.9" ry="0.7" fill="${c.cow}"/><ellipse cx="3" cy="-1.3" rx="0.5" ry="0.4" fill="${c.cowSpot}" opacity="0.6"/><line x1="2.2" y1="-2.1" x2="1.8" y2="-2.8" stroke="${c.fence}" stroke-width="0.3"/><line x1="2.8" y1="-2.1" x2="3.2" y2="-2.7" stroke="${c.fence}" stroke-width="0.3"/><circle cx="2.8" cy="-1.6" r="0.12" fill="#222"/><rect x="-1.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="-0.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="0.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="1.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><path d="M-2.8,-2.5 Q-3.5,-2 -3.2,-1" stroke="${c.cowSpot}" fill="none" stroke-width="0.25"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/><ellipse cx="0.3" cy="-2.3" rx="1.2" ry="0.9" fill="${c.cowSpot}"/><ellipse cx="-2.5" cy="-2.8" rx="0.9" ry="0.7" fill="${c.cow}"/><ellipse cx="-3.2" cy="-2.6" rx="0.5" ry="0.4" fill="${c.cowSpot}" opacity="0.5"/><line x1="-2.8" y1="-3.4" x2="-3.2" y2="-4" stroke="${c.fence}" stroke-width="0.3"/><line x1="-2.2" y1="-3.4" x2="-1.8" y2="-4" stroke="${c.fence}" stroke-width="0.3"/><circle cx="-2.3" cy="-3" r="0.12" fill="#222"/><rect x="-1.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="-0.3" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="0.7" y="-0.8" width="0.5" height="1" fill="${c.cow}"/><rect x="1.5" y="-0.8" width="0.5" height="1" fill="${c.cow}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.2" rx="2.8" ry="1.6" fill="${c.cow}"/><ellipse cx="0.8" cy="-2.5" rx="1" ry="0.7" fill="${c.cowSpot}"/><ellipse cx="-0.8" cy="-1.7" rx="0.6" ry="0.5" fill="${c.cowSpot}"/><ellipse cx="-2.5" cy="-2.8" rx="0.9" ry="0.7" fill="${c.cow}"/><ellipse cx="-3" cy="-2.6" rx="0.45" ry="0.35" fill="${c.cowSpot}" opacity="0.5"/><line x1="-2.8" y1="-3.4" x2="-3.3" y2="-4" stroke="${c.fence}" stroke-width="0.3"/><line x1="-2.2" y1="-3.4" x2="-1.7" y2="-4" stroke="${c.fence}" stroke-width="0.3"/><ellipse cx="-2" cy="-3.3" rx="0.25" ry="0.4" fill="${c.cow}"/><circle cx="-2.4" cy="-3" r="0.12" fill="#222"/><ellipse cx="0.5" cy="-0.9" rx="0.6" ry="0.3" fill="${c.cowSpot}" opacity="0.4"/><rect x="-1.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/><rect x="-0.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/><rect x="0.5" y="-0.8" width="0.55" height="1" fill="${c.cow}"/><rect x="1.4" y="-0.8" width="0.55" height="1" fill="${c.cow}"/><path d="M2.8,-2.5 Q3.5,-2 3.2,-1" stroke="${c.cowSpot}" fill="none" stroke-width="0.3"/><ellipse cx="3.2" cy="-0.9" rx="0.3" ry="0.2" fill="${c.cowSpot}"/></g>`;
}
var init_farm_sheep = __esm({
  "src/themes/terrain/assets/renderers/farm-sheep.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/farm-chicken.ts
function svgChicken(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.1" rx="1" ry="0.25" fill="${c.shadow}" opacity="0.1"/><ellipse cx="0" cy="-1.3" rx="1.3" ry="1" fill="${c.chicken}"/><path d="M1.2,-1.5 Q2,-2 1.8,-2.8 Q1.5,-2.5 1.3,-1.8" fill="${c.chicken}"/><ellipse cx="0.2" cy="-1.4" rx="0.7" ry="0.5" fill="${c.trunk}" opacity="0.3"/><circle cx="-1.2" cy="-0.8" r="0.55" fill="${c.chicken}"/><path d="M-1.2,-1.3 Q-1,-1.7 -0.9,-1.3 Q-0.7,-1.6 -0.6,-1.2" fill="${c.flag}"/><circle cx="-1.1" cy="-0.85" r="0.1" fill="#222"/><polygon points="-1.5,-0.7 -1.9,-0.6 -1.5,-0.5" fill="${c.wheat}"/><ellipse cx="-1.3" cy="-0.5" rx="0.12" ry="0.2" fill="${c.flag}"/><line x1="-0.3" y1="-0.3" x2="-0.4" y2="0.3" stroke="${c.wheat}" stroke-width="0.2"/><line x1="0.4" y1="-0.3" x2="0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.2"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="1.4" ry="1.1" fill="${c.chicken}"/><path d="M1.3,-1.8 Q2,-2.5 1.8,-3.2" fill="${c.chicken}"/><circle cx="-1.2" cy="-2.2" r="0.6" fill="${c.chicken}"/><path d="M-1.2,-2.8 Q-1,-3.2 -0.85,-2.8 Q-0.7,-3.1 -0.6,-2.7" fill="${c.flag}"/><circle cx="-1" cy="-2.25" r="0.1" fill="#222"/><polygon points="-1.7,-2.1 -2.1,-2 -1.7,-1.9" fill="${c.wheat}"/><circle cx="2.2" cy="-0.5" r="0.4" fill="${c.wheat}"/><circle cx="2.4" cy="-0.55" r="0.08" fill="#222"/><polygon points="2.5,-0.5 2.7,-0.45 2.5,-0.4" fill="${c.flag}" opacity="0.8"/><circle cx="3" cy="-0.6" r="0.35" fill="${c.wheat}"/><circle cx="3.15" cy="-0.65" r="0.07" fill="#222"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.1" rx="1" ry="0.25" fill="${c.shadow}" opacity="0.1"/><ellipse cx="0" cy="-1.5" rx="1.3" ry="1.1" fill="${c.chicken}"/><path d="M1.2,-1.8 Q1.8,-2.5 1.6,-3.3 Q1.3,-2.8 1.1,-2" fill="${c.chicken}"/><ellipse cx="0.3" cy="-1.6" rx="0.6" ry="0.45" fill="${c.trunk}" opacity="0.25"/><circle cx="-1" cy="-2.4" r="0.65" fill="${c.chicken}"/><path d="M-1,-3.1 Q-0.8,-3.5 -0.7,-3 Q-0.5,-3.4 -0.4,-2.9 Q-0.2,-3.2 -0.1,-2.8" fill="${c.flag}"/><circle cx="-0.85" cy="-2.45" r="0.12" fill="#222"/><polygon points="-1.6,-2.3 -2,-2.2 -1.6,-2.1" fill="${c.wheat}"/><ellipse cx="-1.15" cy="-2" rx="0.15" ry="0.25" fill="${c.flag}"/><line x1="-0.4" y1="-0.4" x2="-0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.25"/><line x1="0.4" y1="-0.4" x2="0.5" y2="0.3" stroke="${c.wheat}" stroke-width="0.25"/><path d="M-0.7,0.3 L-0.5,0.3 L-0.3,0.3" stroke="${c.wheat}" stroke-width="0.15" fill="none"/><path d="M0.3,0.3 L0.5,0.3 L0.7,0.3" stroke="${c.wheat}" stroke-width="0.15" fill="none"/></g>`;
}
function svgHorse(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.5" rx="2.5" ry="1.4" fill="${c.horse}"/><path d="M-2,-2.5 Q-2.5,-3.5 -2.2,-4.5 Q-2,-5 -1.5,-5.5" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.2"/><ellipse cx="-1.2" cy="-5.8" rx="0.9" ry="0.5" fill="${c.horse}"/><path d="M-2,-3.5 Q-2.5,-4 -2.3,-4.5 Q-2,-5 -1.5,-5.3" stroke="${c.trunk}" fill="none" stroke-width="0.5"/><polygon points="-1.4,-6.3 -1.2,-6.8 -1,-6.3" fill="${c.horse}"/><circle cx="-1" cy="-5.8" r="0.12" fill="#222"/><rect x="-1.5" y="-1.3" width="0.5" height="1.8" fill="${c.horse}" transform="rotate(-20 -1.5 -1.3)"/><rect x="-0.5" y="-1.3" width="0.5" height="1.5" fill="${c.horse}" transform="rotate(15 -0.5 -1.3)"/><rect x="1" y="-1.3" width="0.5" height="1.5" fill="${c.horse}"/><rect x="1.8" y="-1.3" width="0.5" height="1.8" fill="${c.horse}" transform="rotate(-10 1.8 -1.3)"/><path d="M2.5,-2.8 Q3.5,-2.5 3.8,-1.5 Q4,-0.5 3.5,0" stroke="${c.trunk}" fill="none" stroke-width="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0.5" cy="-0.2" rx="1.5" ry="0.4" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-3" rx="2.2" ry="1.3" fill="${c.horse}" transform="rotate(-25 0 -3)"/><path d="M-1.5,-3.5 Q-2,-5 -1.5,-6" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.1"/><ellipse cx="-1.2" cy="-6.5" rx="0.85" ry="0.5" fill="${c.horse}"/><path d="M-1.8,-4.5 Q-2.3,-5 -2,-5.8" stroke="${c.trunk}" fill="none" stroke-width="0.5"/><polygon points="-1.4,-7 -1.2,-7.5 -1,-7" fill="${c.horse}"/><rect x="-1.2" y="-2.5" width="0.45" height="1.8" fill="${c.horse}" transform="rotate(-60 -1.2 -2.5)"/><rect x="-0.3" y="-2.5" width="0.45" height="1.6" fill="${c.horse}" transform="rotate(-45 -0.3 -2.5)"/><rect x="0.8" y="-1.5" width="0.5" height="1.7" fill="${c.horse}"/><rect x="1.5" y="-1.5" width="0.5" height="1.7" fill="${c.horse}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2.2" ry="0.5" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2.5" rx="2.5" ry="1.4" fill="${c.horse}"/><path d="M-2,-2.8 Q-2.3,-4 -2,-5" fill="${c.horse}" stroke="${c.horse}" stroke-width="1.2"/><ellipse cx="-1.6" cy="-5.5" rx="1" ry="0.55" fill="${c.horse}"/><ellipse cx="-2.4" cy="-5.3" rx="0.4" ry="0.3" fill="${c.horse}"/><path d="M-1.8,-3.5 Q-2.5,-4 -2.2,-4.8 Q-2,-5.3 -1.5,-5.5" stroke="${c.trunk}" fill="none" stroke-width="0.6"/><polygon points="-1.8,-6 -1.6,-6.5 -1.4,-6" fill="${c.horse}"/><polygon points="-1.3,-6 -1.1,-6.4 -0.9,-6" fill="${c.horse}"/><circle cx="-1.4" cy="-5.5" r="0.12" fill="#222"/><circle cx="-2.5" cy="-5.2" r="0.08" fill="#333"/><rect x="-1.4" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/><rect x="-0.5" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/><rect x="0.6" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/><rect x="1.5" y="-1.2" width="0.5" height="1.4" fill="${c.horse}"/><rect x="-1.45" y="0" width="0.55" height="0.25" fill="${c.trunk}"/><rect x="-0.55" y="0" width="0.55" height="0.25" fill="${c.trunk}"/><rect x="0.55" y="0" width="0.55" height="0.25" fill="${c.trunk}"/><rect x="1.45" y="0" width="0.55" height="0.25" fill="${c.trunk}"/><path d="M2.5,-2.8 Q3.2,-2.5 3,-1.5 Q2.8,-0.5 3.2,0" stroke="${c.trunk}" fill="none" stroke-width="0.6"/></g>`;
}
var init_farm_chicken = __esm({
  "src/themes/terrain/assets/renderers/farm-chicken.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/farm-donkey.ts
function svgDonkey(x, y, c, v) {
  const body = c.donkey || "#808080";
  const dark = "#505050";
  const muzzle = "#a0a0a0";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2" ry="0.4" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${body}"/><path d="M-1.5,-2.2 Q-2,-3.2 -1.6,-4" fill="${body}" stroke="${body}" stroke-width="0.9"/><ellipse cx="-1.3" cy="-4.3" rx="0.85" ry="0.5" fill="${body}"/><ellipse cx="-2" cy="-4.1" rx="0.4" ry="0.3" fill="${muzzle}"/><ellipse cx="-1.6" cy="-5.2" rx="0.2" ry="0.6" fill="${body}"/><ellipse cx="-1" cy="-5.1" rx="0.2" ry="0.55" fill="${body}"/><circle cx="-1.2" cy="-4.4" r="0.1" fill="#222"/><rect x="-1.2" y="-0.9" width="0.45" height="1.2" fill="${body}"/><rect x="-0.3" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="0.5" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="1.2" y="-0.9" width="0.45" height="1.2" fill="${body}"/><rect x="-1.25" y="0.1" width="0.5" height="0.2" fill="${dark}"/><rect x="1.15" y="0.1" width="0.5" height="0.2" fill="${dark}"/><path d="M2.2,-2.2 Q2.8,-2 2.5,-1" stroke="${dark}" fill="none" stroke-width="0.35"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2" ry="0.4" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2" rx="2.2" ry="1.2" fill="${body}"/><line x1="-1" y1="-2.8" x2="1.5" y2="-2.8" stroke="${dark}" stroke-width="0.3"/><path d="M-1.5,-2.2 Q-2,-3.2 -1.6,-4" fill="${body}" stroke="${body}" stroke-width="0.9"/><ellipse cx="-1.3" cy="-4.3" rx="0.85" ry="0.5" fill="${body}"/><ellipse cx="-2" cy="-4.1" rx="0.4" ry="0.3" fill="${muzzle}"/><ellipse cx="-1.6" cy="-5.2" rx="0.2" ry="0.65" fill="${body}"/><ellipse cx="-1.6" cy="-5.2" rx="0.12" ry="0.5" fill="${muzzle}" opacity="0.5"/><ellipse cx="-1" cy="-5.1" rx="0.2" ry="0.6" fill="${body}"/><ellipse cx="-1" cy="-5.1" rx="0.12" ry="0.45" fill="${muzzle}" opacity="0.5"/><circle cx="-1.2" cy="-4.4" r="0.1" fill="#222"/><circle cx="-2.1" cy="-4" r="0.06" fill="#333"/><rect x="-1.2" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="-0.3" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="0.5" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="1.2" y="-0.9" width="0.45" height="1.1" fill="${body}"/><rect x="-1.25" y="0" width="0.5" height="0.2" fill="${dark}"/><rect x="-0.35" y="0" width="0.5" height="0.2" fill="${dark}"/><rect x="0.45" y="0" width="0.5" height="0.2" fill="${dark}"/><rect x="1.15" y="0" width="0.5" height="0.2" fill="${dark}"/><path d="M2.2,-2.2 Q2.8,-2 2.5,-1" stroke="${dark}" fill="none" stroke-width="0.35"/><ellipse cx="2.5" cy="-0.9" rx="0.25" ry="0.2" fill="${dark}"/></g>`;
}
function svgGoat(x, y, c, v) {
  const body = c.goat || "#e8e0d0";
  const horn = c.goatHorn || "#b0a090";
  const dark = "#8a7a60";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${body}"/><ellipse cx="-2" cy="-1.2" rx="0.65" ry="0.5" fill="${body}"/><path d="M-2.3,-1.5 Q-2.8,-2.2 -2.5,-2.8" stroke="${horn}" fill="none" stroke-width="0.25"/><path d="M-1.8,-1.5 Q-1.3,-2.2 -1.6,-2.6" stroke="${horn}" fill="none" stroke-width="0.25"/><path d="M-2.4,-1 Q-2.6,-0.5 -2.4,-0.2" stroke="${dark}" fill="none" stroke-width="0.2"/><circle cx="-1.9" cy="-1.3" r="0.08" fill="#222"/><rect x="-0.8" y="-0.8" width="0.4" height="1" fill="${body}"/><rect x="0.5" y="-0.8" width="0.4" height="1" fill="${body}"/><ellipse cx="2" cy="-2" rx="0.3" ry="0.2" fill="${body}"/></g>`;
  }
  if (v === 2) {
    const brownBody = "#c0a880";
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${brownBody}"/><path d="M-1.5,-2 Q-1.8,-2.8 -1.5,-3.2" fill="${brownBody}" stroke="${brownBody}" stroke-width="0.6"/><ellipse cx="-1.3" cy="-3.5" rx="0.6" ry="0.45" fill="${brownBody}"/><path d="M-1.6,-3.8 Q-2,-4.5 -1.7,-5" stroke="${horn}" fill="none" stroke-width="0.25"/><path d="M-1.1,-3.8 Q-0.7,-4.5 -1,-4.9" stroke="${horn}" fill="none" stroke-width="0.25"/><ellipse cx="-0.85" cy="-3.6" rx="0.3" ry="0.15" fill="${brownBody}" transform="rotate(20 -0.85 -3.6)"/><path d="M-1.6,-3.3 Q-1.8,-2.8 -1.6,-2.4" stroke="${dark}" fill="none" stroke-width="0.2"/><circle cx="-1.15" cy="-3.55" r="0.08" fill="#222"/><rect x="-1" y="-0.8" width="0.4" height="1" fill="${brownBody}"/><rect x="-0.2" y="-0.8" width="0.4" height="1" fill="${brownBody}"/><rect x="0.5" y="-0.8" width="0.4" height="1" fill="${brownBody}"/><rect x="1.1" y="-0.8" width="0.4" height="1" fill="${brownBody}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.35" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-1.8" rx="2" ry="1.1" fill="${body}"/><path d="M-1.5,-2 Q-1.8,-2.8 -1.5,-3.2" fill="${body}" stroke="${body}" stroke-width="0.6"/><ellipse cx="-1.3" cy="-3.5" rx="0.6" ry="0.45" fill="${body}"/><path d="M-1.6,-3.8 Q-2,-4.5 -1.7,-5" stroke="${horn}" fill="none" stroke-width="0.25"/><path d="M-1.1,-3.8 Q-0.7,-4.5 -1,-4.9" stroke="${horn}" fill="none" stroke-width="0.25"/><ellipse cx="-0.85" cy="-3.6" rx="0.3" ry="0.15" fill="${body}" transform="rotate(20 -0.85 -3.6)"/><path d="M-1.6,-3.3 Q-1.9,-2.8 -1.7,-2.3" stroke="${dark}" fill="none" stroke-width="0.2"/><path d="M-1.5,-3.2 Q-1.7,-2.7 -1.5,-2.2" stroke="${dark}" fill="none" stroke-width="0.15"/><ellipse cx="-1.15" cy="-3.55" rx="0.1" ry="0.06" fill="#222"/><ellipse cx="-1.7" cy="-3.35" rx="0.25" ry="0.18" fill="${horn}" opacity="0.5"/><rect x="-1" y="-0.8" width="0.4" height="1" fill="${body}"/><rect x="-0.2" y="-0.8" width="0.4" height="1" fill="${body}"/><rect x="0.5" y="-0.8" width="0.4" height="1" fill="${body}"/><rect x="1.1" y="-0.8" width="0.4" height="1" fill="${body}"/><rect x="-1.05" y="0" width="0.45" height="0.2" fill="${dark}"/><rect x="-0.25" y="0" width="0.45" height="0.2" fill="${dark}"/><rect x="0.45" y="0" width="0.45" height="0.2" fill="${dark}"/><rect x="1.05" y="0" width="0.45" height="0.2" fill="${dark}"/><path d="M2,-2 Q2.3,-2.3 2.2,-2.6" stroke="${body}" fill="none" stroke-width="0.25"/></g>`;
}
function svgRicePaddy(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-4,-1 0,-3 4,-1 0,1" fill="${c.ricePaddy}" stroke="${c.ricePaddy}" stroke-width="0.3"/><polygon points="-3,-0.8 0,-2.4 3,-0.8 0,0.6" fill="${c.ricePaddyWater}" opacity="0.6"/><line x1="-1.5" y1="-0.6" x2="1.5" y2="-1.8" stroke="#fff" stroke-width="0.2" opacity="0.25"/><line x1="-1" y1="0" x2="2" y2="-1.2" stroke="#fff" stroke-width="0.2" opacity="0.2"/><line x1="-2" y1="-0.3" x2="1" y2="-1.5" stroke="#fff" stroke-width="0.2" opacity="0.15"/><line x1="-2.5" y1="-0.5" x2="-2.5" y2="-2" stroke="${c.reeds}" stroke-width="0.3"/><line x1="-0.8" y1="-1.8" x2="-0.8" y2="-3.3" stroke="${c.reeds}" stroke-width="0.3"/><line x1="1" y1="-1.5" x2="1" y2="-3" stroke="${c.reeds}" stroke-width="0.3"/><line x1="2.5" y1="-0.5" x2="2.5" y2="-2" stroke="${c.reeds}" stroke-width="0.3"/></g>`;
}
function svgSilo(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1.2" y="-7" width="2.4" height="7" fill="${c.silo}"/><ellipse cx="0" cy="-7" rx="1.2" ry="0.5" fill="${c.silo}" opacity="0.8"/><polygon points="-1.2,-7 0,-8.5 1.2,-7" fill="${c.roofA}"/></g>`;
}
var init_farm_donkey = __esm({
  "src/themes/terrain/assets/renderers/farm-donkey.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/farm-pigpen.ts
function svgPigpen(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-1" width="5" height="1" fill="${c.fence}" opacity="0.5"/><ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.pig}"/><circle cx="-1" cy="-1.3" r="0.4" fill="${c.pig}"/><ellipse cx="-1.3" cy="-1.2" rx="0.25" ry="0.15" fill="#eaa"/></g>`;
}
function svgTrough(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-1" width="4" height="0.8" fill="${c.trough}"/><line x1="-1.5" y1="-0.2" x2="-1.5" y2="0.5" stroke="${c.trunk}" stroke-width="0.3"/><line x1="1.5" y1="-0.2" x2="1.5" y2="0.5" stroke="${c.trunk}" stroke-width="0.3"/><rect x="-1.8" y="-0.8" width="3.6" height="0.5" fill="${c.tidePools}" opacity="0.4"/></g>`;
}
function svgHaystack(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-2,0 2,0 1.5,-3 -1.5,-3" fill="${c.haystack}"/><polygon points="-1.5,-3 0,-4.5 1.5,-3" fill="${c.haystack}"/></g>`;
}
function svgOrchard(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-3" stroke="${c.trunk}" stroke-width="0.6"/><circle cx="0" cy="-5" r="2.5" fill="${c.orchard}"/><circle cx="-1" cy="-4.5" r="0.35" fill="${c.orchardFruit}"/><circle cx="0.8" cy="-5.2" r="0.35" fill="${c.orchardFruit}"/><circle cx="0" cy="-3.8" r="0.3" fill="${c.orchardFruit}"/></g>`;
}
function svgAppleTree(x, y, c, v) {
  const leaf = c.orchard;
  const apple = c.appleRed || "#c41e3a";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/><circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/><circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/><circle cx="-1" cy="-4" r="0.35" fill="${apple}"/><circle cx="0.5" cy="-5" r="0.35" fill="${apple}"/><circle cx="1.2" cy="-4" r="0.3" fill="${apple}"/><circle cx="-0.3" cy="-3.5" r="0.3" fill="${apple}"/><circle cx="0" cy="-5.5" r="0.3" fill="${apple}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.3" fill="${leaf}"/><circle cx="-1.2" cy="-3.5" r="1.3" fill="${leaf}" opacity="0.9"/><circle cx="1.2" cy="-3.5" r="1.3" fill="${leaf}" opacity="0.85"/><circle cx="-0.5" cy="-4.5" r="0.3" fill="${apple}"/><circle cx="0.8" cy="-4" r="0.3" fill="${apple}"/><circle cx="-1.5" cy="0.3" r="0.25" fill="${apple}" opacity="0.8"/><circle cx="0.8" cy="0.5" r="0.25" fill="${apple}" opacity="0.75"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/><circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/><circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/><circle cx="-1" cy="-4.2" r="0.35" fill="${apple}"/><circle cx="0.6" cy="-5" r="0.35" fill="${apple}"/><circle cx="0" cy="-3.8" r="0.3" fill="${apple}"/></g>`;
}
function svgOliveTree(x, y, c, v) {
  const leaf = c.oliveGreen || "#808060";
  const fruit = c.oliveFruit || "#4a4a30";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M-0.3,2 Q-0.8,0 -0.5,-1 Q-0.2,-2 0,-2" stroke="${trunk}" fill="none" stroke-width="0.8"/><path d="M0.3,2 Q0.8,0 0.5,-1 Q0.2,-2 0,-2" stroke="${trunk}" fill="none" stroke-width="0.8"/><ellipse cx="0" cy="-4" rx="2.5" ry="1.8" fill="${leaf}" opacity="0.7"/><ellipse cx="-1.5" cy="-3.5" rx="1.2" ry="0.9" fill="${leaf}" opacity="0.6"/><ellipse cx="1.5" cy="-3.5" rx="1.2" ry="0.9" fill="${leaf}" opacity="0.55"/><circle cx="-0.8" cy="-3.8" r="0.2" fill="${fruit}"/><circle cx="0.5" cy="-4.2" r="0.2" fill="${fruit}"/><circle cx="1" cy="-3.5" r="0.18" fill="${fruit}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/><ellipse cx="0" cy="-3.5" rx="2.2" ry="1.6" fill="${leaf}" opacity="0.7"/><ellipse cx="-1.2" cy="-3" rx="1" ry="0.8" fill="${leaf}" opacity="0.6"/><ellipse cx="1.2" cy="-3" rx="1" ry="0.8" fill="${leaf}" opacity="0.55"/><circle cx="-0.5" cy="-3.5" r="0.18" fill="${fruit}"/><circle cx="0.6" cy="-3.8" r="0.18" fill="${fruit}"/></g>`;
}
function svgLemonTree(x, y, c, v) {
  const leaf = c.palm;
  const lemon = c.lemonYellow || "#fff44f";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="2.5" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2" fill="${leaf}"/><circle cx="-1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.9"/><circle cx="1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.85"/><ellipse cx="-0.8" cy="-3.5" rx="0.35" ry="0.25" fill="${lemon}"/><ellipse cx="0.5" cy="-4" rx="0.35" ry="0.25" fill="${lemon}"/><ellipse cx="0.8" cy="-3" rx="0.3" ry="0.22" fill="${lemon}"/><ellipse cx="-0.2" cy="-2.8" rx="0.3" ry="0.22" fill="${lemon}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="2.5" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2" fill="${leaf}"/><circle cx="-1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.9"/><circle cx="1" cy="-2.8" r="1.2" fill="${leaf}" opacity="0.85"/><ellipse cx="-0.5" cy="-3.5" rx="0.3" ry="0.22" fill="${lemon}"/><ellipse cx="0.6" cy="-3.8" rx="0.3" ry="0.22" fill="${lemon}"/></g>`;
}
function svgOrangeTree(x, y, c, v) {
  const leaf = c.orchard;
  const orange = c.orangeFruit || "#ff8c00";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.2" r="2.3" fill="${leaf}"/><circle cx="-1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/><circle cx="1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/><circle cx="-0.8" cy="-4" r="0.4" fill="${orange}"/><circle cx="0.5" cy="-4.5" r="0.35" fill="${orange}"/><circle cx="1" cy="-3.5" r="0.35" fill="${orange}"/><circle cx="-0.2" cy="-3.2" r="0.3" fill="${orange}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.2" r="2.3" fill="${leaf}"/><circle cx="-1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/><circle cx="1.3" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/><circle cx="-0.6" cy="-4" r="0.4" fill="${orange}"/><circle cx="0.7" cy="-4.3" r="0.35" fill="${orange}"/></g>`;
}
var init_farm_pigpen = __esm({
  "src/themes/terrain/assets/renderers/farm-pigpen.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/farm-pear-tree.ts
function svgPearTree(x, y, c, v) {
  const leaf = c.orchard;
  const pear = c.pearGreen || "#d1e231";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/><circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/><circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/><path d="M-0.8,-4.3 Q-0.8,-4.8 -0.6,-4.8 Q-0.4,-4.8 -0.4,-4.3 Q-0.4,-3.8 -0.6,-3.6 Q-0.8,-3.8 -0.8,-4.3" fill="${pear}"/><path d="M0.6,-4.8 Q0.6,-5.3 0.8,-5.3 Q1,-5.3 1,-4.8 Q1,-4.3 0.8,-4.1 Q0.6,-4.3 0.6,-4.8" fill="${pear}"/><path d="M0.3,-3.5 Q0.3,-4 0.5,-4 Q0.7,-4 0.7,-3.5 Q0.7,-3 0.5,-2.8 Q0.3,-3 0.3,-3.5" fill="${pear}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.5" fill="${leaf}"/><circle cx="-1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.9"/><circle cx="1.5" cy="-3.5" r="1.5" fill="${leaf}" opacity="0.85"/><path d="M-0.6,-4.5 Q-0.6,-5 -0.4,-5 Q-0.2,-5 -0.2,-4.5 Q-0.2,-4 -0.4,-3.8 Q-0.6,-4 -0.6,-4.5" fill="${pear}"/><path d="M0.7,-4 Q0.7,-4.5 0.9,-4.5 Q1.1,-4.5 1.1,-4 Q1.1,-3.5 0.9,-3.3 Q0.7,-3.5 0.7,-4" fill="${pear}"/></g>`;
}
function svgPeachTree(x, y, c, v) {
  const leaf = c.orchard;
  const peach = c.peachFruit || "#ffcba4";
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4" r="2.2" fill="${leaf}"/><circle cx="-1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/><circle cx="1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/><circle cx="-0.6" cy="-4" r="0.4" fill="${peach}"/><circle cx="0.5" cy="-4.3" r="0.35" fill="${peach}"/><circle cx="0.8" cy="-3.3" r="0.35" fill="${peach}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><circle cx="0" cy="-4" r="2.2" fill="${leaf}"/><circle cx="-1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.9"/><circle cx="1.2" cy="-3.2" r="1.3" fill="${leaf}" opacity="0.85"/><circle cx="-0.5" cy="-4" r="0.35" fill="${peach}"/><circle cx="0.6" cy="-4.2" r="0.35" fill="${peach}"/></g>`;
}
function svgBeeFarm(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-2.5" width="3" height="2.5" fill="${c.beeFarm}"/><rect x="-1.5" y="-2.5" width="3" height="0.8" fill="${c.beeFarm}" stroke="${c.trunk}" stroke-width="0.2"/><rect x="-1.5" y="-1.7" width="3" height="0.8" fill="${c.beeFarm}" stroke="${c.trunk}" stroke-width="0.2"/><polygon points="-1.5,-2.5 0,-3.5 1.5,-2.5" fill="${c.roofB}"/></g>`;
}
function svgPumpkin(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.8" rx="1.5" ry="1" fill="${c.pumpkin}"/><ellipse cx="-0.5" cy="-0.8" rx="0.8" ry="1" fill="${c.pumpkin}" opacity="0.6"/><ellipse cx="0.5" cy="-0.8" rx="0.8" ry="1" fill="${c.pumpkin}" opacity="0.6"/><line x1="0" y1="-1.8" x2="0.3" y2="-2.3" stroke="${c.pine}" stroke-width="0.3"/></g>`;
}
var init_farm_pear_tree = __esm({
  "src/themes/terrain/assets/renderers/farm-pear-tree.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/village-tent.ts
function svgTent(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="0,-6 -3.5,0 3.5,0" fill="${c.tent}"/><polygon points="0,-6 -1.5,0 1.5,0" fill="${c.tentStripe}" opacity="0.6"/><line x1="0" y1="-6" x2="0" y2="-7" stroke="${c.trunk}" stroke-width="0.3"/></g>`;
}
function svgHut(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1.5" rx="2" ry="1.5" fill="${c.hut}"/><polygon points="-2.2,-1.5 0,-5 2.2,-1.5" fill="${c.roofB}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2" y="-3" width="4" height="3" fill="${c.hut}"/><polygon points="-2.5,-3 0,-5.5 2.5,-3" fill="${c.roofB}"/><rect x="2.5" y="-1.5" width="2" height="1.5" fill="${c.hut}" opacity="0.6"/><line x1="2.5" y1="-1.5" x2="4.5" y2="-1.5" stroke="${c.roofB}" stroke-width="0.3"/><line x1="4.5" y1="-1.5" x2="4.5" y2="0" stroke="${c.trunk}" stroke-width="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-3" width="4" height="3" fill="${c.hut}"/><polygon points="-2.5,-3 0,-5.5 2.5,-3" fill="${c.roofB}"/></g>`;
}
function svgHouse(x, y, c, v, roofColor) {
  const roofOptions = [roofColor || c.roofA, "#4477aa", "#448844"];
  const roof = roofOptions[v] || roofOptions[0];
  return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/><polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/><polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${roof}"/><rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/></g>`;
}
function svgHouseB(x, y, c, v) {
  return svgHouse(x, y, c, v, c.roofB);
}
function svgChurch(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/><polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/><rect x="-1" y="-8.5" width="2" height="3.5" fill="${c.church}"/><polygon points="-1.3,-8.5 0,-10.5 1.3,-8.5" fill="${c.roofA}"/><circle cx="0" cy="-7" r="0.4" fill="${c.blacksmith}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-3" width="3" height="3" fill="${c.church}"/><polygon points="-2,-3 0,-5 2,-3" fill="${c.roofA}"/><line x1="0" y1="-5.5" x2="0" y2="-5" stroke="${c.wall}" stroke-width="0.4"/><line x1="-0.5" y1="-5.2" x2="0.5" y2="-5.2" stroke="${c.wall}" stroke-width="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/><polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/><polygon points="0,-10 -2.5,-5 0,-3.8 2.5,-5" fill="${c.roofA}"/><line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/><line x1="-1" y1="-11" x2="1" y2="-11" stroke="${c.wall}" stroke-width="0.5"/></g>`;
}
function svgWindmill(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-1.5,0 1.5,0 1,-7 -1,-7" fill="${c.windmill}"/><g><line x1="0" y1="-11" x2="0" y2="-3" stroke="${c.windBlade}" stroke-width="0.5"/><line x1="-4" y1="-7" x2="4" y2="-7" stroke="${c.windBlade}" stroke-width="0.5"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="rotate" from="0 0 -7" to="360 0 -7" dur="8s" repeatCount="indefinite"/>`
  ) + `</g><circle cx="0" cy="-7" r="0.7" fill="${c.roofA}"/></g>`;
}
function svgWell(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.3" rx="2.3" ry="1.2" fill="${c.rock}"/><ellipse cx="0" cy="-0.6" rx="2.1" ry="1" fill="${c.well}" stroke="${c.boulder}" stroke-width="0.3"/><ellipse cx="-1.2" cy="-0.5" rx="0.5" ry="0.25" fill="${c.boulder}" opacity="0.6"/><ellipse cx="0.8" cy="-0.4" rx="0.6" ry="0.3" fill="${c.boulder}" opacity="0.5"/><ellipse cx="-0.2" cy="-0.7" rx="0.4" ry="0.2" fill="${c.rock}" opacity="0.4"/><ellipse cx="0" cy="-0.6" rx="1.4" ry="0.6" fill="${c.shadow}" opacity="0.8"/><rect x="-1.7" y="-4.2" width="0.4" height="3.7" fill="${c.trunk}"/><rect x="1.3" y="-4.2" width="0.4" height="3.7" fill="${c.trunk}"/><rect x="-1.8" y="-4.4" width="3.6" height="0.35" fill="${c.trunk}"/><polygon points="0,-5.8 -2.5,-4.2 2.5,-4.2" fill="${c.roofB}"/><line x1="0" y1="-5.8" x2="-2.5" y2="-4.2" stroke="${c.shadow}" stroke-width="0.15" opacity="0.3"/><ellipse cx="0" cy="-4" rx="0.5" ry="0.2" fill="${c.fence}"/><rect x="-0.5" y="-4.2" width="1" height="0.4" fill="${c.fence}"/><path d="M0,-4 Q0.3,-3 0,-2 Q-0.2,-1.5 0,-1" stroke="${c.fence}" stroke-width="0.15" fill="none"/><path d="M-0.35,-1.3 L-0.3,-0.6 L0.3,-0.6 L0.35,-1.3 Z" fill="${c.barrel}"/><ellipse cx="0" cy="-1.3" rx="0.35" ry="0.12" fill="${c.cart}"/></g>`;
}
function svgTavern(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3.5 0,-2.3 -2.5,-3.5" fill="${c.tavern}"/><polygon points="-2.5,0 0,1.2 0,-2.3 -2.5,-3.5" fill="${c.wallShade}"/><polygon points="0,-6 -3,-3.3 0,-2 3,-3.3" fill="${c.roofB}"/><rect x="3" y="-5" width="1.5" height="1.2" fill="${c.tavernSign}" rx="0.2"/><circle cx="3.75" cy="-4.4" r="0.3" fill="${c.wheat}"/></g>`;
}
function svgBakery(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-3.5" width="5" height="3.5" fill="${c.bakery}"/><polygon points="-3,-3.5 0,-5.5 3,-3.5" fill="${c.roofA}"/><rect x="1.5" y="-6.5" width="0.8" height="1.5" fill="${c.chimney}"/><circle cx="1.9" cy="-7.5" r="0.6" fill="${c.smoke}">` + motionMarkup(
    `<animate attributeName="cy" values="-7.5;-9.5;-7.5" dur="3s" repeatCount="indefinite"/>`
  ) + motionMarkup(
    `<animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>`
  ) + `</circle></g>`;
}
function svgStable(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-3" width="6" height="3" fill="${c.stable}"/><polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.roofB}"/><rect x="-1" y="-2" width="2" height="2" fill="${c.trunk}" opacity="0.6"/></g>`;
}
function svgGarden(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-0.3" width="6" height="0.3" fill="${c.gardenFence}" opacity="0.5"/><line x1="-3" y1="-0.3" x2="-3" y2="-1.5" stroke="${c.gardenFence}" stroke-width="0.3"/><line x1="3" y1="-0.3" x2="3" y2="-1.5" stroke="${c.gardenFence}" stroke-width="0.3"/><line x1="-3" y1="-1" x2="3" y2="-1" stroke="${c.gardenFence}" stroke-width="0.2"/><circle cx="-1.5" cy="-0.8" r="0.4" fill="${c.flower}"/><circle cx="0" cy="-0.6" r="0.35" fill="${c.wildflower}"/><circle cx="1.5" cy="-0.7" r="0.4" fill="${c.butterflyWing}"/></g>`;
}
function svgLaundry(x, y, c, _v) {
  return `<g transform="translate(${x},${y})" ${motionMarkup('class="sway-slow"')}><line x1="-3" y1="0" x2="-3" y2="-4" stroke="${c.trunk}" stroke-width="0.4"/><line x1="3" y1="0" x2="3" y2="-4" stroke="${c.trunk}" stroke-width="0.4"/><line x1="-3" y1="-3.5" x2="3" y2="-3.5" stroke="${c.trunk}" stroke-width="0.2"/><rect x="-2" y="-3.5" width="1.5" height="2" fill="${c.laundry}" rx="0.1"/><rect x="0" y="-3.5" width="1.2" height="1.8" fill="${c.sail}" rx="0.1"/></g>`;
}
function svgDoghouse(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-2" width="3" height="2" fill="${c.doghouse}"/><polygon points="-1.8,-2 0,-3.2 1.8,-2" fill="${c.roofA}"/><ellipse cx="0" cy="-0.5" rx="0.5" ry="0.6" fill="${c.trunk}" opacity="0.6"/><ellipse cx="2.5" cy="-0.5" rx="0.7" ry="0.5" fill="${c.deer}"/></g>`;
}
var init_village_tent = __esm({
  "src/themes/terrain/assets/renderers/village-tent.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/village-shrine.ts
function svgShrine(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-0.8" y="-3" width="1.6" height="3" fill="${c.shrine}"/><polygon points="-1.2,-3 0,-4.2 1.2,-3" fill="${c.shrine}"/><rect x="-0.3" y="-2.5" width="0.6" height="0.6" fill="${c.fountain}" rx="0.1"/></g>`;
}
function svgWagon(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-3" width="5" height="2.5" fill="${c.wagon}"/><path d="M-3,-3 Q-1.5,-5 2,-3" stroke="${c.wagon}" fill="${c.sail}" opacity="0.5" stroke-width="0.3"/><circle cx="-2" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/><circle cx="1.5" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/></g>`;
}
var init_village_shrine = __esm({
  "src/themes/terrain/assets/renderers/village-shrine.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/town-city-market.ts
function svgMarket(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-3" y="-3" width="6" height="3" fill="${c.market}"/><polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.marketAwning}"/><rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/><rect x="4" y="-1.5" width="2.5" height="1.2" fill="${c.cart}"/><circle cx="4.5" cy="0" r="0.5" fill="${c.trunk}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="-3" y1="0" x2="-3" y2="-4" stroke="${c.trunk}" stroke-width="0.5"/><line x1="3" y1="0" x2="3" y2="-4" stroke="${c.trunk}" stroke-width="0.5"/><polygon points="-3.5,-4 0,-5.5 3.5,-4" fill="${c.marketAwning}"/><rect x="-2.5" y="-1" width="5" height="0.8" fill="${c.trunk}" opacity="0.4"/><rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/><rect x="0.5" y="-1.5" width="1" height="0.8" fill="${c.wheat}" rx="0.2"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-3" width="6" height="3" fill="${c.market}"/><polygon points="-3.5,-3 0,-5 3.5,-3" fill="${c.marketAwning}"/><rect x="-2" y="-1.5" width="1" height="0.8" fill="${c.barrel}" rx="0.2"/><rect x="0.5" y="-1.5" width="1" height="0.8" fill="${c.wheat}" rx="0.2"/></g>`;
}
function svgInn(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/><polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/><polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/><rect x="-1" y="-5.5" width="1.5" height="1.5" fill="${c.wall}"/><polygon points="-1,-5.5 -0.25,-6.5 0.5,-5.5" fill="${c.roofB}"/><rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/><polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/><polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/><rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/><rect x="3.5" y="-1.5" width="2" height="0.5" fill="${c.trunk}" opacity="0.6"/><rect x="4" y="-1" width="0.5" height="1" fill="${c.trunk}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-4 0,-2.5 -3,-4" fill="${c.inn}"/><polygon points="-3,0 0,1.5 0,-2.5 -3,-4" fill="${c.wallShade}"/><polygon points="0,-7 -3.5,-3.8 0,-2.2 3.5,-3.8" fill="${c.roofB}"/><rect x="3" y="-5" width="2" height="1.5" fill="${c.innSign}" rx="0.3"/></g>`;
}
function svgBlacksmith(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-3" width="5" height="3" fill="${c.blacksmith}"/><polygon points="-3,-3 0,-5 3,-3" fill="${c.roofA}"/><polygon points="-1,-0.5 1,-0.5 1.5,-1.5 -1.5,-1.5" fill="${c.anvil}"/><circle cx="1.5" cy="-5.5" r="0.8" fill="${c.smoke}" opacity="0.5"/></g>`;
}
function svgCastle(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-6" width="6" height="6" fill="${c.castle}"/><rect x="-3" y="-7" width="1.5" height="1.2" fill="${c.castle}"/><rect x="-0.75" y="-7" width="1.5" height="1.2" fill="${c.castle}"/><rect x="1.5" y="-7" width="1.5" height="1.2" fill="${c.castle}"/><rect x="-1" y="-10" width="2" height="3.5" fill="${c.tower}"/><polygon points="-1.3,-10 0,-12 1.3,-10" fill="${c.castleRoof}"/><rect x="-0.8" y="-2" width="1.6" height="2" fill="${c.blacksmith}" rx="0.8" ry="0"/></g>`;
}
function svgTower(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-8" width="3" height="8" fill="${c.tower}"/><polygon points="-2,-8 0,-11 2,-8" fill="${c.castleRoof}"/><rect x="-0.5" y="-6" width="1" height="1.2" fill="${c.blacksmith}" rx="0.5" ry="0"/></g>`;
}
function svgBridge(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><path d="M-4,0 Q0,-2 4,0" fill="${c.bridge}" stroke="${c.trunk}" stroke-width="0.4"/><line x1="-3" y1="-0.8" x2="-3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.4"/><line x1="3" y1="-0.8" x2="3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.4"/><line x1="-3" y1="-2.5" x2="3" y2="-2.5" stroke="${c.trunk}" stroke-width="0.3"/></g>`;
}
function svgCathedral(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-6 0,-4.5 -3,-6" fill="${c.cathedral}"/><polygon points="-3,0 0,1.5 0,-4.5 -3,-6" fill="${c.wallShade}"/><polygon points="0,-10 -3.5,-5.5 0,-4 3.5,-5.5" fill="${c.roofA}"/><circle cx="0" cy="-7" r="1" fill="${c.cathedralWindow}" opacity="0.7"/><line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/><line x1="-0.8" y1="-11" x2="0.8" y2="-11" stroke="${c.wall}" stroke-width="0.4"/></g>`;
}
function svgLibrary(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-4" width="5" height="4" fill="${c.library}"/><polygon points="-3,-4 0,-6 3,-4" fill="${c.roofB}"/><rect x="-1.5" y="-3.5" width="1" height="1.5" fill="${c.blacksmith}" rx="0.2"/><rect x="0.5" y="-3.5" width="1" height="1.5" fill="${c.blacksmith}" rx="0.2"/></g>`;
}
function svgClocktower(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-10" width="3" height="10" fill="${c.clocktower}"/><polygon points="-2,-10 0,-12.5 2,-10" fill="${c.castleRoof}"/><circle cx="0" cy="-8" r="1.2" fill="${c.clockFace}"/><g><line x1="0" y1="-8" x2="0" y2="-9" stroke="${c.bird}" stroke-width="0.3"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="rotate" values="-15 0 -8;15 0 -8;-15 0 -8" dur="4s" repeatCount="indefinite"/>`
  ) + `</g><line x1="0" y1="-8" x2="0.6" y2="-7.5" stroke="${c.bird}" stroke-width="0.2"/></g>`;
}
function svgStatue(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-1" y="-1.5" width="2" height="1.5" fill="${c.rock}"/><rect x="-0.6" y="-4" width="1.2" height="2.5" fill="${c.statue}"/><circle cx="0" cy="-4.5" r="0.6" fill="${c.statue}"/></g>`;
}
function svgPark(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="2" y1="0" x2="2" y2="-3" stroke="${c.trunk}" stroke-width="0.5"/><circle cx="2" cy="-4.5" r="2" fill="${c.gardenTree}"/><rect x="-3" y="-1" width="3" height="0.5" fill="${c.parkBench}"/><line x1="-3" y1="-1" x2="-3" y2="0" stroke="${c.parkBench}" stroke-width="0.3"/><line x1="0" y1="-1" x2="0" y2="0" stroke="${c.parkBench}" stroke-width="0.3"/></g>`;
}
function svgWarehouse(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3.5" y="-3.5" width="7" height="3.5" fill="${c.warehouse}"/><polygon points="-4,-3.5 0,-5.5 4,-3.5" fill="${c.roofA}" opacity="0.8"/><rect x="-1" y="-2" width="2" height="2" fill="${c.blacksmith}" opacity="0.5"/></g>`;
}
function svgGatehouse(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-6" width="4" height="6" fill="${c.gatehouse}"/><rect x="-1" y="-4" width="2" height="4" fill="${c.blacksmith}" rx="1" ry="0"/><rect x="-3" y="-7" width="2" height="1.5" fill="${c.tower}"/><rect x="1" y="-7" width="2" height="1.5" fill="${c.tower}"/></g>`;
}
var init_town_city_market = __esm({
  "src/themes/terrain/assets/renderers/town-city-market.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/town-city-manor.ts
function svgManor(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><polygon points="-3.5,0 0,1.8 3.5,0 3.5,-4.5 0,-2.7 -3.5,-4.5" fill="${c.manor}"/><polygon points="-3.5,0 0,1.8 0,-2.7 -3.5,-4.5" fill="${c.wallShade}"/><polygon points="0,-7.5 -4,-4.2 0,-2.5 4,-4.2" fill="${c.roofA}"/><rect x="1.5" y="-7.5" width="1" height="1.5" fill="${c.chimney}"/><rect x="-3.5" y="-0.5" width="1" height="0.5" fill="${c.manorGarden}"/></g>`;
}
var init_town_city_manor = __esm({
  "src/themes/terrain/assets/renderers/town-city-manor.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/biome-blend-reeds.ts
function svgReeds(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="-1" y1="0" x2="-1.3" y2="-4" stroke="${c.reeds}" stroke-width="0.4"/><line x1="0" y1="0" x2="0.2" y2="-4.5" stroke="${c.reeds}" stroke-width="0.4"/><line x1="1" y1="0" x2="0.8" y2="-3.8" stroke="${c.reeds}" stroke-width="0.4"/><ellipse cx="-1.3" cy="-4.3" rx="0.3" ry="0.8" fill="${c.trunk}"/><ellipse cx="0.2" cy="-4.8" rx="0.3" ry="0.8" fill="${c.trunk}"/></g>`;
}
function svgFountain(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.5" rx="2.5" ry="1" fill="${c.fountain}" stroke="${c.boulder}" stroke-width="0.3"/><ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${c.fountainWater}" opacity="0.6"/><rect x="-0.4" y="-3" width="0.8" height="2.5" fill="${c.fountain}"/><line x1="0" y1="-3" x2="0" y2="-4.5" stroke="${c.fountainWater}" stroke-width="0.4" opacity="0.7">` + motionMarkup(
    `<animate attributeName="y2" values="-4.5;-5.2;-4.5" dur="2s" repeatCount="indefinite"/>`
  ) + `</line><circle cx="-0.5" cy="-3.5" r="0.3" fill="${c.fountainWater}" opacity="0.4"/><circle cx="0.5" cy="-3.8" r="0.3" fill="${c.fountainWater}" opacity="0.4"/></g>`;
}
function svgCanal(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-1" width="6" height="1" fill="${c.canal}"/><rect x="-2.5" y="-0.7" width="5" height="0.5" fill="${c.fountainWater}" opacity="0.5"/></g>`;
}
function svgWatermill(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-4" width="4" height="4" fill="${c.wall}"/><polygon points="-2.5,-4 0,-6 2.5,-4" fill="${c.roofB}"/><g><circle cx="3" cy="-2" r="2" fill="none" stroke="${c.trunk}" stroke-width="0.5"/><line x1="3" y1="-4" x2="3" y2="0" stroke="${c.trunk}" stroke-width="0.3"/><line x1="1" y1="-2" x2="5" y2="-2" stroke="${c.trunk}" stroke-width="0.3"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="rotate" from="0 3 -2" to="360 3 -2" dur="6s" repeatCount="indefinite"/>`
  ) + `</g></g>`;
}
function svgGardenTree(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/><polygon points="0,-7 -1.5,-2.5 1.5,-2.5" fill="${c.gardenTree}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/><circle cx="0" cy="-4" r="2" fill="${c.gardenTree}"/><circle cx="-0.8" cy="-4.5" r="0.4" fill="${c.flower}" opacity="0.8"/><circle cx="0.5" cy="-3.5" r="0.35" fill="${c.flower}" opacity="0.7"/><circle cx="0.8" cy="-4.8" r="0.3" fill="${c.flower}" opacity="0.6"/><circle cx="-0.3" cy="-3.2" r="0.3" fill="${c.flower}" opacity="0.7"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-2.5" stroke="${c.trunk}" stroke-width="0.5"/><circle cx="0" cy="-4" r="2" fill="${c.gardenTree}"/><circle cx="-0.8" cy="-3.5" r="1.2" fill="${c.leaf}" opacity="0.6"/></g>`;
}
function svgPondLily(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.3" rx="1.5" ry="0.6" fill="${c.pine}" opacity="0.7"/><circle cx="0.3" cy="-0.5" r="0.4" fill="${c.flower}"/></g>`;
}
var init_biome_blend_reeds = __esm({
  "src/themes/terrain/assets/renderers/biome-blend-reeds.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/cross-level-cart.ts
function svgCart(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-2" width="3.5" height="2" fill="${c.cart}"/><circle cx="-1.5" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/><circle cx="1" cy="0" r="0.8" fill="${c.trunk}" stroke="${c.fence}" stroke-width="0.2"/><line x1="2" y1="-1" x2="3.5" y2="-0.5" stroke="${c.trunk}" stroke-width="0.4"/></g>`;
}
function svgBarrel(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.1" rx="1.4" ry="0.6" fill="${c.shadow}" opacity="0.2"/><ellipse cx="0" cy="-0.3" rx="1.3" ry="0.55" fill="${c.barrel}"/><rect x="-1.3" y="-2.6" width="2.6" height="2.3" fill="${c.barrel}" rx="0.2"/><line x1="-0.6" y1="-2.5" x2="-0.6" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.3"/><line x1="0.2" y1="-2.5" x2="0.2" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.3"/><line x1="0.9" y1="-2.5" x2="0.9" y2="-0.4" stroke="${c.trunk}" stroke-width="0.1" opacity="0.25"/><ellipse cx="0" cy="-0.6" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/><ellipse cx="0" cy="-1.5" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/><ellipse cx="0" cy="-2.4" rx="1.35" ry="0.25" fill="none" stroke="${c.shadow}" stroke-width="0.25"/><ellipse cx="0" cy="-2.6" rx="1.3" ry="0.55" fill="${c.cart}"/><ellipse cx="0" cy="-2.6" rx="0.9" ry="0.35" fill="${c.barrel}" opacity="0.7"/></g>`;
}
function svgTorch(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-3" stroke="${c.torch}" stroke-width="0.4"/><ellipse cx="0" cy="-3.5" rx="0.6" ry="0.8" fill="${c.torchFlame}" opacity="0.8"/><ellipse cx="0" cy="-3.7" rx="0.3" ry="0.5" fill="#ffdd44" opacity="0.9"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-5" stroke="${c.torch}" stroke-width="0.4"/><path d="M0,-5 Q1,-5.5 1,-5" stroke="${c.torch}" fill="none" stroke-width="0.3"/><rect x="0.5" y="-6" width="1" height="0.8" fill="${c.lantern}"/><rect x="0.65" y="-5.8" width="0.7" height="0.4" fill="${c.lanternGlow}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-4" stroke="${c.torch}" stroke-width="0.5"/><ellipse cx="0" cy="-4.5" rx="0.8" ry="1" fill="${c.torchFlame}" opacity="0.8"/><ellipse cx="0" cy="-4.8" rx="0.4" ry="0.6" fill="#ffdd44" opacity="0.9"/></g>`;
}
function svgFlag(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/><polygon points="0,-8 2.5,-6.5 0,-5" fill="#4477bb"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/><line x1="0" y1="-8" x2="2.5" y2="-8" stroke="${c.trunk}" stroke-width="0.3"/><rect x="0" y="-8" width="2.5" height="3" fill="${c.flag}" opacity="0.9"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-8" stroke="${c.trunk}" stroke-width="0.4"/><polygon points="0,-8 3.5,-7 0,-5.5" fill="${c.flag}"/></g>`;
}
function svgCobblePath(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-2" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.6"/><ellipse cx="-0.5" cy="-0.3" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.55"/><ellipse cx="1" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.5"/><ellipse cx="2.5" cy="-0.3" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.3" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.6"/><ellipse cx="-1.5" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/><ellipse cx="1.5" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/><ellipse cx="-1.5" cy="0.2" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/><ellipse cx="1.5" cy="0.2" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-0.3" rx="1" ry="0.4" fill="${c.cobble}" opacity="0.6"/><ellipse cx="1" cy="0" rx="0.8" ry="0.35" fill="${c.cobble}" opacity="0.5"/><ellipse cx="0" cy="-0.8" rx="0.7" ry="0.3" fill="${c.cobble}" opacity="0.5"/></g>`;
}
function svgSmoke(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><circle cx="0" cy="-5" r="1" fill="${c.smoke}">` + motionMarkup(
    `<animate attributeName="cy" values="-5;-8;-5" dur="4s" repeatCount="indefinite"/>`
  ) + motionMarkup(
    `<animate attributeName="opacity" values="0.5;0.1;0.5" dur="4s" repeatCount="indefinite"/>`
  ) + `</circle><circle cx="0.5" cy="-6" r="0.7" fill="${c.smoke}">` + motionMarkup(
    `<animate attributeName="cy" values="-6;-9;-6" dur="3.5s" repeatCount="indefinite"/>`
  ) + motionMarkup(
    `<animate attributeName="opacity" values="0.4;0.08;0.4" dur="3.5s" repeatCount="indefinite"/>`
  ) + `</circle></g>`;
}
function svgSignpost(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-5" stroke="${c.signpost}" stroke-width="0.5"/><rect x="0" y="-5" width="2.5" height="0.8" fill="${c.signpost}" rx="0.1"/><rect x="-2.5" y="-4" width="2.5" height="0.8" fill="${c.signpost}" rx="0.1"/></g>`;
}
function svgLantern(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-4" stroke="${c.lantern}" stroke-width="0.4"/><rect x="-0.5" y="-5" width="1" height="1" fill="${c.lantern}"/><rect x="-0.3" y="-4.8" width="0.6" height="0.6" fill="${c.lanternGlow}" opacity="0.8"/><circle cx="0" cy="-4.5" r="1" fill="${c.lanternGlow}" opacity="0.15"/></g>`;
}
function svgWoodpile(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-1.5" width="4" height="1.5" fill="${c.woodpile}"/><rect x="-1.8" y="-2.5" width="3.6" height="1" fill="${c.woodpile}"/><ellipse cx="-2" cy="-0.75" rx="0.4" ry="0.75" fill="${c.trunk}"/><ellipse cx="2" cy="-0.75" rx="0.4" ry="0.75" fill="${c.trunk}"/></g>`;
}
function svgPuddle(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="2" ry="0.7" fill="${c.puddle}" opacity="0.4"/><ellipse cx="0.3" cy="-0.3" rx="1.2" ry="0.4" fill="${c.puddle}" opacity="0.25"/></g>`;
}
function svgCampfire(x, y, c, _v) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.5" fill="${c.rock}" opacity="0.5"/><line x1="-1" y1="-0.3" x2="0" y2="-0.8" stroke="${c.campfire}" stroke-width="0.4"/><line x1="1" y1="-0.3" x2="0" y2="-0.8" stroke="${c.campfire}" stroke-width="0.4"/><ellipse cx="0" cy="-1.8" rx="0.8" ry="1.2" fill="${c.campfireFlame}" opacity="0.8">` + motionMarkup(
    `<animate attributeName="opacity" values="0.8;0.5;0.8" dur="1.5s" repeatCount="indefinite"/>`
  ) + `</ellipse><ellipse cx="0" cy="-2" rx="0.4" ry="0.7" fill="${c.lanternGlow}" opacity="0.9"/></g>`;
}
var init_cross_level_cart = __esm({
  "src/themes/terrain/assets/renderers/cross-level-cart.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/assets/renderers/seasonal-winter-snow-pine.ts
function svgSnowPine(x, y, c, v) {
  const snow = c.snowCap;
  const trunk = c.trunk;
  const icicle = c.icicleBlue || "#d0e8f8";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><polygon points="0,-8 -3,-2 3,-2" fill="${c.pine}" opacity="0.6"/><polygon points="0,-8 -3,-2 3,-2" fill="${snow}" opacity="0.55"/><polygon points="0,-6 -2.5,-1.5 2.5,-1.5" fill="${snow}" opacity="0.6"/><ellipse cx="0" cy="-8" rx="1.5" ry="0.5" fill="${snow}"/><line x1="-2" y1="-3" x2="-2" y2="-2" stroke="${icicle}" stroke-width="0.12"/><line x1="-1" y1="-4" x2="-1" y2="-3" stroke="${icicle}" stroke-width="0.1"/><line x1="1.5" y1="-3.5" x2="1.5" y2="-2.5" stroke="${icicle}" stroke-width="0.12"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><polygon points="0,-7.5 -3.5,-1 3.5,-1" fill="${c.ice}" opacity="0.5"/><polygon points="0,-6 -2.5,-2 2.5,-2" fill="${c.pine}" opacity="0.4"/><polygon points="0,-7.5 -2.5,-2.5 2.5,-2.5" fill="${snow}" opacity="0.45"/><ellipse cx="0" cy="-7.5" rx="1.2" ry="0.4" fill="${snow}"/><ellipse cx="-2" cy="-2.5" rx="0.8" ry="0.25" fill="${snow}" opacity="0.5"/><ellipse cx="2" cy="-2.5" rx="0.8" ry="0.25" fill="${snow}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><polygon points="0,-7 -3,-1 3,-1" fill="${c.pine}"/><polygon points="0,-7 -1.5,-4 1.5,-4" fill="${snow}" opacity="0.45"/><ellipse cx="0.5" cy="-6" rx="1" ry="0.3" fill="${snow}" opacity="0.5"/><ellipse cx="-1.5" cy="-3" rx="0.7" ry="0.25" fill="${snow}" opacity="0.4"/><line x1="-2" y1="-2.5" x2="-2" y2="-1.8" stroke="${icicle}" stroke-width="0.08" opacity="0.7"/><line x1="2" y1="-2.5" x2="2" y2="-1.8" stroke="${icicle}" stroke-width="0.08" opacity="0.7"/></g>`;
}
function svgSnowDeciduous(x, y, c, v) {
  const branch = c.bareBranch;
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="2" x2="0" y2="-5" stroke="${branch}" stroke-width="0.8"/><line x1="0" y1="-2" x2="-2" y2="-4" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="-3" x2="1.5" y2="-5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="-1" x2="2" y2="-2.5" stroke="${branch}" stroke-width="0.4"/><ellipse cx="-1.5" cy="-4.2" rx="1" ry="0.4" fill="${snow}" opacity="0.6"/><ellipse cx="1.2" cy="-5.2" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${branch}"/><line x1="0" y1="-1" x2="-3" y2="-3.5" stroke="${branch}" stroke-width="0.6"/><line x1="0" y1="-1.5" x2="2.5" y2="-4" stroke="${branch}" stroke-width="0.6"/><line x1="0" y1="0" x2="-2.5" y2="-1.5" stroke="${branch}" stroke-width="0.5"/><line x1="0" y1="0" x2="3" y2="-2" stroke="${branch}" stroke-width="0.5"/><ellipse cx="-2.5" cy="-3.7" rx="1.2" ry="0.5" fill="${snow}" opacity="0.55"/><ellipse cx="2" cy="-4.2" rx="1" ry="0.4" fill="${snow}" opacity="0.5"/><ellipse cx="0" cy="-2" rx="1.5" ry="0.4" fill="${snow}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="2" x2="0" y2="-4" stroke="${branch}" stroke-width="0.7"/><line x1="0" y1="-1.5" x2="-2.5" y2="-3.5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="-2.5" x2="2" y2="-4.5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="-0.5" x2="2" y2="-2" stroke="${branch}" stroke-width="0.4"/><ellipse cx="-2" cy="-3.7" rx="1" ry="0.35" fill="${snow}" opacity="0.5"/><ellipse cx="1.8" cy="-4.7" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/></g>`;
}
function svgSnowman(x, y, c, v) {
  const body = c.snowCap;
  const coal = c.snowmanCoal;
  const carrot = c.snowmanCarrot;
  const scarf = c.scarfRed;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="2.2" fill="${body}"/><circle cx="0" cy="-2.8" r="1.6" fill="${body}"/><circle cx="0" cy="-4.8" r="1.1" fill="${body}"/><circle cx="-0.4" cy="-5" r="0.2" fill="${coal}"/><circle cx="0.4" cy="-5" r="0.2" fill="${coal}"/><polygon points="0,-4.8 1.2,-4.6 0,-4.5" fill="${carrot}"/><rect x="-1" y="-3.6" width="2" height="0.4" rx="0.2" fill="${scarf}"/><line x1="2" y1="-3" x2="3.5" y2="-6" stroke="${c.bareBranch}" stroke-width="0.4"/><line x1="3.2" y1="-5.5" x2="3.8" y2="-6.5" stroke="${c.bareBranch}" stroke-width="0.3"/><line x1="3.2" y1="-5.5" x2="3.8" y2="-5.2" stroke="${c.bareBranch}" stroke-width="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.5" rx="2.8" ry="1.5" fill="${body}"/><circle cx="0" cy="-1.5" r="1.8" fill="${body}"/><circle cx="0" cy="-3.2" r="1" fill="${body}"/><circle cx="-0.3" cy="-3.4" r="0.15" fill="${coal}"/><circle cx="0.3" cy="-3.4" r="0.15" fill="${coal}"/><polygon points="0,-3.2 1,-3 0,-2.9" fill="${carrot}"/><ellipse cx="0" cy="1.5" rx="3" ry="0.5" fill="${c.ice}" opacity="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><circle cx="0" cy="0" r="2" fill="${body}"/><circle cx="0" cy="-2.5" r="1.5" fill="${body}"/><circle cx="0" cy="-4.3" r="1" fill="${body}"/><circle cx="-0.35" cy="-4.5" r="0.18" fill="${coal}"/><circle cx="0.35" cy="-4.5" r="0.18" fill="${coal}"/><polygon points="0,-4.3 1.2,-4.1 0,-4" fill="${carrot}"/><circle cx="0" cy="-2.2" r="0.15" fill="${coal}"/><circle cx="0" cy="-2.7" r="0.15" fill="${coal}"/><rect x="-1" y="-3.2" width="2" height="0.35" rx="0.15" fill="${scarf}"/><rect x="-1.2" y="-5.5" width="2.4" height="0.5" fill="${coal}"/><rect x="-0.8" y="-6" width="1.6" height="0.6" fill="${coal}"/></g>`;
}
function svgSnowdrift(x, y, c, v) {
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="3.5" ry="1.2" fill="${snow}"/><ellipse cx="-1" cy="-0.5" rx="2" ry="0.8" fill="${c.frostWhite}" opacity="0.6"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M-3,0 Q-1,-1.5 2,-0.5 Q3,0 3.5,0.3" fill="${snow}" stroke="none"/><ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${snow}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${snow}"/><ellipse cx="0.3" cy="-0.3" rx="1.2" ry="0.5" fill="${c.frostWhite}" opacity="0.5"/></g>`;
}
var init_seasonal_winter_snow_pine = __esm({
  "src/themes/terrain/assets/renderers/seasonal-winter-snow-pine.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-winter-igloo.ts
function svgIgloo(x, y, c, v) {
  const block = c.igloo;
  const ice = c.ice;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M-3.5,0.5 Q-3.5,-3 0,-3.5 Q3.5,-3 3.5,0.5 Z" fill="${block}"/><path d="M-1,0.5 Q-1,-0.5 0,-0.8 Q1,-0.5 1,0.5 Z" fill="${ice}" opacity="0.5"/><line x1="-2" y1="-1" x2="2" y2="-1" stroke="${ice}" stroke-width="0.2" opacity="0.4"/><line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.4"/><path d="M2,0.5 Q2.5,0.3 3,0.5 Q3,-0.2 2.5,-0.3 Q2,-0.2 2,0.5 Z" fill="${block}" opacity="0.8"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M-3,0.5 Q-3,-1.5 0,-2 Q2,-1.5 2,0.5 Z" fill="${block}"/><rect x="2.5" y="-0.5" width="1" height="0.5" fill="${block}" opacity="0.7"/><rect x="2" y="0" width="1.2" height="0.5" fill="${block}" opacity="0.6"/><line x1="-1.5" y1="0" x2="1.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><path d="M-3,0.5 Q-3,-3 0,-3.5 Q3,-3 3,0.5 Z" fill="${block}"/><line x1="-2" y1="-1" x2="2" y2="-1" stroke="${ice}" stroke-width="0.2" opacity="0.4"/><line x1="-2.5" y1="0" x2="2.5" y2="0" stroke="${ice}" stroke-width="0.2" opacity="0.4"/><line x1="-1" y1="-2" x2="1" y2="-2" stroke="${ice}" stroke-width="0.2" opacity="0.3"/></g>`;
}
function svgFrozenPond(x, y, c, v) {
  const ice = c.ice;
  const crack = c.frozenWater;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="3" ry="1.2" fill="${ice}" opacity="0.7"/><line x1="-1" y1="-0.3" x2="1.5" y2="0.5" stroke="${crack}" stroke-width="0.3" opacity="0.5"/><line x1="0" y1="-0.5" x2="0.5" y2="0.8" stroke="${crack}" stroke-width="0.2" opacity="0.4"/><ellipse cx="0.5" cy="-0.2" rx="0.8" ry="0.3" fill="#fff" opacity="0.2"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${ice}" opacity="0.5"/><ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${crack}" opacity="0.3"/><ellipse cx="0.3" cy="-0.1" rx="0.5" ry="0.2" fill="#fff" opacity="0.15"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="3" ry="1.2" fill="${ice}" opacity="0.7"/><ellipse cx="0.5" cy="-0.2" rx="1.2" ry="0.5" fill="#fff" opacity="0.15"/></g>`;
}
function svgIcicle(x, y, c, v) {
  const ice = c.icicle;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-1.5,-1 -1.2,-1 -1,-3" fill="${ice}" opacity="0.7"/><polygon points="-0.3,-1 0,-1 0.2,-3.5" fill="${ice}" opacity="0.8"/><polygon points="0.8,-1 1.1,-1 1.2,-2.5" fill="${ice}" opacity="0.7"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><polygon points="-0.5,-1 0.5,-1 0.2,-3.5 -0.2,-3.5" fill="${ice}" opacity="0.8"/><ellipse cx="0" cy="-1" rx="0.6" ry="0.2" fill="${ice}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-0.2,-1 0.2,-1 0,-3" fill="${ice}" opacity="0.8"/></g>`;
}
function svgSled(x, y, c, v) {
  const wood = c.sledWood;
  const runner = c.sledRunner;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/><path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><rect x="-1.5" y="-2.2" width="1.5" height="1.2" fill="${c.scarfRed}" rx="0.2"/><rect x="0.3" y="-1.8" width="1" height="0.8" fill="${c.sproutGreen || "#4a8828"}" rx="0.2"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/><path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><line x1="-3" y1="0.3" x2="3" y2="0.3" stroke="${runner}" stroke-width="0.15" opacity="0.3"/><line x1="-3" y1="0.5" x2="3" y2="0.5" stroke="${runner}" stroke-width="0.15" opacity="0.2"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-1" width="5" height="0.5" rx="0.2" fill="${wood}"/><path d="M-2.5,-0.5 Q-3,-0.5 -3,0 L-2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><path d="M2.5,-0.5 Q3,-0.5 3,0 L2.5,0.2" fill="none" stroke="${runner}" stroke-width="0.4"/><line x1="-2" y1="-1" x2="-2" y2="-0.5" stroke="${wood}" stroke-width="0.3"/><line x1="2" y1="-1" x2="2" y2="-0.5" stroke="${wood}" stroke-width="0.3"/></g>`;
}
function svgSnowCoveredRock(x, y, c, v) {
  const rock = c.rock;
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2.5" ry="1.2" fill="${rock}"/><ellipse cx="0" cy="-0.8" rx="2" ry="0.6" fill="${snow}" opacity="0.7"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="3" ry="1.5" fill="${c.boulder}"/><ellipse cx="-0.5" cy="-0.5" rx="2" ry="1" fill="${rock}"/><ellipse cx="-0.3" cy="-1" rx="2" ry="0.7" fill="${snow}" opacity="0.6"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.5" ry="0.8" fill="${rock}"/><ellipse cx="0" cy="-0.5" rx="1.2" ry="0.4" fill="${snow}" opacity="0.6"/></g>`;
}
var init_seasonal_winter_igloo = __esm({
  "src/themes/terrain/assets/renderers/seasonal-winter-igloo.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-winter-bare-bush.ts
function svgBareBush(x, y, c, v) {
  const branch = c.bareBranch;
  const frost = c.frostWhite;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="-2" y2="-2" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="2" y2="-1.5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${branch}" stroke-width="0.5"/><line x1="-1" y1="-1.2" x2="-2.5" y2="-2" stroke="${branch}" stroke-width="0.3"/><line x1="1" y1="-0.8" x2="2.5" y2="-1.5" stroke="${branch}" stroke-width="0.3"/><circle cx="-2" cy="-2" r="0.3" fill="${frost}" opacity="0.4"/><circle cx="2" cy="-1.5" r="0.3" fill="${frost}" opacity="0.4"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="-1.5" y2="-2" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="1.5" y2="-1.8" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${branch}" stroke-width="0.5"/><circle cx="-1" cy="-1.8" r="0.25" fill="${c.scarfRed}"/><circle cx="0.5" cy="-2" r="0.25" fill="${c.scarfRed}"/><circle cx="1" cy="-1.2" r="0.25" fill="${c.scarfRed}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="-1.5" y2="-1.5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="1.5" y2="-1.5" stroke="${branch}" stroke-width="0.4"/><line x1="0" y1="0.5" x2="0" y2="-2" stroke="${branch}" stroke-width="0.5"/><circle cx="0" cy="-2" r="0.3" fill="${frost}" opacity="0.3"/></g>`;
}
function svgWinterBird(x, y, c, v) {
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.winterBirdBrown}"/><circle cx="-0.8" cy="-1.5" r="0.5" fill="${c.winterBirdBrown}"/><circle cx="-1" cy="-1.6" r="0.12" fill="#fff"/><circle cx="-1" cy="-1.6" r="0.06" fill="#222"/><polygon points="-1.3,-1.5 -1.8,-1.4 -1.3,-1.3" fill="${c.snowmanCarrot}"/><ellipse cx="0.3" cy="-0.8" rx="0.6" ry="0.4" fill="${c.scarfRed}" opacity="0.7"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="1" ry="0.7" fill="${c.winterBirdBrown}" opacity="0.8"/><circle cx="-0.6" cy="-1.4" r="0.45" fill="${c.winterBirdBrown}" opacity="0.9"/><circle cx="-0.8" cy="-1.5" r="0.1" fill="#222"/><polygon points="-1,-1.4 -1.5,-1.3 -1,-1.2" fill="${c.snowmanCarrot}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-1" rx="1.2" ry="0.8" fill="${c.winterBirdRed}"/><circle cx="-0.8" cy="-1.5" r="0.55" fill="${c.winterBirdRed}"/><polygon points="-0.6,-2 -0.5,-2.5 -0.3,-2" fill="${c.winterBirdRed}"/><circle cx="-1" cy="-1.6" r="0.12" fill="#fff"/><circle cx="-1" cy="-1.6" r="0.06" fill="#222"/><polygon points="-1.3,-1.5 -1.8,-1.4 -1.3,-1.3" fill="${c.snowmanCarrot}"/><circle cx="-0.5" cy="-1.3" r="0.25" fill="#222" opacity="0.5"/></g>`;
}
function svgFirewood(x, y, c, v) {
  const log = c.firewoodLog;
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-0.8" cy="0" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="0.8" cy="0" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="0" cy="0" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="-0.4" cy="-0.6" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="0.4" cy="-0.6" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="0" cy="-1.2" rx="0.6" ry="0.35" fill="${log}"/><ellipse cx="0" cy="-1.5" rx="1.5" ry="0.3" fill="${snow}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="-2" y1="0.5" x2="-2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.4"/><line x1="2" y1="0.5" x2="2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.4"/><line x1="-2.2" y1="-2" x2="2.2" y2="-2" stroke="${c.bareBranch}" stroke-width="0.5"/><ellipse cx="-0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/><ellipse cx="0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/><ellipse cx="0" cy="-0.5" rx="0.5" ry="0.3" fill="${log}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="-0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/><ellipse cx="0.5" cy="0" rx="0.5" ry="0.3" fill="${log}"/><ellipse cx="0" cy="-0.5" rx="0.5" ry="0.3" fill="${log}"/><ellipse cx="0" cy="-0.8" rx="1" ry="0.2" fill="${snow}" opacity="0.4"/></g>`;
}
function svgHouseWinter(x, y, c, v) {
  const snow = c.snowCap;
  const warmGlow = "#ffa040";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/><polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/><polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/><polygon points="0,-6.3 -3.4,-2.6 -3.2,-2.8 0,-6" fill="${snow}" opacity="0.9"/><polygon points="0,-6.3 3.4,-2.6 3.2,-2.8 0,-6" fill="${snow}" opacity="0.85"/><rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/><ellipse cx="1.5" cy="-6.8" rx="0.6" ry="0.25" fill="${snow}"/><line x1="-2.8" y1="-2.5" x2="-2.8" y2="-1.8" stroke="${c.icicleBlue || "#d0e8f8"}" stroke-width="0.15"/><line x1="-2.2" y1="-2.3" x2="-2.2" y2="-1.5" stroke="${c.icicleBlue || "#d0e8f8"}" stroke-width="0.12"/><line x1="2.5" y1="-2.4" x2="2.5" y2="-1.6" stroke="${c.icicleBlue || "#d0e8f8"}" stroke-width="0.15"/><rect x="-1" y="-1.5" width="0.6" height="0.6" fill="${warmGlow}" opacity="0.6"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/><polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/><polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/><polygon points="0,-6.5 -3.5,-2.5 -3.2,-2.8 0,-6" fill="${snow}"/><polygon points="0,-6.5 3.5,-2.5 3.2,-2.8 0,-6" fill="${snow}" opacity="0.95"/><ellipse cx="-2" cy="-2.6" rx="0.8" ry="0.3" fill="${snow}"/><ellipse cx="2" cy="-2.6" rx="0.8" ry="0.3" fill="${snow}"/><rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/><ellipse cx="1.5" cy="-6.8" rx="0.8" ry="0.35" fill="${snow}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-2.5,0 0,1.2 2.5,0 2.5,-3 0,-1.8 -2.5,-3" fill="${c.wall}"/><polygon points="-2.5,0 0,1.2 0,-1.8 -2.5,-3" fill="${c.wallShade}"/><polygon points="0,-6 -3.2,-2.8 0,-1.5 3.2,-2.8" fill="${c.roofA}"/><polygon points="0,-6.2 -3.3,-2.7 -3.2,-2.8 0,-6" fill="${snow}" opacity="0.85"/><polygon points="0,-6.2 3.3,-2.7 3.2,-2.8 0,-6" fill="${snow}" opacity="0.8"/><rect x="1" y="-6.5" width="1" height="2" fill="${c.chimney}"/><ellipse cx="1.5" cy="-6.7" rx="0.5" ry="0.2" fill="${snow}"/><rect x="-0.8" y="-1.3" width="0.5" height="0.5" fill="${warmGlow}" opacity="0.5"/></g>`;
}
function svgHouseBWinter(x, y, c, v) {
  return svgHouseWinter(x, y, c, v);
}
function svgBarnWinter(x, y, c, v) {
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-4,0 0,2 4,0 4,-4.5 0,-2.5 -4,-4.5" fill="${c.roofA}" opacity="0.9"/><polygon points="-4,0 0,2 0,-2.5 -4,-4.5" fill="${c.wallShade}"/><polygon points="0,-7.5 -4.5,-4 0,-2.2 4.5,-4" fill="${c.roofA}"/><polygon points="0,-7.8 -4.7,-3.8 -4.5,-4 0,-7.5" fill="${snow}"/><polygon points="0,-7.8 4.7,-3.8 4.5,-4 0,-7.5" fill="${snow}" opacity="0.95"/><ellipse cx="-3.5" cy="-4" rx="1" ry="0.35" fill="${snow}"/><ellipse cx="3.5" cy="-4" rx="1" ry="0.35" fill="${snow}"/><rect x="-0.5" y="-1.5" width="1" height="1.5" fill="${c.trunk}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-3,0 0,1.5 3,0 3,-3.5 0,-2 -3,-3.5" fill="${c.roofA}" opacity="0.8"/><polygon points="-3,0 0,1.5 0,-2 -3,-3.5" fill="${c.wallShade}"/><polygon points="0,-6 -3.5,-3.2 0,-1.8 3.5,-3.2" fill="${c.roofA}"/><polygon points="0,-6.3 -3.7,-3 -3.5,-3.2 0,-6" fill="${snow}"/><polygon points="0,-6.3 3.7,-3 3.5,-3.2 0,-6" fill="${snow}" opacity="0.9"/><ellipse cx="0" cy="-6" rx="0.5" ry="0.2" fill="${snow}"/></g>`;
}
var init_seasonal_winter_bare_bush = __esm({
  "src/themes/terrain/assets/renderers/seasonal-winter-bare-bush.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-winter-church-winter.ts
function svgChurchWinter(x, y, c, v) {
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/><polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/><rect x="-1" y="-8.5" width="2" height="3.5" fill="${c.church}"/><polygon points="-1.3,-8.5 0,-10.5 1.3,-8.5" fill="${c.roofA}"/><polygon points="-1.4,-8.3 0,-10.8 0,-10.5 -1.3,-8.5" fill="${snow}"/><polygon points="1.4,-8.3 0,-10.8 0,-10.5 1.3,-8.5" fill="${snow}" opacity="0.9"/><ellipse cx="0" cy="-8.5" rx="1.2" ry="0.3" fill="${snow}"/><circle cx="0" cy="-7" r="0.4" fill="${c.blacksmith}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><polygon points="-2,0 0,1 2,0 2,-5 0,-4 -2,-5" fill="${c.church}"/><polygon points="-2,0 0,1 0,-4 -2,-5" fill="${c.wallShade}"/><polygon points="0,-10 -2.5,-5 0,-3.8 2.5,-5" fill="${c.roofA}"/><polygon points="0,-10.4 -2.7,-4.8 -2.5,-5 0,-10" fill="${snow}"/><polygon points="0,-10.4 2.7,-4.8 2.5,-5 0,-10" fill="${snow}" opacity="0.9"/><ellipse cx="0" cy="-5" rx="2" ry="0.4" fill="${snow}"/><line x1="0" y1="-12" x2="0" y2="-10" stroke="${c.wall}" stroke-width="0.5"/><line x1="-1" y1="-11" x2="1" y2="-11" stroke="${c.wall}" stroke-width="0.5"/></g>`;
}
function svgChristmasTree(x, y, c, v) {
  const tree = c.christmasGreen || "#228b22";
  const star = c.christmasGold || "#ffd700";
  const red = c.christmasRed || "#c41e3a";
  const blue = c.icicleBlue || "#d0e8f8";
  const gold = c.christmasGold || "#ffd700";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/><polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/><polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/><polygon points="0,-4 -1.5,-2 1.5,-2" fill="${tree}" opacity="0.85"/><polygon points="-0.3,-7.5 0,-8 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/><circle cx="-1" cy="-3" r="0.25" fill="${red}"/><circle cx="0.8" cy="-2.5" r="0.2" fill="${blue}"/><circle cx="-0.5" cy="-4.5" r="0.2" fill="${gold}"/><circle cx="0.5" cy="-5" r="0.25" fill="${red}"/><rect x="-1.5" y="0.5" width="0.8" height="0.6" fill="${red}"/><rect x="0.5" y="0.3" width="0.7" height="0.5" fill="${blue}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/><polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/><polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/><polygon points="-0.3,-7.5 0,-8 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/><circle cx="-1.5" cy="-2" r="0.15" fill="${red}"/><circle cx="-0.5" cy="-2.5" r="0.15" fill="${gold}"/><circle cx="0.5" cy="-2" r="0.15" fill="${blue}"/><circle cx="1.5" cy="-2.5" r="0.15" fill="${red}"/><circle cx="-1" cy="-4" r="0.15" fill="${blue}"/><circle cx="0" cy="-3.5" r="0.15" fill="${gold}"/><circle cx="1" cy="-4" r="0.15" fill="${red}"/><circle cx="-0.5" cy="-5.5" r="0.15" fill="${gold}"/><circle cx="0.5" cy="-5" r="0.15" fill="${blue}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-1" width="0.6" height="2" fill="${c.trunk}"/><polygon points="0,-7 -2.5,-1 2.5,-1" fill="${tree}"/><polygon points="0,-5.5 -2,-1.5 2,-1.5" fill="${tree}" opacity="0.9"/><polygon points="0,-4 -1.5,-2 1.5,-2" fill="${tree}" opacity="0.85"/><polygon points="-0.3,-7.5 0,-8.2 0.3,-7.5 0.1,-7.5 0.1,-7 -0.1,-7 -0.1,-7.5" fill="${star}"/><circle cx="-1.2" cy="-2.5" r="0.3" fill="${red}"/><circle cx="1" cy="-3" r="0.25" fill="${gold}"/><circle cx="-0.3" cy="-4" r="0.25" fill="${blue}"/><circle cx="0.7" cy="-5" r="0.2" fill="${red}"/><circle cx="-0.5" cy="-5.8" r="0.2" fill="${gold}"/></g>`;
}
function svgWinterLantern(x, y, c, v) {
  const post = c.lantern;
  const glow = c.lanternGlow;
  const snow = c.snowCap;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-5" stroke="${post}" stroke-width="0.4"/><line x1="0" y1="-4.5" x2="-1.5" y2="-4.5" stroke="${post}" stroke-width="0.25"/><line x1="0" y1="-4.5" x2="1.5" y2="-4.5" stroke="${post}" stroke-width="0.25"/><rect x="-2" y="-5.5" width="1" height="1" fill="${glow}" opacity="0.8"/><rect x="1" y="-5.5" width="1" height="1" fill="${glow}" opacity="0.8"/><ellipse cx="-1.5" cy="-5.7" rx="0.6" ry="0.2" fill="${snow}"/><ellipse cx="1.5" cy="-5.7" rx="0.6" ry="0.2" fill="${snow}"/><circle cx="-1.5" cy="-5" r="0.8" fill="${glow}" opacity="0.3"/><circle cx="1.5" cy="-5" r="0.8" fill="${glow}" opacity="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0" x2="0" y2="-5" stroke="${post}" stroke-width="0.35"/><rect x="-0.5" y="-6" width="1" height="1.2" fill="${glow}" opacity="0.8"/><ellipse cx="0" cy="-6.2" rx="0.6" ry="0.25" fill="${snow}"/><circle cx="0" cy="-5.4" r="1" fill="${glow}" opacity="0.25"/><ellipse cx="0" cy="0" rx="0.8" ry="0.3" fill="${snow}" opacity="0.5"/></g>`;
}
function svgFrozenFountain(x, y, c, v) {
  const stone = c.fountain;
  const ice = c.ice;
  const icicle = c.icicleBlue || "#d0e8f8";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${stone}"/><ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${ice}" opacity="0.7"/><rect x="-0.4" y="-3" width="0.8" height="3" fill="${stone}"/><ellipse cx="0" cy="-3" rx="1" ry="0.4" fill="${stone}"/><polygon points="0,-5 -0.3,-3 0.3,-3" fill="${ice}"/><polygon points="-0.5,-4 -0.2,-3 -0.8,-3" fill="${icicle}"/><polygon points="0.5,-4.5 0.2,-3 0.8,-3" fill="${icicle}"/><polygon points="-1.5,-1 -1.5,-0.3 -1.3,-0.3" fill="${icicle}" opacity="0.8"/><polygon points="1.5,-1.2 1.5,-0.3 1.3,-0.3" fill="${icicle}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2.5" ry="1" fill="${stone}"/><ellipse cx="0" cy="-0.3" rx="2" ry="0.7" fill="${ice}" opacity="0.6"/><rect x="-0.4" y="-3" width="0.8" height="3" fill="${stone}"/><ellipse cx="0" cy="-3" rx="1" ry="0.4" fill="${stone}"/><polygon points="-0.4,-3.8 -0.1,-3 -0.7,-3" fill="${icicle}" opacity="0.7"/><polygon points="0.4,-4 0.1,-3 0.7,-3" fill="${icicle}" opacity="0.7"/></g>`;
}
var init_seasonal_winter_church_winter = __esm({
  "src/themes/terrain/assets/renderers/seasonal-winter-church-winter.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom.ts
function svgCherryBlossom(x, y, c, v) {
  const pink = v === 2 ? c.cherryPetalWhite : c.cherryPetalPink;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><line x1="0" y1="-1" x2="-2" y2="-3" stroke="${c.cherryBranch}" stroke-width="0.5"/><line x1="0" y1="-1.5" x2="2" y2="-3.5" stroke="${c.cherryBranch}" stroke-width="0.5"/><circle cx="-2" cy="-3.2" r="1" fill="${pink}" opacity="0.5"/><circle cx="2" cy="-3.7" r="0.8" fill="${pink}" opacity="0.4"/><circle cx="0" cy="-3" r="0.6" fill="${pink}" opacity="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3" fill="${trunk}"/><line x1="0" y1="-1" x2="-2.5" y2="-3" stroke="${c.cherryBranch}" stroke-width="0.5"/><line x1="0" y1="-1.5" x2="2.5" y2="-3.5" stroke="${c.cherryBranch}" stroke-width="0.5"/><line x1="0" y1="-2" x2="0" y2="-4" stroke="${c.cherryBranch}" stroke-width="0.5"/><circle cx="-2" cy="-3.5" r="1.5" fill="${pink}" opacity="0.7"/><circle cx="2" cy="-4" r="1.3" fill="${pink}" opacity="0.65"/><circle cx="0" cy="-4.5" r="1.4" fill="${pink}" opacity="0.7"/><circle cx="-0.5" cy="-3" r="1" fill="${pink}" opacity="0.5"/><circle cx="1" cy="-3" r="0.8" fill="${pink}" opacity="0.45"/></g>`;
}
function svgCherryBlossomSmall(x, y, c, v) {
  const pink = c.cherryPetalPink;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/><circle cx="0" cy="-1.5" r="1.5" fill="${pink}" opacity="0.6"/><circle cx="-0.5" cy="-1" r="0.8" fill="${pink}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/><circle cx="0" cy="-2" r="1.2" fill="${pink}" opacity="0.6"/><path d="M-1,-1.5 Q-2,0 -1.5,0.5" stroke="${c.cherryBranch}" fill="none" stroke-width="0.3"/><path d="M1,-1.5 Q2,0 1.5,0.5" stroke="${c.cherryBranch}" fill="none" stroke-width="0.3"/><circle cx="-1.5" cy="0" r="0.5" fill="${pink}" opacity="0.4"/><circle cx="1.5" cy="0" r="0.5" fill="${pink}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.3" y="-0.5" width="0.6" height="2" fill="${trunk}"/><circle cx="0" cy="-1.5" r="1" fill="${pink}" opacity="0.55"/></g>`;
}
function svgCherryPetals(x, y, c, v) {
  const pink = c.cherryPetalPink;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2" ry="0.6" fill="${pink}" opacity="0.4"/><ellipse cx="0.5" cy="-0.2" rx="1" ry="0.3" fill="${pink}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-0.5" cy="-0.5" rx="0.3" ry="0.15" fill="${pink}" opacity="0.6" transform="rotate(-20,-0.5,-0.5)"/><ellipse cx="0.8" cy="-1" rx="0.3" ry="0.15" fill="${pink}" opacity="0.5" transform="rotate(30,0.8,-1)"/><ellipse cx="0" cy="-1.5" rx="0.25" ry="0.12" fill="${pink}" opacity="0.55" transform="rotate(-45,0,-1.5)"/><ellipse cx="-0.3" cy="0.2" rx="0.25" ry="0.12" fill="${pink}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="0" rx="0.3" ry="0.15" fill="${pink}" opacity="0.5"/><ellipse cx="0.5" cy="0.3" rx="0.25" ry="0.12" fill="${pink}" opacity="0.45"/><ellipse cx="1.2" cy="-0.2" rx="0.3" ry="0.15" fill="${pink}" opacity="0.4"/><ellipse cx="-0.3" cy="-0.3" rx="0.2" ry="0.1" fill="${pink}" opacity="0.5"/></g>`;
}
function svgTulip(x, y, c, v) {
  const colors = [c.tulipRed, c.tulipYellow, c.tulipPurple];
  const color = colors[v] || c.tulipRed;
  const stem = c.tulipStem;
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-2" stroke="${stem}" stroke-width="0.4"/><path d="M-0.6,-2 Q0,-3.5 0.6,-2" fill="${color}"/><ellipse cx="0" cy="-2" rx="0.5" ry="0.2" fill="${color}" opacity="0.7"/><path d="M0.5,-0.5 Q1.5,-1 1.2,-0.2" fill="${stem}" opacity="0.6"/></g>`;
}
function svgTulipField(x, y, c, v) {
  const stem = c.tulipStem;
  if (v === 1) {
    const col = c.tulipRed;
    return `<g transform="translate(${x},${y})"><line x1="-1.5" y1="0.5" x2="-1.5" y2="-1.5" stroke="${stem}" stroke-width="0.3"/><path d="M-2,-1.5 Q-1.5,-2.8 -1,-1.5" fill="${col}"/><line x1="0" y1="0.5" x2="0" y2="-1.8" stroke="${stem}" stroke-width="0.3"/><path d="M-0.5,-1.8 Q0,-3 0.5,-1.8" fill="${col}"/><line x1="1.5" y1="0.5" x2="1.5" y2="-1.3" stroke="${stem}" stroke-width="0.3"/><path d="M1,-1.3 Q1.5,-2.5 2,-1.3" fill="${col}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="2.5" ry="0.5" fill="${stem}" opacity="0.3"/><line x1="-1" y1="0.3" x2="-1" y2="-1.5" stroke="${stem}" stroke-width="0.3"/><path d="M-1.4,-1.5 Q-1,-2.5 -0.6,-1.5" fill="${c.tulipYellow}"/><line x1="0.8" y1="0.3" x2="0.8" y2="-1.8" stroke="${stem}" stroke-width="0.3"/><path d="M0.4,-1.8 Q0.8,-3 1.2,-1.8" fill="${c.tulipPurple}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="-1.5" y1="0.5" x2="-1.5" y2="-1.5" stroke="${stem}" stroke-width="0.3"/><path d="M-2,-1.5 Q-1.5,-2.8 -1,-1.5" fill="${c.tulipRed}"/><line x1="0" y1="0.5" x2="0" y2="-1.8" stroke="${stem}" stroke-width="0.3"/><path d="M-0.5,-1.8 Q0,-3 0.5,-1.8" fill="${c.tulipYellow}"/><line x1="1.5" y1="0.5" x2="1.5" y2="-1.3" stroke="${stem}" stroke-width="0.3"/><path d="M1,-1.3 Q1.5,-2.5 2,-1.3" fill="${c.tulipPurple}"/></g>`;
}
function svgSprout(x, y, c, v) {
  const green = c.sproutGreen;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="-0.5" y1="0.5" x2="-0.5" y2="-0.5" stroke="${green}" stroke-width="0.3"/><path d="M-0.5,-0.5 Q-0.5,-1.2 0,-1" fill="${green}"/><line x1="0.5" y1="0.5" x2="0.5" y2="-0.3" stroke="${green}" stroke-width="0.3"/><path d="M0.5,-0.3 Q0.5,-1 1,-0.8" fill="${green}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.3"/><path d="M0,-0.8 Q0,-1.5 0.5,-1.2" fill="${green}"/><path d="M0,-0.3 Q0.5,-0.5 0.3,-0.1" fill="${green}" opacity="0.6"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${green}" stroke-width="0.3"/><path d="M0,-0.5 Q0,-1.3 0.5,-1" fill="${green}"/></g>`;
}
var init_seasonal_spring_cherry_blossom = __esm({
  "src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-spring-nest.ts
function svgNest(x, y, c, v) {
  const brown = c.nestBrown;
  const egg1 = c.eggBlue;
  const egg2 = c.eggWhite;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${brown}"/><ellipse cx="0" cy="-0.2" rx="1.3" ry="0.4" fill="${brown}" opacity="0.7"/><ellipse cx="-0.5" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/><ellipse cx="0.2" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/><ellipse cx="0.8" cy="-0.3" rx="0.3" ry="0.35" fill="${egg2}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${brown}"/><ellipse cx="-0.5" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/><circle cx="0.5" cy="-0.8" r="0.5" fill="${c.winterBirdBrown || "#8a6040"}"/><polygon points="0.5,-0.8 0.9,-0.7 0.5,-0.6" fill="${c.snowmanCarrot || "#e07020"}" opacity="0.8"/><circle cx="0.35" cy="-0.9" r="0.08" fill="#222"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${brown}"/><ellipse cx="0" cy="-0.2" rx="1" ry="0.35" fill="${brown}" opacity="0.7"/><ellipse cx="-0.3" cy="-0.4" rx="0.3" ry="0.4" fill="${egg1}"/><ellipse cx="0.3" cy="-0.4" rx="0.3" ry="0.4" fill="${egg2}"/></g>`;
}
function svgLamb(x, y, c, v) {
  const wool = c.lambWool;
  const head = c.winterBirdBrown || "#6a5040";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.5" rx="1.5" ry="1" fill="${wool}"/><circle cx="-1.2" cy="-1.2" r="0.5" fill="${head}"/><circle cx="-1.4" cy="-1.3" r="0.08" fill="#222"/><line x1="-0.5" y1="0.5" x2="-0.8" y2="1.2" stroke="${head}" stroke-width="0.3"/><line x1="0.5" y1="0.5" x2="0.3" y2="1.2" stroke="${head}" stroke-width="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="2" cy="-0.8" rx="2" ry="1.3" fill="${c.sheep || wool}"/><circle cx="0.5" cy="-1.5" r="0.6" fill="#444"/><ellipse cx="-1.5" cy="-0.3" rx="1.2" ry="0.8" fill="${wool}"/><circle cx="-2.3" cy="-0.8" r="0.4" fill="${head}"/><circle cx="-2.5" cy="-0.9" r="0.06" fill="#222"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-0.5" rx="1.3" ry="0.9" fill="${wool}"/><circle cx="-1" cy="-1" r="0.45" fill="${head}"/><circle cx="-1.2" cy="-1.1" r="0.07" fill="#222"/><line x1="-0.5" y1="0.3" x2="-0.5" y2="1" stroke="${head}" stroke-width="0.25"/><line x1="0.5" y1="0.3" x2="0.5" y2="1" stroke="${head}" stroke-width="0.25"/></g>`;
}
function svgCrocus(x, y, c, v) {
  const colors = [c.crocusPurple, c.crocusYellow, c.cherryPetalWhite];
  const color = colors[v] || c.crocusPurple;
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${c.tulipStem || "#5a9a40"}" stroke-width="0.3"/><path d="M-0.4,-0.5 Q0,-1.5 0.4,-0.5" fill="${color}"/><line x1="0" y1="-0.8" x2="0" y2="-1.2" stroke="${c.crocusYellow}" stroke-width="0.2"/></g>`;
}
function svgRainPuddle(x, y, c, v) {
  const water = c.poolWater || c.water;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="2" ry="0.8" fill="${water}" opacity="0.4"/><ellipse cx="0.3" cy="-0.1" rx="0.8" ry="0.3" fill="#fff" opacity="0.1"/><circle cx="-0.5" cy="-0.2" r="0.4" fill="${water}" opacity="0.15" stroke="${water}" stroke-width="0.2"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${c.gardenSoil || "#5a4030"}" opacity="0.3"/><ellipse cx="0" cy="0" rx="1.5" ry="0.5" fill="${water}" opacity="0.35"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.5" ry="0.6" fill="${water}" opacity="0.35"/><ellipse cx="0.2" cy="-0.1" rx="0.6" ry="0.25" fill="#fff" opacity="0.1"/></g>`;
}
function svgBirdhouse(x, y, c, v) {
  const wood = c.birdhouseWood;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/><rect x="-1" y="-3.5" width="2" height="1.5" fill="${c.parasolBlue || "#4080d0"}"/><polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${c.tulipRed || "#e04050"}"/><circle cx="0" cy="-3" r="0.3" fill="#333"/><line x1="0" y1="-2.7" x2="0.5" y2="-2.5" stroke="${wood}" stroke-width="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/><rect x="-1" y="-3.5" width="2" height="1.5" fill="${wood}"/><polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${wood}" opacity="0.8"/><circle cx="0" cy="-3" r="0.3" fill="#333"/><circle cx="1.2" cy="-3.8" r="0.4" fill="${c.winterBirdBrown || "#8a6040"}"/><ellipse cx="1.2" cy="-3.5" rx="0.5" ry="0.3" fill="${c.winterBirdBrown || "#8a6040"}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-2" stroke="${wood}" stroke-width="0.5"/><rect x="-1" y="-3.5" width="2" height="1.5" fill="${wood}"/><polygon points="-1.2,-3.5 0,-4.5 1.2,-3.5" fill="${wood}" opacity="0.8"/><circle cx="0" cy="-3" r="0.3" fill="#333"/><line x1="0" y1="-2.7" x2="0.5" y2="-2.5" stroke="${wood}" stroke-width="0.3"/></g>`;
}
function svgGardenBed(x, y, c, v) {
  const soil = c.gardenSoil;
  const green = c.sproutGreen;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-0.3" width="5" height="1" rx="0.3" fill="${soil}"/><line x1="-1.5" y1="-0.3" x2="-1.5" y2="-1" stroke="${green}" stroke-width="0.3"/><line x1="0" y1="-0.3" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.3"/><line x1="1.5" y1="-0.3" x2="1.5" y2="-1.1" stroke="${green}" stroke-width="0.3"/><path d="M-1.5,-1 Q-1.5,-1.5 -1,-1.2" fill="${green}"/><path d="M1.5,-1.1 Q1.5,-1.6 2,-1.3" fill="${green}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-0.3" width="5" height="1" rx="0.3" fill="${soil}"/><line x1="-2.5" y1="-0.8" x2="2.5" y2="-0.8" stroke="${c.fence}" stroke-width="0.3"/><line x1="-2" y1="-1.3" x2="-2" y2="0" stroke="${c.fence}" stroke-width="0.3"/><line x1="2" y1="-1.3" x2="2" y2="0" stroke="${c.fence}" stroke-width="0.3"/><line x1="0" y1="-0.3" x2="0" y2="-0.7" stroke="${green}" stroke-width="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-0.3" width="4" height="0.8" rx="0.3" fill="${soil}"/><line x1="-1" y1="-0.1" x2="-1" y2="-0.1" stroke="${soil}" stroke-width="0.8"/><line x1="0.5" y1="-0.1" x2="0.5" y2="-0.1" stroke="${soil}" stroke-width="0.8"/></g>`;
}
var init_seasonal_spring_nest = __esm({
  "src/themes/terrain/assets/renderers/seasonal-spring-nest.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom-full.ts
function svgCherryBlossomFull(x, y, c, v) {
  const pink = c.blossomPink || c.cherryPetalPink;
  const white = c.blossomWhite || c.cherryPetalWhite;
  const trunk = c.cherryTrunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.5" fill="${white}" opacity="0.7"/><circle cx="-1.8" cy="-3.5" r="1.8" fill="${pink}" opacity="0.65"/><circle cx="1.8" cy="-3.5" r="1.8" fill="${white}" opacity="0.6"/><circle cx="0" cy="-6" r="1.5" fill="${pink}" opacity="0.55"/><circle cx="-1" cy="-5" r="1" fill="${white}" opacity="0.5"/><circle cx="1" cy="-5" r="1" fill="${pink}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4" r="2.3" fill="${pink}" opacity="0.7"/><circle cx="-1.5" cy="-3.2" r="1.6" fill="${pink}" opacity="0.65"/><circle cx="1.5" cy="-3.2" r="1.6" fill="${pink}" opacity="0.6"/><circle cx="0" cy="-5.5" r="1.3" fill="${pink}" opacity="0.55"/><ellipse cx="-2" cy="0.5" rx="0.3" ry="0.12" fill="${pink}" opacity="0.5"/><ellipse cx="1.5" cy="0.8" rx="0.25" ry="0.1" fill="${pink}" opacity="0.45"/><ellipse cx="0" cy="0.3" rx="0.2" ry="0.08" fill="${pink}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4.5" r="2.8" fill="${pink}" opacity="0.7"/><circle cx="-2" cy="-3.5" r="2" fill="${pink}" opacity="0.65"/><circle cx="2" cy="-3.5" r="2" fill="${pink}" opacity="0.6"/><circle cx="0" cy="-6.5" r="1.5" fill="${pink}" opacity="0.55"/><circle cx="-1" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/><circle cx="1" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/></g>`;
}
function svgCherryBlossomBranch(x, y, c, v) {
  const pink = c.blossomPink || c.cherryPetalPink;
  const branch = c.cherryBranch;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M0,0 Q-1.5,-2 -3,-2" stroke="${branch}" fill="none" stroke-width="0.4"/><circle cx="-2.5" cy="-2.2" r="0.8" fill="${pink}" opacity="0.6"/><circle cx="-3.2" cy="-1.8" r="0.6" fill="${pink}" opacity="0.5"/><circle cx="-1.8" cy="-2" r="0.5" fill="${pink}" opacity="0.55"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><path d="M0,0 Q0.5,-1.5 1,-3" stroke="${branch}" fill="none" stroke-width="0.35"/><circle cx="0.8" cy="-2.5" r="0.7" fill="${pink}" opacity="0.6"/><circle cx="1.2" cy="-3.2" r="0.5" fill="${pink}" opacity="0.55"/><circle cx="0.3" cy="-1.5" r="0.4" fill="${pink}" opacity="0.5"/></g>`;
}
function svgPeachBlossom(x, y, c, v) {
  const pink = c.peachPink || "#ffd5cc";
  const trunk = c.cherryTrunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2" fill="${pink}" opacity="0.65"/><circle cx="-1.2" cy="-2.8" r="1.2" fill="${pink}" opacity="0.55"/><circle cx="1.2" cy="-2.8" r="1.2" fill="${pink}" opacity="0.5"/><circle cx="0" cy="-4.8" r="0.8" fill="${pink}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.5" y="-1" width="1" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4" r="2.5" fill="${pink}" opacity="0.65"/><circle cx="-1.5" cy="-3" r="1.5" fill="${pink}" opacity="0.55"/><circle cx="1.5" cy="-3" r="1.5" fill="${pink}" opacity="0.5"/><circle cx="0" cy="-5.5" r="1.2" fill="${pink}" opacity="0.5"/></g>`;
}
function svgFlowerBed(x, y, c, v) {
  const soil = c.gardenSoil;
  const red = c.tulipRed;
  const yellow = c.tulipYellow;
  const purple = c.crocusPurple;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-2" y="-0.3" width="4" height="0.8" rx="0.2" fill="${soil}"/><circle cx="-1.2" cy="-0.8" r="0.35" fill="${red}"/><circle cx="-0.4" cy="-0.9" r="0.3" fill="${yellow}"/><circle cx="0.4" cy="-0.7" r="0.35" fill="${purple}"/><circle cx="1.2" cy="-0.85" r="0.3" fill="${red}"/><line x1="-1.2" y1="-0.5" x2="-1.2" y2="-0.3" stroke="${c.sproutGreen}" stroke-width="0.12"/><line x1="0.4" y1="-0.4" x2="0.4" y2="-0.3" stroke="${c.sproutGreen}" stroke-width="0.12"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.8" ry="0.7" fill="${soil}"/><circle cx="-0.8" cy="-0.5" r="0.35" fill="${red}"/><circle cx="0" cy="-0.6" r="0.3" fill="${yellow}"/><circle cx="0.8" cy="-0.5" r="0.35" fill="${purple}"/><circle cx="-0.4" cy="-0.3" r="0.25" fill="${yellow}" opacity="0.9"/><circle cx="0.4" cy="-0.35" r="0.25" fill="${red}" opacity="0.9"/></g>`;
}
function svgWateringCan(x, y, c, _v) {
  const metal = c.sledRunner || "#607080";
  const accent = c.sproutGreen;
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1" ry="0.5" fill="${metal}"/><rect x="-0.8" y="-1.2" width="1.6" height="1.2" rx="0.2" fill="${metal}"/><path d="M0.6,-0.8 Q1.2,-1.2 1.8,-1" stroke="${metal}" fill="none" stroke-width="0.2"/><line x1="1.8" y1="-1" x2="2.5" y2="-0.5" stroke="${metal}" stroke-width="0.25"/><ellipse cx="2.5" cy="-0.4" rx="0.25" ry="0.15" fill="${metal}"/><path d="M-0.5,-1.2 Q-0.5,-2 0,-2 Q0.5,-2 0.5,-1.2" stroke="${accent}" fill="none" stroke-width="0.15"/></g>`;
}
function svgSeedling(x, y, c, v) {
  const green = c.sproutGreen;
  const soil = c.gardenSoil;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="0.6" ry="0.2" fill="${soil}"/><line x1="0" y1="0" x2="0" y2="-1" stroke="${green}" stroke-width="0.12"/><ellipse cx="-0.4" cy="-1.2" rx="0.35" ry="0.2" fill="${green}" transform="rotate(-30,-0.4,-1.2)"/><ellipse cx="0.4" cy="-1.2" rx="0.35" ry="0.2" fill="${green}" transform="rotate(30,0.4,-1.2)"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="0.5" ry="0.15" fill="${soil}"/><line x1="0" y1="0" x2="0" y2="-0.8" stroke="${green}" stroke-width="0.1"/><ellipse cx="0" cy="-1" rx="0.25" ry="0.4" fill="${green}"/></g>`;
}
var init_seasonal_spring_cherry_blossom_full = __esm({
  "src/themes/terrain/assets/renderers/seasonal-spring-cherry-blossom-full.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-spring-robin-bird.ts
function svgRobinBird(x, y, c, v) {
  const brown = c.owl || "#8a7050";
  const red = c.tulipRed;
  const beak = c.tulipYellow;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="0.8" ry="0.5" fill="${brown}"/><ellipse cx="0.2" cy="-0.1" rx="0.4" ry="0.35" fill="${red}"/><circle cx="0.7" cy="-0.3" r="0.35" fill="${brown}"/><polygon points="1,-0.3 1.3,-0.1 1,-0.15" fill="${beak}"/><polygon points="1,-0.3 1.3,-0.4 1,-0.35" fill="${beak}"/><circle cx="0.8" cy="-0.35" r="0.08" fill="#000"/><line x1="-0.6" y1="0.4" x2="-0.6" y2="0.7" stroke="${brown}" stroke-width="0.1"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="0.8" ry="0.5" fill="${brown}"/><ellipse cx="0.2" cy="-0.1" rx="0.4" ry="0.35" fill="${red}"/><circle cx="0.7" cy="-0.3" r="0.35" fill="${brown}"/><polygon points="1,-0.3 1.4,-0.25 1,-0.2" fill="${beak}"/><circle cx="0.8" cy="-0.35" r="0.08" fill="#000"/><line x1="-0.5" y1="0.4" x2="-0.5" y2="0.7" stroke="${brown}" stroke-width="0.08"/><line x1="0" y1="0.45" x2="0" y2="0.7" stroke="${brown}" stroke-width="0.08"/></g>`;
}
function svgButterflyGarden(x, y, c, v) {
  const wing1 = c.butterfly;
  const wing2 = c.butterflyWing;
  const wing3 = c.tulipPurple;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="-1" rx="0.5" ry="0.25" fill="${wing1}" opacity="0.7"/><ellipse cx="-1.5" cy="-1.2" rx="0.4" ry="0.2" fill="${wing2}" opacity="0.6"/><ellipse cx="0.5" cy="-0.5" rx="0.4" ry="0.2" fill="${wing3}" opacity="0.65"/><ellipse cx="0.1" cy="-0.6" rx="0.3" ry="0.15" fill="${wing2}" opacity="0.55"/><ellipse cx="1" cy="-1.5" rx="0.35" ry="0.18" fill="${wing1}" opacity="0.6"/><ellipse cx="0.7" cy="-1.6" rx="0.25" ry="0.12" fill="${wing3}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="-0.5" cy="-0.8" rx="0.5" ry="0.25" fill="${wing1}" opacity="0.7"/><ellipse cx="-1" cy="-1" rx="0.4" ry="0.2" fill="${wing2}" opacity="0.6"/><ellipse cx="0.8" cy="-1.2" rx="0.45" ry="0.22" fill="${wing3}" opacity="0.65"/><ellipse cx="0.4" cy="-1.3" rx="0.35" ry="0.17" fill="${wing1}" opacity="0.55"/></g>`;
}
function svgUmbrella(x, y, c, v) {
  const colors = [c.parasolRed, c.parasolBlue, c.parasolYellow];
  const color = colors[v] || c.parasolRed;
  const handle = c.trunk;
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><path d="M-2,0 Q0,-2 2,0" fill="${color}" opacity="0.8"/><line x1="0" y1="0" x2="0" y2="0.8" stroke="${handle}" stroke-width="0.2"/><path d="M0,0.8 Q0.3,1 0.2,1.3" stroke="${handle}" fill="none" stroke-width="0.15"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="-0.3" y1="1" x2="0.5" y2="-2.5" stroke="${handle}" stroke-width="0.2"/><polygon points="0.4,-2.5 0.7,-2 0.6,-2.5 0.3,-2.5" fill="${color}"/><path d="M0.4,-2.5 L0.5,-1 L0.2,-1 Z" fill="${color}" opacity="0.8"/><path d="M-0.3,1 Q-0.5,1.2 -0.3,1.4" stroke="${handle}" fill="none" stroke-width="0.12"/></g>`;
}
var init_seasonal_spring_robin_bird = __esm({
  "src/themes/terrain/assets/renderers/seasonal-spring-robin-bird.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-summer-parasol.ts
function svgParasol(x, y, c, v) {
  const colors = [c.parasolRed, c.parasolBlue, c.parasolYellow];
  const color = colors[v] || c.parasolRed;
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-4" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.4"/><path d="M-3,-4 Q0,-6 3,-4 L0,-4.5 Z" fill="${color}"/><path d="M-1.5,-4.2 Q0,-5 1.5,-4.2" fill="${c.parasolStripe}" opacity="0.3"/></g>`;
}
function svgBeachTowel(x, y, c, v) {
  const colors = [c.beachTowelA, c.beachTowelB, c.parasolYellow];
  const color = colors[v] || c.beachTowelA;
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-0.3" width="5" height="1.5" rx="0.3" fill="${color}" opacity="0.8"/><circle cx="-0.3" cy="0.2" r="0.35" fill="#333" opacity="0.6"/><circle cx="0.4" cy="0.2" r="0.35" fill="#333" opacity="0.6"/><line x1="-0.3" y1="0.2" x2="0.4" y2="0.2" stroke="#333" stroke-width="0.15"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-2.5" y="-0.3" width="5" height="1.5" rx="0.3" fill="${color}" opacity="0.8"/>` + (v === 0 ? `<line x1="-2.5" y1="0.3" x2="2.5" y2="0.3" stroke="${c.parasolStripe}" stroke-width="0.3" opacity="0.4"/>` : "") + `</g>`;
}
function svgSandcastleSummer(x, y, c, v) {
  const sand = c.sandcastleWall;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-1" width="3" height="1.5" fill="${sand}"/><rect x="-0.8" y="-2" width="1.6" height="1" fill="${sand}"/><rect x="-0.4" y="-2.8" width="0.8" height="0.8" fill="${sand}"/><line x1="0" y1="-2.8" x2="0" y2="-3.5" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.2"/><polygon points="0,-3.5 0.8,-3.2 0,-2.9" fill="${c.scarfRed || "#cc3030"}"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-2" y="-0.5" width="4" height="1" fill="${sand}"/><rect x="-1.5" y="-1.5" width="1.2" height="1" fill="${sand}"/><rect x="0.3" y="-1.5" width="1.2" height="1" fill="${sand}"/><rect x="-0.5" y="-2.5" width="1" height="1" fill="${sand}"/><polygon points="-1.5,-1.5 -0.9,-2 -0.3,-1.5" fill="${sand}" opacity="0.8"/><polygon points="0.3,-1.5 0.9,-2 1.5,-1.5" fill="${sand}" opacity="0.8"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-1.2" y="-0.5" width="2.4" height="1" fill="${sand}"/><rect x="-0.6" y="-1.3" width="1.2" height="0.8" fill="${sand}"/><polygon points="-0.6,-1.3 0,-1.8 0.6,-1.3" fill="${sand}" opacity="0.8"/></g>`;
}
function svgSurfboard(x, y, c, v) {
  const body = c.surfboardBody;
  const stripe = c.surfboardStripe;
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="-2" rx="0.8" ry="3" fill="${body}" transform="rotate(${v === 1 ? -10 : v === 2 ? 10 : 5})"/><line x1="0" y1="-3.5" x2="0" y2="-0.5" stroke="${stripe}" stroke-width="0.3" opacity="0.6" transform="rotate(${v === 1 ? -10 : v === 2 ? 10 : 5})"/></g>`;
}
function svgIceCreamCartAsset(x, y, c, v) {
  const cart = c.iceCreamCart;
  const umbrella = c.iceCreamUmbrella;
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-1.5" width="3" height="2" rx="0.3" fill="${cart}"/><circle cx="-1" cy="0.8" r="0.4" fill="#555"/><circle cx="1" cy="0.8" r="0.4" fill="#555"/><line x1="0" y1="-1.5" x2="0" y2="-3.5" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.3"/><path d="M-2,-3.5 Q0,-4.5 2,-3.5" fill="${umbrella}"/>` + /* v8 ignore start */
  (v === 1 ? `<polygon points="1.5,-2 2.5,-2.3 1.5,-2.5" fill="${c.scarfRed || "#cc3030"}"/>` : "") + (v === 2 ? `<rect x="-0.5" y="-2.5" width="1" height="0.8" rx="0.2" fill="${c.sunflowerPetal || "#f0c820"}"/>` : "") + /* v8 ignore stop */
  `</g>`;
}
function svgHammock(x, y, c, v) {
  const fabric = c.hammockFabric;
  return `<g transform="translate(${x},${y})"><line x1="-3" y1="0" x2="-3" y2="-3" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.5"/><line x1="3" y1="0" x2="3" y2="-3" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.5"/><path d="M-3,-2.5 Q0,-0.5 3,-2.5" fill="none" stroke="${fabric}" stroke-width="0.8"/><path d="M-2.5,-2.2 Q0,-0.2 2.5,-2.2" fill="${fabric}" opacity="0.5"/>` + /* v8 ignore start */
  (v === 2 ? `<rect x="-1" y="-1.8" width="2" height="1" rx="0.3" fill="${c.beachTowelA || "#e05050"}" opacity="0.4"/>` : "") + /* v8 ignore stop */
  `</g>`;
}
function svgSunflower(x, y, c, v) {
  const petal = c.sunflowerPetal;
  const center = c.sunflowerCenter;
  const stem = c.tulipStem || "#5a9a40";
  const count = v === 2 ? 3 : v === 1 ? 2 : 1;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const ox = i * 1.5 - (count - 1) * 0.75;
    const h = 3 + i * 0.5;
    parts.push(
      `<line x1="${ox}" y1="0.5" x2="${ox}" y2="${-h}" stroke="${stem}" stroke-width="0.4"/>`,
      `<circle cx="${ox}" cy="${-h}" r="0.6" fill="${center}"/>`
    );
    for (let p = 0; p < 8; p++) {
      const angle = p / 8 * Math.PI * 2;
      const px = ox + Math.cos(angle) * 1.2;
      const py = -h + Math.sin(angle) * 1.2;
      parts.push(
        `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="0.5" ry="0.25" fill="${petal}" transform="rotate(${(p * 45).toFixed(0)},${px.toFixed(1)},${py.toFixed(1)})"/>`
      );
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
function svgWatermelon(x, y, c, v) {
  const rind = c.watermelonRind;
  const flesh = c.watermelonFlesh;
  const seed = c.watermelonSeed;
  if (v === 0) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.5" ry="1" fill="${rind}"/><line x1="-1" y1="0" x2="1" y2="0" stroke="${rind}" stroke-width="0.15" opacity="0.5"/></g>`;
  }
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M-1.5,0 A1.5,1 0 0 1 1.5,0 Z" fill="${rind}"/><path d="M-1.2,0 A1.2,0.8 0 0 1 1.2,0 Z" fill="${flesh}"/><circle cx="-0.3" cy="-0.2" r="0.12" fill="${seed}"/><circle cx="0.4" cy="-0.3" r="0.12" fill="${seed}"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><path d="M-1,0 Q0,-1.5 1,0 Z" fill="${rind}"/><path d="M-0.8,0 Q0,-1.2 0.8,0 Z" fill="${flesh}"/><circle cx="-0.2" cy="-0.3" r="0.1" fill="${seed}"/><circle cx="0.3" cy="-0.4" r="0.1" fill="${seed}"/></g>`;
}
function svgSprinkler(x, y, c, v) {
  const metal = c.sprinklerMetal;
  const water = c.poolWater || c.water;
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-0.5" stroke="${metal}" stroke-width="0.5"/><circle cx="0" cy="-0.8" r="0.4" fill="${metal}"/><line x1="-1.5" y1="-2" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/><line x1="1.5" y1="-2" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/><line x1="0" y1="-2.5" x2="0" y2="-0.8" stroke="${water}" stroke-width="0.2" opacity="0.4"/>` + (v === 2 ? `<path d="M-1.5,-2 Q0,-1.5 1.5,-2" fill="none" stroke="${water}" stroke-width="0.15" opacity="0.3"/>` : "") + `</g>`;
}
var init_seasonal_summer_parasol = __esm({
  "src/themes/terrain/assets/renderers/seasonal-summer-parasol.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-summer-lemonade.ts
function svgLemonade(x, y, c, v) {
  const stand = c.lemonadeStand;
  return `<g transform="translate(${x},${y})"><rect x="-2" y="-1.5" width="4" height="2" fill="${stand}"/><line x1="-2" y1="-1.5" x2="-2" y2="0.8" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.4"/><line x1="2" y1="-1.5" x2="2" y2="0.8" stroke="${c.bareBranch || "#6a5a4a"}" stroke-width="0.4"/>` + /* v8 ignore stop */
  (v >= 1 ? `<rect x="-1" y="-2" width="2" height="0.5" rx="0.2" fill="${stand}" opacity="0.8"/>` : "") + /* v8 ignore start */
  `<circle cx="0" cy="-0.8" r="0.4" fill="${c.sunflowerPetal || "#f0c820"}" opacity="0.7"/></g>`;
}
function svgFirefliesAsset(x, y, c, v) {
  const glow = c.lanternGlow || "#ffc840";
  const count = v === 0 ? 3 : v === 1 ? 6 : 1;
  const parts = [];
  if (v === 2) {
    parts.push(
      `<rect x="-0.5" y="-2" width="1" height="1.5" rx="0.2" fill="#fff" opacity="0.15"/>`
    );
    parts.push(`<circle cx="0" cy="-1.5" r="0.2" fill="${glow}" opacity="0.8"/>`);
    parts.push(`<circle cx="-0.2" cy="-1" r="0.15" fill="${glow}" opacity="0.6"/>`);
  } else {
    for (let i = 0; i < count; i++) {
      const fx = (i - count / 2) * 1.5;
      const fy = -1 - i * 0.5;
      parts.push(`<circle cx="${fx}" cy="${fy}" r="0.2" fill="${glow}" opacity="0.7"/>`);
      parts.push(`<circle cx="${fx}" cy="${fy}" r="0.5" fill="${glow}" opacity="0.15"/>`);
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
function svgSwimmingPool(x, y, c, v) {
  const water = c.poolWater;
  const edge = c.poolEdge;
  return `<g transform="translate(${x},${y})"><rect x="-3" y="-1" width="6" height="2.5" rx="0.5" fill="${edge}"/><rect x="-2.5" y="-0.5" width="5" height="1.5" rx="0.3" fill="${water}" opacity="0.7"/>` + /* v8 ignore start */
  (v === 1 ? `<ellipse cx="0.5" cy="0" rx="0.8" ry="0.3" fill="${c.parasolYellow || "#e8c820"}" opacity="0.5"/>` : "") + /* v8 ignore stop */
  (v === 2 ? `<line x1="2.5" y1="-1" x2="2.5" y2="-2.5" stroke="${edge}" stroke-width="0.3"/>` : "") + `</g>`;
}
var init_seasonal_summer_lemonade = __esm({
  "src/themes/terrain/assets/renderers/seasonal-summer-lemonade.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-autumn-autumn-maple.ts
function svgAutumnMaple(x, y, c, v) {
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4" r="2.2" fill="${c.autumnGold}" opacity="0.7"/><circle cx="-1.5" cy="-3" r="1.5" fill="${c.mapleOrange}" opacity="0.65"/><circle cx="1.5" cy="-3" r="1.5" fill="${c.autumnRust}" opacity="0.6"/><circle cx="0" cy="-5.5" r="1" fill="${c.autumnBronze}" opacity="0.55"/><circle cx="-0.5" cy="-2.5" r="0.8" fill="${c.autumnGold}" opacity="0.5"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-3.8" r="2" fill="${c.mapleRed}" opacity="0.65"/><circle cx="-1.2" cy="-3" r="1.3" fill="${c.autumnGold}" opacity="0.6"/><circle cx="1.2" cy="-3" r="1.3" fill="${c.mapleCrimson}" opacity="0.55"/><circle cx="0" cy="-5" r="0.9" fill="${c.autumnBronze}" opacity="0.5"/><ellipse cx="-1.5" cy="0.5" rx="0.4" ry="0.15" fill="${c.mapleRed}" opacity="0.5"/><ellipse cx="1" cy="0.3" rx="0.3" ry="0.12" fill="${c.autumnGold}" opacity="0.45"/><ellipse cx="0" cy="0.6" rx="0.35" ry="0.12" fill="${c.mapleOrange}" opacity="0.4"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="3.5" fill="${trunk}"/><circle cx="0" cy="-4" r="2.5" fill="${c.mapleRed}" opacity="0.7"/><circle cx="-1.5" cy="-3" r="1.5" fill="${c.mapleCrimson}" opacity="0.6"/><circle cx="1.5" cy="-3" r="1.5" fill="${c.mapleOrange}" opacity="0.55"/><circle cx="0" cy="-5.5" r="1.2" fill="${c.mapleRed}" opacity="0.5"/><circle cx="-0.8" cy="-2.5" r="0.9" fill="${c.mapleCrimson}" opacity="0.45"/></g>`;
}
function svgAutumnOak(x, y, c, v) {
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2.8" fill="${c.autumnBronze}" opacity="0.65"/><circle cx="-1.2" cy="-4.5" r="1.5" fill="${c.autumnOlive}" opacity="0.55"/><circle cx="1.5" cy="-4" r="1.3" fill="${c.oakBrown}" opacity="0.6"/><circle cx="-0.5" cy="-2.5" r="1" fill="${c.autumnBronze}" opacity="0.5"/><circle cx="0.5" cy="-5.5" r="0.8" fill="${c.autumnOlive}" opacity="0.4"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2.6" fill="${c.autumnRust}" opacity="0.65"/><circle cx="-1.4" cy="-4.2" r="1.4" fill="${c.autumnBurgundy}" opacity="0.6"/><circle cx="1.3" cy="-3.8" r="1.5" fill="${c.autumnBronze}" opacity="0.55"/><circle cx="0" cy="-5.5" r="1" fill="${c.autumnRust}" opacity="0.5"/><ellipse cx="0" cy="0.5" rx="1.5" ry="0.3" fill="${c.autumnBurgundy}" opacity="0.3"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.7" y="-1" width="1.4" height="4" fill="${trunk}"/><circle cx="0" cy="-3.5" r="2.8" fill="${c.oakGold}" opacity="0.7"/><circle cx="-1.2" cy="-4.5" r="1.5" fill="${c.autumnGold}" opacity="0.6"/><circle cx="1.5" cy="-4" r="1.4" fill="${c.autumnBronze}" opacity="0.55"/><circle cx="-0.5" cy="-2.5" r="1" fill="${c.oakGold}" opacity="0.5"/><ellipse cx="0.8" cy="-2" rx="0.25" ry="0.35" fill="${c.acornBody}"/></g>`;
}
function svgAutumnBirch(x, y, c, v) {
  const yellow = c.birchYellow;
  const bark = c.birchBark;
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="4" fill="${bark}"/><line x1="0" y1="-2" x2="-2" y2="-3.5" stroke="${bark}" stroke-width="0.3"/><line x1="0" y1="-3" x2="1.5" y2="-4" stroke="${bark}" stroke-width="0.3"/><circle cx="-1.5" cy="-3.8" r="1" fill="${yellow}" opacity="0.4"/><circle cx="1" cy="-4.2" r="0.8" fill="${yellow}" opacity="0.35"/></g>`;
  }
  const opacity = v === 1 ? 0.55 : 0.7;
  return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="4" fill="${bark}"/><circle cx="0" cy="-3" r="2" fill="${yellow}" opacity="${opacity}"/><circle cx="-1" cy="-2" r="1.2" fill="${yellow}" opacity="${opacity * 0.8}"/><circle cx="1" cy="-3.5" r="1" fill="${yellow}" opacity="${opacity * 0.7}"/></g>`;
}
function svgAutumnGinkgo(x, y, c, v) {
  const yellow = c.ginkgoYellow;
  const trunk = c.trunk;
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/><circle cx="0" cy="-3" r="1.8" fill="${yellow}" opacity="0.55"/><ellipse cx="0" cy="0.5" rx="2" ry="0.4" fill="${yellow}" opacity="0.3"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/><circle cx="0" cy="-3" r="1.5" fill="${yellow}" opacity="0.4"/><ellipse cx="0" cy="0.5" rx="3" ry="0.8" fill="${yellow}" opacity="0.35"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-0.4" y="-1" width="0.8" height="3" fill="${trunk}"/><circle cx="0" cy="-3.2" r="2" fill="${yellow}" opacity="0.7"/><circle cx="-0.8" cy="-2.5" r="1" fill="${yellow}" opacity="0.5"/><circle cx="0.8" cy="-2.5" r="1" fill="${yellow}" opacity="0.5"/></g>`;
}
function svgFallenLeaves(x, y, c, v) {
  const colors = v === 0 ? [c.fallenLeafRed, c.fallenLeafOrange] : v === 1 ? [c.fallenLeafGold, c.fallenLeafBrown] : [c.fallenLeafRed, c.fallenLeafGold, c.fallenLeafOrange];
  const parts = [];
  for (let i = 0; i < colors.length; i++) {
    const lx = (i - colors.length / 2) * 1.2;
    const ly = i % 2 * 0.3;
    const rot = i * 35 - 20;
    parts.push(
      `<ellipse cx="${lx}" cy="${ly}" rx="0.6" ry="0.25" fill="${colors[i]}" opacity="0.7" transform="rotate(${rot},${lx},${ly})"/>`
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
function svgLeafSwirl(x, y, c, v) {
  const colors = v === 1 ? [c.fallenLeafRed, c.mapleRed] : v === 2 ? [c.fallenLeafGold, c.oakGold] : [c.fallenLeafRed, c.fallenLeafOrange, c.fallenLeafGold];
  const parts = [];
  for (let i = 0; i < colors.length; i++) {
    const angle = i / colors.length * Math.PI * 2;
    const radius = 1 + i * 0.3;
    const lx = Math.cos(angle) * radius;
    const ly = -1.5 + Math.sin(angle) * radius * 0.5;
    parts.push(
      `<ellipse cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" rx="0.4" ry="0.2" fill="${colors[i]}" opacity="0.65" transform="rotate(${(i * 60).toFixed(0)},${lx.toFixed(1)},${ly.toFixed(1)})"/>`
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
function svgAcorn(x, y, c, v) {
  const body = c.acornBody;
  const cap = c.acornCap;
  const count = v === 1 ? 2 : 1;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const ax = i * 1 - (count - 1) * 0.5;
    if (v === 2) {
      parts.push(`<ellipse cx="${ax}" cy="0" rx="0.4" ry="0.5" fill="${body}"/>`);
      parts.push(`<ellipse cx="${ax + 0.5}" cy="0.1" rx="0.4" ry="0.25" fill="${cap}"/>`);
    } else {
      parts.push(`<ellipse cx="${ax}" cy="0" rx="0.4" ry="0.5" fill="${body}"/>`);
      parts.push(`<path d="M${ax - 0.45},-0.15 Q${ax},-0.45 ${ax + 0.45},-0.15" fill="${cap}"/>`);
      parts.push(
        `<line x1="${ax}" y1="-0.35" x2="${ax}" y2="-0.55" stroke="${cap}" stroke-width="0.15"/>`
      );
    }
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
var init_seasonal_autumn_autumn_maple = __esm({
  "src/themes/terrain/assets/renderers/seasonal-autumn-autumn-maple.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-autumn-corn-stalk.ts
function svgCornStalkAsset(x, y, c, v) {
  const stalk = c.cornStalkColor;
  const ear = c.cornEar;
  const count = v === 1 ? 3 : 1;
  const parts = [];
  for (let i = 0; i < count; i++) {
    const sx = i * 1.2 - (count - 1) * 0.6;
    parts.push(
      `<line x1="${sx}" y1="0.5" x2="${sx}" y2="-3" stroke="${stalk}" stroke-width="0.4"/>`
    );
    if (v === 2 || v === 0) {
      parts.push(`<ellipse cx="${sx + 0.5}" cy="-1.5" rx="0.3" ry="0.7" fill="${ear}"/>`);
    }
    parts.push(
      `<path d="M${sx},-2 Q${sx + 1.5},-2.5 ${sx + 1},-1" fill="${stalk}" opacity="0.5"/>`
    );
    parts.push(
      `<path d="M${sx},-1.5 Q${sx - 1.5},-2 ${sx - 1},-0.5" fill="${stalk}" opacity="0.5"/>`
    );
  }
  return `<g transform="translate(${x},${y})">${parts.join("")}</g>`;
}
function svgScarecrowAutumn(x, y, c, v) {
  const hat = c.scarecrowHat || "#5a4020";
  const body = c.scarecrow || "#8a7040";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/><line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/><circle cx="0" cy="-3.5" r="0.8" fill="${c.lambWool || "#f0ece5"}"/><rect x="-1.2" y="-4.5" width="2.4" height="0.5" fill="${hat}"/><rect x="-0.7" y="-5" width="1.4" height="0.6" fill="${hat}"/><circle cx="1.8" cy="-2" r="0.4" fill="#333"/><polygon points="1.8,-2 2.5,-2.1 1.8,-1.8" fill="#333"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/><line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/><circle cx="0" cy="-3.8" r="1" fill="${c.pumpkin || "#d07020"}"/><polygon points="-0.3,-3.8 0,-4.3 0.3,-3.8" fill="#333"/><polygon points="0,-3.5 0.5,-3.3 0,-3.2" fill="#333"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="1" x2="0" y2="-3" stroke="${body}" stroke-width="0.5"/><line x1="-2" y1="-1.5" x2="2" y2="-1.5" stroke="${body}" stroke-width="0.4"/><circle cx="0" cy="-3.5" r="0.8" fill="${c.lambWool || "#f0ece5"}"/><rect x="-1.2" y="-4.5" width="2.4" height="0.5" fill="${hat}"/><rect x="-0.7" y="-5" width="1.4" height="0.6" fill="${hat}"/><ellipse cx="0" cy="-1" rx="1.2" ry="1.5" fill="${body}" opacity="0.5"/><ellipse cx="-1" cy="-1.8" rx="0.4" ry="0.2" fill="${c.fallenLeafRed || "#c04030"}"/></g>`;
}
function svgHarvestBasket(x, y, c, v) {
  const basket = c.oakBrown || "#8a6030";
  const contents = v === 0 ? [c.harvestApple, c.harvestApple] : v === 1 ? (
    /* v8 ignore start */
    [c.sproutGreen || "#80d050", c.harvestApple, c.sunflowerPetal || "#f0c820"]
  ) : (
    /* v8 ignore stop */
    [c.harvestGrape, c.harvestGrape]
  );
  return `<g transform="translate(${x},${y})"><path d="M-1.5,0 Q-1.8,-1 -1,-1.5 Q0,-1.8 1,-1.5 Q1.8,-1 1.5,0 Z" fill="${basket}"/><path d="M-1,-1.3 Q0,-2 1,-1.3" fill="none" stroke="${basket}" stroke-width="0.3"/>` + contents.map(
    (col, i) => `<circle cx="${(i - (contents.length - 1) / 2) * 0.6}" cy="-1" r="0.35" fill="${col}"/>`
  ).join("") + `</g>`;
}
function svgHotDrink(x, y, c, v) {
  const mug = c.hotDrinkMug;
  const steam = c.hotDrinkSteam;
  return `<g transform="translate(${x},${y})"><rect x="-0.6" y="-1" width="1.2" height="1.2" rx="0.2" fill="${mug}"/><path d="M0.6,-0.5 Q1.2,-0.5 1.2,-0.1 Q1.2,0.2 0.6,0.2" fill="none" stroke="${mug}" stroke-width="0.2"/><path d="M-0.3,-1.2 Q-0.3,-1.8 0,-1.5 Q0.3,-1.8 0.3,-1.2" fill="none" stroke="${steam}" stroke-width="0.2" opacity="0.5"/>` + (v >= 1 ? `<path d="M0,-1.5 Q0.2,-2 0,-2.2" fill="none" stroke="${steam}" stroke-width="0.15" opacity="0.4"/>` : "") + `</g>`;
}
function svgAutumnWreath(x, y, c, v) {
  const green = c.wreathGreen;
  const berry = c.wreathBerry;
  return `<g transform="translate(${x},${y})"><circle cx="0" cy="-1.5" r="1.5" fill="none" stroke="${green}" stroke-width="0.8"/><circle cx="0" cy="-1.5" r="1.2" fill="none" stroke="${green}" stroke-width="0.4" opacity="0.5"/>` + (v >= 1 ? `<circle cx="0.8" cy="-0.8" r="0.2" fill="${berry}"/><circle cx="1" cy="-1" r="0.2" fill="${berry}"/>` : "") + /* v8 ignore start */
  (v === 2 ? `<path d="M-0.3,-0.2 Q0,0.2 0.3,-0.2" fill="${c.scarfRed || "#cc3030"}" opacity="0.7"/>` : "") + /* v8 ignore stop */
  `</g>`;
}
function svgPumpkinPatch(x, y, c, v) {
  const pumpkin = c.pumpkin;
  const stem = c.trunk;
  const vine = c.autumnOlive || "#8b8b40";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><ellipse cx="-1" cy="0" rx="1" ry="0.7" fill="${pumpkin}"/><rect x="-1.15" y="-0.7" width="0.3" height="0.4" fill="${stem}"/><ellipse cx="0.8" cy="0.2" rx="0.8" ry="0.6" fill="${pumpkin}"/><rect x="0.65" y="-0.4" width="0.25" height="0.35" fill="${stem}"/><ellipse cx="0" cy="0.5" rx="0.6" ry="0.45" fill="${pumpkin}" opacity="0.9"/><path d="M-1.5,-0.3 Q-2,-0.8 -1.5,-1.2" stroke="${vine}" fill="none" stroke-width="0.15"/></g>`;
  }
  if (v === 2) {
    return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="1.4" ry="1" fill="${pumpkin}"/><line x1="-0.5" y1="-0.9" x2="-0.5" y2="0.9" stroke="${c.autumnRust || "#c05530"}" stroke-width="0.1" opacity="0.3"/><line x1="0.5" y1="-0.9" x2="0.5" y2="0.9" stroke="${c.autumnRust || "#c05530"}" stroke-width="0.1" opacity="0.3"/><rect x="-0.15" y="-1" width="0.3" height="0.5" fill="${stem}"/><path d="M0.1,-0.8 Q0.8,-1.2 1.2,-0.8" stroke="${vine}" fill="none" stroke-width="0.12"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><ellipse cx="-0.6" cy="0" rx="0.9" ry="0.65" fill="${pumpkin}"/><rect x="-0.75" y="-0.65" width="0.25" height="0.35" fill="${stem}"/><ellipse cx="0.7" cy="0.15" rx="0.7" ry="0.5" fill="${pumpkin}" opacity="0.9"/><rect x="0.55" y="-0.35" width="0.22" height="0.3" fill="${stem}"/><path d="M-1,-0.2 Q-1.5,-0.5 -1.3,-1" stroke="${vine}" fill="none" stroke-width="0.12"/></g>`;
}
function svgHayMaze(x, y, c, v) {
  const hay = c.haybale;
  const accent = c.autumnGold || "#d4a84b";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><rect x="-2" y="-0.8" width="4" height="1.2" rx="0.2" fill="${hay}"/><rect x="-2" y="-2" width="1.2" height="1.3" rx="0.2" fill="${hay}"/><line x1="-1.5" y1="-0.7" x2="-1.5" y2="0.3" stroke="${accent}" stroke-width="0.08"/><line x1="0" y1="-0.7" x2="0" y2="0.3" stroke="${accent}" stroke-width="0.08"/><line x1="1.5" y1="-0.7" x2="1.5" y2="0.3" stroke="${accent}" stroke-width="0.08"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><rect x="-1.5" y="-0.5" width="3" height="1" rx="0.2" fill="${hay}"/><rect x="-1" y="-1.3" width="2" height="0.9" rx="0.2" fill="${hay}" opacity="0.9"/><line x1="-0.8" y1="-0.4" x2="-0.8" y2="0.4" stroke="${accent}" stroke-width="0.08"/><line x1="0.8" y1="-0.4" x2="0.8" y2="0.4" stroke="${accent}" stroke-width="0.08"/></g>`;
}
var init_seasonal_autumn_corn_stalk = __esm({
  "src/themes/terrain/assets/renderers/seasonal-autumn-corn-stalk.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/seasonal-autumn-apple-basket.ts
function svgAppleBasket(x, y, c, v) {
  const basket = c.nestBrown || "#7a5530";
  const apple = c.appleRed || "#c41e3a";
  const green = c.pearGreen || "#d1e231";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><path d="M-1.2,0 Q-1.5,-1 0,-1 Q1.5,-1 1.2,0 L1,0.3 L-1,0.3 Z" fill="${basket}"/><circle cx="-0.5" cy="-0.8" r="0.4" fill="${apple}"/><circle cx="0.3" cy="-0.9" r="0.35" fill="${apple}"/><circle cx="0" cy="-0.5" r="0.4" fill="${green}"/><circle cx="-0.2" cy="-1.3" r="0.35" fill="${apple}"/><circle cx="0.5" cy="-0.4" r="0.3" fill="${apple}" opacity="0.9"/><path d="M-0.5,0.3 Q0,-0.2 0.5,0.3" stroke="${basket}" fill="none" stroke-width="0.1"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><path d="M-1,0 Q-1.3,-0.8 0,-0.8 Q1.3,-0.8 1,0 L0.8,0.2 L-0.8,0.2 Z" fill="${basket}"/><circle cx="-0.3" cy="-0.5" r="0.35" fill="${apple}"/><circle cx="0.3" cy="-0.6" r="0.3" fill="${apple}"/><circle cx="0" cy="-0.3" r="0.3" fill="${green}"/><path d="M-0.4,0.2 Q0,-0.1 0.4,0.2" stroke="${basket}" fill="none" stroke-width="0.08"/></g>`;
}
function svgRake(x, y, c, v) {
  const handle = c.trunk;
  const metal = c.sledRunner || "#607080";
  const leaf = c.fallenLeafOrange || "#d08030";
  if (v === 1) {
    return `<g transform="translate(${x},${y})"><line x1="-1" y1="1" x2="1.5" y2="-3" stroke="${handle}" stroke-width="0.3"/><rect x="0.8" y="-3.2" width="1.5" height="0.3" fill="${metal}"/><line x1="0.9" y1="-3" x2="0.9" y2="-2.2" stroke="${metal}" stroke-width="0.12"/><line x1="1.3" y1="-3" x2="1.3" y2="-2.2" stroke="${metal}" stroke-width="0.12"/><line x1="1.7" y1="-3" x2="1.7" y2="-2.2" stroke="${metal}" stroke-width="0.12"/><line x1="2.1" y1="-3" x2="2.1" y2="-2.2" stroke="${metal}" stroke-width="0.12"/><ellipse cx="-1.5" cy="0.8" rx="1.2" ry="0.5" fill="${leaf}" opacity="0.6"/><ellipse cx="-1.2" cy="0.5" rx="0.8" ry="0.3" fill="${c.fallenLeafRed || "#c04030"}" opacity="0.5"/></g>`;
  }
  return `<g transform="translate(${x},${y})"><line x1="0" y1="0.5" x2="0" y2="-2.5" stroke="${handle}" stroke-width="0.25"/><rect x="-0.8" y="-2.7" width="1.6" height="0.25" fill="${metal}"/><line x1="-0.6" y1="-2.5" x2="-0.6" y2="-1.8" stroke="${metal}" stroke-width="0.1"/><line x1="-0.2" y1="-2.5" x2="-0.2" y2="-1.8" stroke="${metal}" stroke-width="0.1"/><line x1="0.2" y1="-2.5" x2="0.2" y2="-1.8" stroke="${metal}" stroke-width="0.1"/><line x1="0.6" y1="-2.5" x2="0.6" y2="-1.8" stroke="${metal}" stroke-width="0.1"/></g>`;
}
var init_seasonal_autumn_apple_basket = __esm({
  "src/themes/terrain/assets/renderers/seasonal-autumn-apple-basket.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers/korean-village.ts
function svgHanok(x, y, c, v) {
  const roof = ["#42566a", "#526b76", "#3d4d60"][v % 3];
  return `<g transform="translate(${x},${y})" data-style="korean"><path d="M-6,0 L0,3 L7,-0.5 L1,-3.5Z" fill="${c.rock}"/><path d="M-5,-1 L0,1.5 L0,-5.2 L-5,-7.3Z" fill="#eee0bc"/><path d="M0,1.5 L6,-1.5 L6,-7.5 L0,-5.2Z" fill="#d6c8a9"/><g data-part="wooden-lattice" stroke="${c.trunk}" stroke-width="0.5" fill="none"><path d="M-5,-7 L-5,-1 M0,-5.2 L0,1.5 M6,-7.4 L6,-1.5 M-5,-4.8 L0,-2.4 L6,-5.4"/><path d="M1,-4.7 L4.8,-6.6 L4.8,-2.6 L1,-0.7Z M2.2,-5.3 L2.2,-1.3 M3.5,-6 L3.5,-2"/></g><g data-part="giwa-roof"><path d="M-8,-7.2 Q-5,-7.6 -2,-11 L3,-13 Q4,-9.8 8,-9.1 L1,-5.7 Q-4,-5.7 -8,-7.2Z" fill="${roof}" stroke="#293a49" stroke-width="0.45"/><path d="M-2,-11 L3,-13 M-8,-7.2 Q-3,-6.5 1,-5.7 L8,-9.1" fill="none" stroke="#a7b5b6" stroke-width="0.65"/><path d="M-4.8,-8.2 L1.2,-10.9 M-3,-7.5 L2.5,-10.1 M-1,-6.9 L4.4,-9.5 M1,-6.6 L6.1,-9" stroke="#829598" stroke-width="0.3"/></g></g>`;
}
function svgPavilion(x, y, c, v) {
  const roof = ["#3d5960", "#4e6179", "#526a60"][v % 3];
  return `<g transform="translate(${x},${y})" data-style="korean"><path d="M-6,0 L0,3 L6,0 L0,-3Z" fill="${c.rock}"/><path d="M-5,-1 L0,1.5 L5,-1 L0,-3.5Z" fill="#b48e64"/><g data-part="open-pillars" stroke="#815334" stroke-width="0.8"><path d="M-4.4,-1.3 V-7.6 M0,0.8 V-5.6 M4.4,-1.3 V-7.6 M0,-3.4 V-9.4"/></g><path d="M-5,-6.7 L0,-4.4 L5,-6.7" stroke="#5f8b6c" stroke-width="1.1" fill="none"/><g data-part="giwa-roof"><path d="M-7,-7 Q-3.8,-7.3 0,-13 Q3.8,-7.3 7,-7 L0,-4.7Z" fill="${roof}" stroke="#304a4d" stroke-width="0.45"/><path d="M-7,-7 L0,-4.7 L7,-7 M0,-12.5 V-11" fill="none" stroke="#9badb0" stroke-width="0.6"/></g><path d="M-4,-1.7 L0,0.3 L4,-1.7" fill="none" stroke="#a8784a" stroke-width="0.6"/></g>`;
}
function svgStoneWall(x, y, c, v) {
  const stones = [c.rock, "#a89d85", "#aeb3a5"];
  return `<g transform="translate(${x},${y})" data-style="korean" data-part="stacked-stones"><path d="M-7,-1 L5,5 L7,4 L-5,-2Z" fill="#716f60"/><path d="M-7,-1 V-5 L5,1 V5Z" fill="${stones[v % 3]}" stroke="#666c64" stroke-width="0.4"/><path d="M5,1 L7,0 V4 L5,5Z" fill="#778276"/><path d="M-7,-3 L5,3 M-4,-3.5 V-1.5 M1,-1 V1 M-2,-0.5 V1.5 M3,2 V4" stroke="#67756d" stroke-width="0.45"/><path d="M-7,-5 L-5,-6 L7,0 L5,1Z" fill="#4e6264" stroke="#364d4d" stroke-width="0.4"/><path d="M-4,-4.5 L-2,-5 M0,-2.5 L2,-3 M4,-0.5 L6,-1" stroke="#8ea09b" stroke-width="0.4"/></g>`;
}
function svgOnggi(x, y, c, v) {
  const glaze = ["#785139", "#624b3f", "#925e3c"][v % 3];
  return `<g transform="translate(${x},${y})" data-style="korean" data-part="earthenware-jars"><path d="M-6,0 L0,3 L6,0 L0,-3Z" fill="${c.rock}"/><g fill="${glaze}" stroke="#49372b" stroke-width="0.45"><path d="M-4.7,-3.9 Q-6,-1 -4.5,0 Q-3,0.8 -1.6,-0.2 Q-0.4,-2 -1.8,-4Z"/><ellipse cx="-3.2" cy="-4" rx="1.7" ry="0.55"/><path d="M0.1,-5.9 Q-1.5,-2.6 0.2,-0.7 Q2,0.4 3.8,-1.2 Q5,-3.7 3.5,-6Z"/><ellipse cx="1.8" cy="-6" rx="1.85" ry="0.65"/><path d="M2.1,0 Q1.8,-1.7 2.5,-2.5 L4.9,-2.5 Q5.8,-0.8 4.8,0.7 Q3.5,1.3 2.1,0Z"/><ellipse cx="3.7" cy="-2.5" rx="1.3" ry="0.45"/></g><path d="M-4.5,-2.7 Q-4.8,-1.7 -4.2,-0.8 M0.2,-4.5 Q-0.2,-2.9 0.4,-1.8" stroke="#bb9470" stroke-width="0.55" fill="none"/></g>`;
}
var init_korean_village = __esm({
  "src/themes/terrain/assets/renderers/korean-village.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/assets/renderers.ts
var ASSET_RENDERERS;
var init_renderers = __esm({
  "src/themes/terrain/assets/renderers.ts"() {
    "use strict";
    init_cjs_shims();
    init_water_whale();
    init_water_turtle();
    init_shore_wetland_rock();
    init_grassland_pine();
    init_grassland_rabbit();
    init_forest_willow();
    init_farm_wheat();
    init_farm_sheep();
    init_farm_chicken();
    init_farm_donkey();
    init_farm_pigpen();
    init_farm_pear_tree();
    init_village_tent();
    init_village_shrine();
    init_town_city_market();
    init_town_city_manor();
    init_biome_blend_reeds();
    init_cross_level_cart();
    init_seasonal_winter_snow_pine();
    init_seasonal_winter_igloo();
    init_seasonal_winter_bare_bush();
    init_seasonal_winter_church_winter();
    init_seasonal_spring_cherry_blossom();
    init_seasonal_spring_nest();
    init_seasonal_spring_cherry_blossom_full();
    init_seasonal_spring_robin_bird();
    init_seasonal_summer_parasol();
    init_seasonal_summer_lemonade();
    init_seasonal_autumn_autumn_maple();
    init_seasonal_autumn_corn_stalk();
    init_seasonal_autumn_apple_basket();
    init_korean_village();
    ASSET_RENDERERS = {
      whale: svgWhale,
      fish: svgFish,
      fishSchool: svgFishSchool,
      boat: svgBoat,
      seagull: svgSeagull,
      dock: svgDock,
      waves: svgWaves,
      kelp: svgKelp,
      coral: svgCoral,
      jellyfish: svgJellyfish,
      turtle: svgTurtle,
      buoy: svgBuoy,
      sailboat: svgSailboat,
      lighthouse: svgLighthouse,
      crab: svgCrab,
      rock: svgRock,
      boulder: svgBoulder,
      flower: svgFlower,
      bush: svgBush,
      driftwood: svgDriftwood,
      sandcastle: svgSandcastle,
      tidePools: svgTidePools,
      heron: svgHeron,
      shellfish: svgShellfish,
      cattail: svgCattail,
      frog: svgFrog,
      lily: svgLily,
      pine: svgPine,
      deciduous: svgDeciduous,
      mushroom: svgMushroom,
      stump: svgStump,
      deer: svgDeer,
      rabbit: svgRabbit,
      fox: svgFox,
      butterfly: svgButterfly,
      beehive: svgBeehive,
      wildflowerPatch: svgWildflowerPatch,
      tallGrass: svgTallGrass,
      birch: svgBirch,
      haybale: svgHaybale,
      willow: svgWillow,
      palm: svgPalm,
      bird: svgBird,
      owl: svgOwl,
      squirrel: svgSquirrel,
      moss: svgMoss,
      fern: svgFern,
      deadTree: svgDeadTree,
      log: svgLog,
      berryBush: svgBerryBush,
      spider: svgSpider,
      wheat: svgWheat,
      fence: svgFence,
      scarecrow: svgScarecrow,
      barn: svgBarn,
      sheep: svgSheep,
      cow: svgCow,
      chicken: svgChicken,
      horse: svgHorse,
      donkey: svgDonkey,
      goat: svgGoat,
      ricePaddy: svgRicePaddy,
      silo: svgSilo,
      pigpen: svgPigpen,
      trough: svgTrough,
      haystack: svgHaystack,
      orchard: svgOrchard,
      appleTree: svgAppleTree,
      oliveTree: svgOliveTree,
      lemonTree: svgLemonTree,
      orangeTree: svgOrangeTree,
      pearTree: svgPearTree,
      peachTree: svgPeachTree,
      beeFarm: svgBeeFarm,
      pumpkin: svgPumpkin,
      tent: svgTent,
      hut: svgHut,
      house: svgHouse,
      houseB: svgHouseB,
      church: svgChurch,
      windmill: svgWindmill,
      well: svgWell,
      tavern: svgTavern,
      bakery: svgBakery,
      stable: svgStable,
      garden: svgGarden,
      laundry: svgLaundry,
      doghouse: svgDoghouse,
      shrine: svgShrine,
      wagon: svgWagon,
      market: svgMarket,
      inn: svgInn,
      blacksmith: svgBlacksmith,
      castle: svgCastle,
      tower: svgTower,
      bridge: svgBridge,
      cathedral: svgCathedral,
      library: svgLibrary,
      clocktower: svgClocktower,
      statue: svgStatue,
      park: svgPark,
      warehouse: svgWarehouse,
      gatehouse: svgGatehouse,
      manor: svgManor,
      reeds: svgReeds,
      fountain: svgFountain,
      canal: svgCanal,
      watermill: svgWatermill,
      gardenTree: svgGardenTree,
      pondLily: svgPondLily,
      cart: svgCart,
      barrel: svgBarrel,
      torch: svgTorch,
      flag: svgFlag,
      cobblePath: svgCobblePath,
      smoke: svgSmoke,
      signpost: svgSignpost,
      lantern: svgLantern,
      woodpile: svgWoodpile,
      puddle: svgPuddle,
      campfire: svgCampfire,
      snowPine: svgSnowPine,
      snowDeciduous: svgSnowDeciduous,
      snowman: svgSnowman,
      snowdrift: svgSnowdrift,
      igloo: svgIgloo,
      frozenPond: svgFrozenPond,
      icicle: svgIcicle,
      sled: svgSled,
      snowCoveredRock: svgSnowCoveredRock,
      bareBush: svgBareBush,
      winterBird: svgWinterBird,
      firewood: svgFirewood,
      houseWinter: svgHouseWinter,
      houseBWinter: svgHouseBWinter,
      barnWinter: svgBarnWinter,
      churchWinter: svgChurchWinter,
      christmasTree: svgChristmasTree,
      winterLantern: svgWinterLantern,
      frozenFountain: svgFrozenFountain,
      cherryBlossom: svgCherryBlossom,
      cherryBlossomSmall: svgCherryBlossomSmall,
      cherryPetals: svgCherryPetals,
      tulip: svgTulip,
      tulipField: svgTulipField,
      sprout: svgSprout,
      nest: svgNest,
      lamb: svgLamb,
      crocus: svgCrocus,
      rainPuddle: svgRainPuddle,
      birdhouse: svgBirdhouse,
      gardenBed: svgGardenBed,
      cherryBlossomFull: svgCherryBlossomFull,
      cherryBlossomBranch: svgCherryBlossomBranch,
      peachBlossom: svgPeachBlossom,
      flowerBed: svgFlowerBed,
      wateringCan: svgWateringCan,
      seedling: svgSeedling,
      robinBird: svgRobinBird,
      butterflyGarden: svgButterflyGarden,
      umbrella: svgUmbrella,
      parasol: svgParasol,
      beachTowel: svgBeachTowel,
      sandcastleSummer: svgSandcastleSummer,
      surfboard: svgSurfboard,
      iceCreamCart: svgIceCreamCartAsset,
      hammock: svgHammock,
      sunflower: svgSunflower,
      watermelon: svgWatermelon,
      sprinkler: svgSprinkler,
      lemonade: svgLemonade,
      fireflies: svgFirefliesAsset,
      swimmingPool: svgSwimmingPool,
      autumnMaple: svgAutumnMaple,
      autumnOak: svgAutumnOak,
      autumnBirch: svgAutumnBirch,
      autumnGinkgo: svgAutumnGinkgo,
      fallenLeaves: svgFallenLeaves,
      leafSwirl: svgLeafSwirl,
      acorn: svgAcorn,
      cornStalk: svgCornStalkAsset,
      scarecrowAutumn: svgScarecrowAutumn,
      harvestBasket: svgHarvestBasket,
      hotDrink: svgHotDrink,
      autumnWreath: svgAutumnWreath,
      pumpkinPatch: svgPumpkinPatch,
      hayMaze: svgHayMaze,
      appleBasket: svgAppleBasket,
      rake: svgRake,
      hanok: svgHanok,
      pavilion: svgPavilion,
      stoneWall: svgStoneWall,
      onggi: svgOnggi
    };
  }
});

// src/themes/terrain/assets/bounds.ts
var ASSET_BOUNDS;
var init_bounds = __esm({
  "src/themes/terrain/assets/bounds.ts"() {
    "use strict";
    init_cjs_shims();
    ASSET_BOUNDS = {
      whale: { x: -5, y: -6, width: 13, height: 9 },
      fish: { x: -4, y: -4, width: 9, height: 6 },
      fishSchool: { x: -3, y: -3, width: 6, height: 5 },
      boat: { x: -4, y: -7, width: 10, height: 8 },
      seagull: { x: -8, y: -11, width: 17, height: 16 },
      dock: { x: -4, y: -2, width: 8, height: 5 },
      waves: { x: -5, y: -3, width: 10, height: 5 },
      kelp: { x: -2, y: -9, width: 5, height: 11 },
      coral: { x: -4, y: -6, width: 8, height: 8 },
      jellyfish: { x: -3, y: -5, width: 6, height: 6 },
      turtle: { x: -8, y: -8, width: 15, height: 14 },
      buoy: { x: -3, y: -5, width: 6, height: 7 },
      sailboat: { x: -5, y: -8, width: 10, height: 9 },
      lighthouse: { x: -3, y: -12, width: 6, height: 13 },
      crab: { x: -4, y: -4, width: 8, height: 6 },
      rock: { x: -4, y: -4, width: 8, height: 6 },
      boulder: { x: -4, y: -5, width: 8, height: 7 },
      flower: { x: -3, y: -5, width: 6, height: 6 },
      bush: { x: -5, y: -4, width: 10, height: 6 },
      driftwood: { x: -5, y: -3, width: 10, height: 5 },
      sandcastle: { x: -3, y: -6, width: 6, height: 7 },
      tidePools: { x: -4, y: -2, width: 8, height: 4 },
      heron: { x: -3, y: -8, width: 6, height: 9 },
      shellfish: { x: -3, y: -2, width: 7, height: 4 },
      cattail: { x: -2, y: -8, width: 4, height: 9 },
      frog: { x: -2, y: -3, width: 4, height: 5 },
      lily: { x: -3, y: -3, width: 6, height: 5 },
      pine: { x: -5, y: -13, width: 10, height: 15 },
      deciduous: { x: -6, y: -13, width: 12, height: 15 },
      mushroom: { x: -3, y: -5, width: 6, height: 6 },
      stump: { x: -3, y: -4, width: 6, height: 5 },
      deer: { x: -5, y: -7, width: 9, height: 9 },
      rabbit: { x: -3, y: -4, width: 7, height: 6 },
      fox: { x: -4, y: -5, width: 9, height: 7 },
      butterfly: { x: -7, y: -10, width: 14, height: 13 },
      beehive: { x: -3, y: -8, width: 6, height: 8 },
      wildflowerPatch: { x: -3, y: -4, width: 6, height: 5 },
      tallGrass: { x: -3, y: -5, width: 6, height: 6 },
      birch: { x: -5, y: -12, width: 10, height: 14 },
      haybale: { x: -3, y: -3, width: 6, height: 5 },
      willow: { x: -6, y: -9, width: 12, height: 11 },
      palm: { x: -6, y: -11, width: 12, height: 13 },
      bird: { x: -7, y: -12, width: 16, height: 15 },
      owl: { x: -3, y: -5, width: 6, height: 6 },
      squirrel: { x: -2, y: -4, width: 5, height: 5 },
      moss: { x: -4, y: -2, width: 8, height: 4 },
      fern: { x: -5, y: -5, width: 10, height: 7 },
      deadTree: { x: -4, y: -8, width: 7, height: 9 },
      log: { x: -5, y: -2, width: 10, height: 3 },
      berryBush: { x: -4, y: -4, width: 8, height: 5 },
      spider: { x: -4, y: -6, width: 8, height: 7 },
      wheat: { x: -4, y: -7, width: 8, height: 8 },
      fence: { x: -5, y: -5, width: 10, height: 6 },
      scarecrow: { x: -4, y: -10, width: 9, height: 11 },
      barn: { x: -6, y: -9, width: 12, height: 12 },
      sheep: { x: -4, y: -5, width: 8, height: 7 },
      cow: { x: -5, y: -6, width: 10, height: 8 },
      chicken: { x: -3, y: -5, width: 8, height: 7 },
      horse: { x: -4, y: -9, width: 10, height: 11 },
      donkey: { x: -4, y: -7, width: 8, height: 9 },
      goat: { x: -4, y: -6, width: 8, height: 8 },
      ricePaddy: { x: -6, y: -5, width: 12, height: 8 },
      silo: { x: -3, y: -10, width: 6, height: 11 },
      pigpen: { x: -4, y: -3, width: 8, height: 4 },
      trough: { x: -3, y: -2, width: 6, height: 4 },
      haystack: { x: -3, y: -6, width: 6, height: 7 },
      orchard: { x: -4, y: -9, width: 8, height: 10 },
      appleTree: { x: -4, y: -8, width: 8, height: 11 },
      oliveTree: { x: -4, y: -7, width: 8, height: 11 },
      lemonTree: { x: -4, y: -7, width: 8, height: 10 },
      orangeTree: { x: -4, y: -8, width: 8, height: 11 },
      pearTree: { x: -4, y: -8, width: 8, height: 11 },
      peachTree: { x: -4, y: -8, width: 8, height: 11 },
      beeFarm: { x: -3, y: -5, width: 6, height: 6 },
      pumpkin: { x: -3, y: -4, width: 6, height: 6 },
      tent: { x: -5, y: -8, width: 10, height: 9 },
      hut: { x: -4, y: -7, width: 10, height: 8 },
      house: { x: -5, y: -8, width: 10, height: 11 },
      houseB: { x: -5, y: -8, width: 10, height: 11 },
      church: { x: -4, y: -13, width: 8, height: 15 },
      windmill: { x: -5, y: -12, width: 10, height: 13 },
      well: { x: -4, y: -7, width: 8, height: 9 },
      tavern: { x: -4, y: -7, width: 10, height: 10 },
      bakery: { x: -4, y: -10, width: 8, height: 11 },
      stable: { x: -5, y: -6, width: 10, height: 7 },
      garden: { x: -5, y: -3, width: 10, height: 4 },
      laundry: { x: -5, y: -5, width: 10, height: 6 },
      doghouse: { x: -3, y: -5, width: 8, height: 7 },
      shrine: { x: -3, y: -6, width: 6, height: 7 },
      wagon: { x: -5, y: -6, width: 9, height: 8 },
      market: { x: -5, y: -7, width: 13, height: 9 },
      inn: { x: -5, y: -8, width: 12, height: 11 },
      blacksmith: { x: -4, y: -8, width: 8, height: 9 },
      castle: { x: -4, y: -13, width: 8, height: 14 },
      tower: { x: -3, y: -12, width: 6, height: 13 },
      bridge: { x: -6, y: -4, width: 12, height: 6 },
      cathedral: { x: -5, y: -13, width: 10, height: 16 },
      library: { x: -4, y: -7, width: 8, height: 8 },
      clocktower: { x: -3, y: -14, width: 6, height: 15 },
      statue: { x: -2, y: -7, width: 4, height: 8 },
      park: { x: -5, y: -8, width: 10, height: 9 },
      warehouse: { x: -5, y: -7, width: 10, height: 8 },
      gatehouse: { x: -4, y: -8, width: 8, height: 9 },
      manor: { x: -5, y: -9, width: 10, height: 12 },
      reeds: { x: -3, y: -7, width: 6, height: 8 },
      fountain: { x: -4, y: -6, width: 8, height: 8 },
      canal: { x: -4, y: -2, width: 8, height: 3 },
      watermill: { x: -4, y: -7, width: 11, height: 9 },
      gardenTree: { x: -3, y: -8, width: 6, height: 9 },
      pondLily: { x: -3, y: -2, width: 6, height: 4 },
      cart: { x: -4, y: -3, width: 9, height: 5 },
      barrel: { x: -3, y: -5, width: 6, height: 7 },
      torch: { x: -2, y: -7, width: 5, height: 9 },
      flag: { x: -2, y: -10, width: 7, height: 11 },
      cobblePath: { x: -4, y: -3, width: 9, height: 5 },
      smoke: { x: -5, y: -11, width: 11, height: 11 },
      signpost: { x: -4, y: -6, width: 8, height: 7 },
      lantern: { x: -2, y: -7, width: 4, height: 8 },
      woodpile: { x: -4, y: -4, width: 8, height: 5 },
      puddle: { x: -3, y: -2, width: 6, height: 4 },
      campfire: { x: -3, y: -4, width: 6, height: 6 },
      snowPine: { x: -5, y: -10, width: 10, height: 13 },
      snowDeciduous: { x: -5, y: -7, width: 10, height: 11 },
      snowman: { x: -4, y: -8, width: 9, height: 12 },
      snowdrift: { x: -5, y: -3, width: 10, height: 6 },
      igloo: { x: -5, y: -5, width: 10, height: 7 },
      frozenPond: { x: -4, y: -3, width: 8, height: 6 },
      icicle: { x: -3, y: -5, width: 6, height: 6 },
      sled: { x: -5, y: -4, width: 10, height: 6 },
      snowCoveredRock: { x: -4, y: -3, width: 8, height: 6 },
      bareBush: { x: -4, y: -4, width: 8, height: 6 },
      winterBird: { x: -3, y: -4, width: 6, height: 5 },
      firewood: { x: -4, y: -4, width: 8, height: 6 },
      houseWinter: { x: -5, y: -9, width: 10, height: 12 },
      houseBWinter: { x: -5, y: -9, width: 10, height: 12 },
      barnWinter: { x: -6, y: -9, width: 12, height: 12 },
      churchWinter: { x: -4, y: -13, width: 8, height: 15 },
      christmasTree: { x: -4, y: -10, width: 8, height: 13 },
      winterLantern: { x: -4, y: -8, width: 8, height: 10 },
      frozenFountain: { x: -4, y: -6, width: 8, height: 8 },
      cherryBlossom: { x: -5, y: -7, width: 10, height: 10 },
      cherryBlossomSmall: { x: -3, y: -5, width: 6, height: 8 },
      cherryPetals: { x: -3, y: -3, width: 6, height: 5 },
      tulip: { x: -2, y: -4, width: 5, height: 6 },
      tulipField: { x: -4, y: -4, width: 8, height: 6 },
      sprout: { x: -2, y: -3, width: 4, height: 5 },
      nest: { x: -3, y: -3, width: 6, height: 5 },
      lamb: { x: -4, y: -4, width: 9, height: 7 },
      crocus: { x: -2, y: -3, width: 4, height: 5 },
      rainPuddle: { x: -3, y: -2, width: 6, height: 4 },
      birdhouse: { x: -3, y: -6, width: 6, height: 8 },
      gardenBed: { x: -4, y: -3, width: 8, height: 5 },
      cherryBlossomFull: { x: -5, y: -9, width: 10, height: 13 },
      cherryBlossomBranch: { x: -5, y: -5, width: 8, height: 7 },
      peachBlossom: { x: -4, y: -8, width: 8, height: 12 },
      flowerBed: { x: -3, y: -3, width: 6, height: 5 },
      wateringCan: { x: -2, y: -4, width: 6, height: 6 },
      seedling: { x: -2, y: -3, width: 4, height: 5 },
      robinBird: { x: -2, y: -2, width: 5, height: 4 },
      butterflyGarden: { x: -3, y: -3, width: 6, height: 4 },
      umbrella: { x: -3, y: -4, width: 6, height: 7 },
      parasol: { x: -4, y: -6, width: 8, height: 8 },
      beachTowel: { x: -4, y: -2, width: 8, height: 5 },
      sandcastleSummer: { x: -3, y: -5, width: 6, height: 7 },
      surfboard: { x: -3, y: -6, width: 6, height: 8 },
      iceCreamCart: { x: -3, y: -5, width: 7, height: 8 },
      hammock: { x: -5, y: -4, width: 10, height: 5 },
      sunflower: { x: -5, y: -7, width: 10, height: 9 },
      watermelon: { x: -3, y: -2, width: 6, height: 4 },
      sprinkler: { x: -3, y: -4, width: 6, height: 6 },
      lemonade: { x: -4, y: -3, width: 8, height: 5 },
      fireflies: { x: -6, y: -5, width: 11, height: 6 },
      swimmingPool: { x: -4, y: -4, width: 8, height: 7 },
      autumnMaple: { x: -4, y: -8, width: 8, height: 12 },
      autumnOak: { x: -4, y: -8, width: 8, height: 12 },
      autumnBirch: { x: -4, y: -6, width: 7, height: 10 },
      autumnGinkgo: { x: -4, y: -7, width: 8, height: 10 },
      fallenLeaves: { x: -4, y: -2, width: 6, height: 4 },
      leafSwirl: { x: -3, y: -4, width: 6, height: 5 },
      acorn: { x: -2, y: -2, width: 4, height: 4 },
      cornStalk: { x: -4, y: -4, width: 8, height: 6 },
      scarecrowAutumn: { x: -3, y: -6, width: 7, height: 8 },
      harvestBasket: { x: -3, y: -3, width: 6, height: 4 },
      hotDrink: { x: -2, y: -4, width: 5, height: 6 },
      autumnWreath: { x: -3, y: -5, width: 6, height: 7 },
      pumpkinPatch: { x: -3, y: -3, width: 6, height: 5 },
      hayMaze: { x: -3, y: -3, width: 6, height: 5 },
      appleBasket: { x: -3, y: -3, width: 6, height: 5 },
      rake: { x: -4, y: -5, width: 8, height: 8 },
      hanok: { x: -10, y: -15, width: 20, height: 19 },
      pavilion: { x: -9, y: -15, width: 18, height: 19 },
      stoneWall: { x: -9, y: -8, width: 18, height: 15 },
      onggi: { x: -7, y: -8, width: 14, height: 12 }
    };
  }
});

// src/themes/terrain/assets/classification.ts
var CATEGORY_MEMBERS;
var init_classification = __esm({
  "src/themes/terrain/assets/classification.ts"() {
    "use strict";
    init_cjs_shims();
    CATEGORY_MEMBERS = {
      water: [
        "whale",
        "fish",
        "fishSchool",
        "boat",
        "seagull",
        "dock",
        "waves",
        "kelp",
        "coral",
        "jellyfish",
        "turtle",
        "buoy",
        "sailboat",
        "lighthouse",
        "crab",
        "reeds",
        "canal",
        "pondLily",
        "frozenPond"
      ],
      shore: [
        "rock",
        "boulder",
        "flower",
        "bush",
        "driftwood",
        "sandcastle",
        "tidePools",
        "heron",
        "shellfish",
        "cattail",
        "frog",
        "lily",
        "snowCoveredRock",
        "parasol",
        "beachTowel",
        "sandcastleSummer",
        "surfboard"
      ],
      woodland: [
        "pine",
        "deciduous",
        "mushroom",
        "stump",
        "deer",
        "rabbit",
        "fox",
        "butterfly",
        "beehive",
        "wildflowerPatch",
        "tallGrass",
        "birch",
        "haybale",
        "willow",
        "palm",
        "bird",
        "owl",
        "squirrel",
        "moss",
        "fern",
        "deadTree",
        "log",
        "berryBush",
        "spider",
        "gardenTree",
        "snowPine",
        "snowDeciduous",
        "bareBush",
        "winterBird",
        "cherryBlossom",
        "cherryBlossomSmall",
        "nest",
        "birdhouse",
        "cherryBlossomFull",
        "cherryBlossomBranch",
        "peachBlossom",
        "robinBird",
        "butterflyGarden",
        "autumnMaple",
        "autumnOak",
        "autumnBirch",
        "autumnGinkgo",
        "acorn"
      ],
      farm: [
        "wheat",
        "fence",
        "scarecrow",
        "barn",
        "sheep",
        "cow",
        "chicken",
        "horse",
        "donkey",
        "goat",
        "ricePaddy",
        "silo",
        "pigpen",
        "trough",
        "haystack",
        "orchard",
        "appleTree",
        "oliveTree",
        "lemonTree",
        "orangeTree",
        "pearTree",
        "peachTree",
        "beeFarm",
        "pumpkin",
        "barnWinter",
        "sprout",
        "lamb",
        "gardenBed",
        "seedling",
        "sunflower",
        "watermelon",
        "cornStalk",
        "scarecrowAutumn",
        "harvestBasket",
        "pumpkinPatch",
        "hayMaze",
        "appleBasket"
      ],
      village: [
        "tent",
        "hut",
        "house",
        "houseB",
        "church",
        "windmill",
        "well",
        "tavern",
        "bakery",
        "stable",
        "garden",
        "laundry",
        "doghouse",
        "shrine",
        "wagon",
        "watermill",
        "igloo",
        "houseWinter",
        "houseBWinter",
        "churchWinter",
        "hanok",
        "pavilion",
        "stoneWall",
        "onggi"
      ],
      town: [
        "market",
        "inn",
        "blacksmith",
        "castle",
        "tower",
        "bridge",
        "cathedral",
        "library",
        "clocktower",
        "statue",
        "park",
        "warehouse",
        "gatehouse",
        "manor",
        "fountain",
        "frozenFountain",
        "swimmingPool"
      ],
      decoration: [
        "cart",
        "barrel",
        "torch",
        "flag",
        "cobblePath",
        "smoke",
        "signpost",
        "lantern",
        "woodpile",
        "puddle",
        "campfire",
        "snowman",
        "snowdrift",
        "icicle",
        "sled",
        "firewood",
        "christmasTree",
        "winterLantern",
        "cherryPetals",
        "tulip",
        "tulipField",
        "crocus",
        "rainPuddle",
        "flowerBed",
        "wateringCan",
        "umbrella",
        "iceCreamCart",
        "hammock",
        "sprinkler",
        "lemonade",
        "fireflies",
        "fallenLeaves",
        "leafSwirl",
        "hotDrink",
        "autumnWreath",
        "rake"
      ]
    };
  }
});

// src/themes/terrain/assets/season-members.ts
var SEASON_MEMBERS;
var init_season_members = __esm({
  "src/themes/terrain/assets/season-members.ts"() {
    "use strict";
    init_cjs_shims();
    SEASON_MEMBERS = {
      winter: [
        "snowPine",
        "snowDeciduous",
        "snowman",
        "snowdrift",
        "igloo",
        "frozenPond",
        "icicle",
        "sled",
        "snowCoveredRock",
        "bareBush",
        "winterBird",
        "firewood",
        "houseWinter",
        "houseBWinter",
        "barnWinter",
        "churchWinter",
        "christmasTree",
        "winterLantern",
        "frozenFountain"
      ],
      spring: [
        "cherryBlossom",
        "cherryBlossomSmall",
        "cherryPetals",
        "tulip",
        "tulipField",
        "sprout",
        "nest",
        "lamb",
        "crocus",
        "rainPuddle",
        "birdhouse",
        "gardenBed",
        "cherryBlossomFull",
        "cherryBlossomBranch",
        "peachBlossom",
        "flowerBed",
        "wateringCan",
        "seedling",
        "robinBird",
        "butterflyGarden",
        "umbrella"
      ],
      summer: [
        "parasol",
        "beachTowel",
        "sandcastleSummer",
        "surfboard",
        "iceCreamCart",
        "hammock",
        "sunflower",
        "watermelon",
        "sprinkler",
        "lemonade",
        "fireflies",
        "swimmingPool"
      ],
      autumn: [
        "autumnMaple",
        "autumnOak",
        "autumnBirch",
        "autumnGinkgo",
        "fallenLeaves",
        "leafSwirl",
        "acorn",
        "cornStalk",
        "scarecrowAutumn",
        "harvestBasket",
        "hotDrink",
        "autumnWreath",
        "pumpkinPatch",
        "hayMaze",
        "appleBasket",
        "rake"
      ]
    };
  }
});

// src/themes/terrain/assets/catalog.ts
function isAssetType(value) {
  return Object.hasOwn(ASSET_RENDERERS, value);
}
function getAssetCatalogEntry(id) {
  const displayName = LABELS[id] ?? id.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
  const category = CATEGORIES.find((value) => CATEGORY_MEMBERS[value].includes(id)) ?? "decoration";
  const season = SEASONS.find((value) => SEASON_MEMBERS[value].includes(id)) ?? "all";
  const style = KOREAN_DESCRIPTIONS[id] ? "korean" : "classic";
  return {
    id,
    displayName,
    category,
    season,
    style,
    bounds: ASSET_BOUNDS[id],
    description: KOREAN_DESCRIPTIONS[id] ?? `${displayName}, a ${category} asset${season === "all" ? " available throughout the year" : ` for ${season}`}.`
  };
}
var LABELS, KOREAN_DESCRIPTIONS, CATEGORIES, SEASONS, ASSET_CATALOG, ASSET_CATALOG_COUNTS;
var init_catalog = __esm({
  "src/themes/terrain/assets/catalog.ts"() {
    "use strict";
    init_cjs_shims();
    init_renderers();
    init_bounds();
    init_classification();
    init_season_members();
    LABELS = {
      houseB: "Gabled house",
      houseBWinter: "Snowy gabled house",
      houseWinter: "Snowy house",
      barnWinter: "Snowy barn",
      churchWinter: "Snowy church",
      sandcastleSummer: "Summer sandcastle",
      cornStalk: "Corn stalks",
      hanok: "Hanok house",
      pavilion: "Korean pavilion",
      stoneWall: "Korean stone wall",
      onggi: "Onggi jars"
    };
    KOREAN_DESCRIPTIONS = {
      hanok: "A timber-frame home with curved giwa roof tiles, cream walls and wooden lattice doors.",
      pavilion: "An open-sided resting pavilion with raised stone footing and a gently swept tiled roof.",
      stoneWall: "An irregular stacked stone boundary capped with dark roof tiles.",
      onggi: "Three glazed earthenware storage jars with broad shoulders and flat lids on a stone terrace."
    };
    CATEGORIES = [
      "water",
      "shore",
      "woodland",
      "farm",
      "village",
      "town",
      "decoration"
    ];
    SEASONS = ["winter", "spring", "summer", "autumn"];
    ASSET_CATALOG = Object.keys(ASSET_RENDERERS).filter(isAssetType).map(getAssetCatalogEntry);
    ASSET_CATALOG_COUNTS = Object.freeze({
      total: ASSET_CATALOG.length,
      classic: ASSET_CATALOG.filter((entry) => entry.style === "classic").length,
      korean: ASSET_CATALOG.filter((entry) => entry.style === "korean").length
    });
  }
});

// src/themes/terrain/assets/selection.ts
function poolForCell(cell, options) {
  const level = getEffectiveLevel(cell.count === 0 ? 0 : cell.level100, options.density ?? 5);
  let pool = getLevelPool100(level);
  if (cell.count === 0 || cell.level100 === 0) return pool;
  const biome = options.biomeMap?.get(`${cell.week},${cell.day}`);
  if (biome) pool = blendWithBiome(pool, biome, level);
  const seasonalWeek = cell.date && options.hemisphere ? dateSeasonWeek(cell.date, options.hemisphere) : void 0;
  if (seasonalWeek !== void 0 || options.seasonRotation !== void 0) {
    const { add, remove } = getSeasonalPoolOverrides(
      seasonalWeek ?? cell.week,
      seasonalWeek === void 0 ? options.seasonRotation : 0,
      level
    );
    pool = {
      types: [...pool.types.filter((type) => !remove.has(type)), ...add.filter(isAssetType)],
      chance: pool.chance
    };
  }
  return applyVillageStyle(pool, options.villageStyle ?? "classic");
}
function selectAssetPlacements(isoCells, seed, options = {}) {
  const assets = [];
  const dates = /* @__PURE__ */ new Map();
  for (const cell of isoCells) {
    const key = assetCellIdentity(cell);
    dates.set(key, (dates.get(key) ?? 0) + 1);
  }
  for (const cell of isoCells) {
    if (options.excludeCells?.has(`${cell.week},${cell.day}`)) continue;
    const identity = assetCellIdentity(cell);
    const key = (dates.get(identity) ?? 0) > 1 ? `${identity}:${cell.week},${cell.day}` : identity;
    const rng = seededRandom(assetDateSeed(seed, key, "selection"));
    const variants = seededRandom(assetDateSeed(options.variantSeed ?? seed, key, "variant"));
    const pool = poolForCell(cell, options);
    const abundance = cell.count === 0 ? 0 : cell.level100 / 99;
    if (rng() >= pool.chance + abundance * 0.2 || pool.types.length === 0) continue;
    const slots = cell.count !== 0 && cell.level100 >= 43 && rng() < 0.4 ? 2 : 1;
    for (let slot = 0; slot < slots; slot++) {
      const type = pool.types[Math.floor(rng() * pool.types.length)];
      assets.push({
        id: `asset:${key}:${slot}`,
        date: cell.date,
        catalogId: type,
        cell,
        type,
        cx: cell.isoX,
        cy: cell.isoY,
        ox: (rng() - 0.5) * (slot === 0 ? 3 : 4),
        oy: (rng() - 0.5) * (slot === 0 ? 1.5 : 2),
        variant: Math.floor(variants() * 3),
        animated: false
      });
    }
  }
  const smil = new Set(
    assets.filter((a) => SMIL_TYPES.has(a.type)).sort((a, b) => assetDateSeed(seed, a.id, "motion") - assetDateSeed(seed, b.id, "motion")).slice(0, 18).map((a) => a.id)
  );
  const css = new Set(
    assets.filter((a) => CSS_TYPES.has(a.type)).sort((a, b) => assetDateSeed(seed, a.id, "motion") - assetDateSeed(seed, b.id, "motion")).slice(0, 15).map((a) => a.id)
  );
  const smoke = new Set(
    assets.filter((a) => a.type === "smoke" && smil.has(a.id)).sort((a, b) => a.id.localeCompare(b.id)).slice(0, 8).map((a) => a.id)
  );
  return assets.map((a) => ({
    ...a,
    animated: (smil.has(a.id) || css.has(a.id)) && (a.type !== "smoke" || smoke.has(a.id))
  })).sort(
    (a, b) => a.cell.week + a.cell.day - (b.cell.week + b.cell.day) || a.cell.week - b.cell.week || a.id.localeCompare(b.id)
  );
}
var SMIL_TYPES, CSS_TYPES;
var init_selection = __esm({
  "src/themes/terrain/assets/selection.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    init_seasons();
    init_level_pool();
    init_biome_pool();
    init_style_pool();
    init_date_seed();
    init_catalog();
    SMIL_TYPES = /* @__PURE__ */ new Set([
      "seagull",
      "waves",
      "bird",
      "windmill",
      "smoke",
      "fountain",
      "watermill",
      "jellyfish",
      "turtle",
      "butterfly",
      "bakery",
      "clocktower",
      "campfire"
    ]);
    CSS_TYPES = /* @__PURE__ */ new Set(["cattail", "tallGrass", "laundry"]);
  }
});

// src/themes/terrain/epics/gates.ts
function getEpicGateThresholds(tier, stats) {
  return ["total", "longestStreak"].map((metric) => ({
    metric,
    required: EPIC_STATS_RULES[tier][metric],
    current: stats[metric],
    achieved: stats[metric] >= EPIC_STATS_RULES[tier][metric]
  }));
}
function passesEpicStatsGate(tier, stats) {
  const thresholds = getEpicGateThresholds(tier, stats);
  switch (EPIC_STATS_RULES[tier].combination) {
    case "or":
      return thresholds.some((threshold) => threshold.achieved);
    case "and":
      return thresholds.every((threshold) => threshold.achieved);
  }
}
function describeEpicStatsGate(tier) {
  const rule = EPIC_STATS_RULES[tier];
  return `At least ${rule.total} total contributions ${rule.combination.toUpperCase()} a longest streak of at least ${rule.longestStreak} days.`;
}
var EPIC_STATS_RULES;
var init_gates = __esm({
  "src/themes/terrain/epics/gates.ts"() {
    "use strict";
    init_cjs_shims();
    EPIC_STATS_RULES = {
      rare: { combination: "or", total: 200, longestStreak: 7 },
      epic: { combination: "and", total: 500, longestStreak: 14 },
      legendary: { combination: "and", total: 1e3, longestStreak: 30 }
    };
  }
});

// src/themes/terrain/epics/definitions.ts
var TIER_CONFIG, EPIC_BUILDINGS;
var init_definitions = __esm({
  "src/themes/terrain/epics/definitions.ts"() {
    "use strict";
    init_cjs_shims();
    init_gates();
    TIER_CONFIG = {
      rare: {
        minLevel: 88,
        minRichness: 0.45,
        baseChance: 0.018,
        glowColor: "#FFD700",
        statsGate: (s) => passesEpicStatsGate("rare", s)
      },
      epic: {
        minLevel: 93,
        minRichness: 0.55,
        baseChance: 8e-3,
        glowColor: "#9B59B6",
        statsGate: (s) => passesEpicStatsGate("epic", s)
      },
      legendary: {
        minLevel: 97,
        minRichness: 0.65,
        baseChance: 3e-3,
        glowColor: "#00CED1",
        statsGate: (s) => passesEpicStatsGate("legendary", s)
      }
    };
    EPIC_BUILDINGS = [
      // Rare (14) — 9 natural, 5 landmark
      { type: "mountFuji", tier: "rare" },
      { type: "colosseum", tier: "rare" },
      { type: "giantSequoia", tier: "rare" },
      { type: "coralReef", tier: "rare" },
      { type: "pagoda", tier: "rare" },
      { type: "torii", tier: "rare" },
      { type: "geyser", tier: "rare" },
      { type: "hotSpring", tier: "rare" },
      { type: "eiffelTower", tier: "rare" },
      { type: "grandCanyon", tier: "rare" },
      { type: "windmillGrand", tier: "rare" },
      { type: "oasis", tier: "rare" },
      { type: "volcano", tier: "rare" },
      { type: "giantMushroom", tier: "rare" },
      // Epic (10) — 7 natural, 3 landmark
      { type: "aurora", tier: "epic" },
      { type: "tajMahal", tier: "epic" },
      { type: "giantWaterfall", tier: "epic" },
      { type: "stBasils", tier: "epic" },
      { type: "bambooGrove", tier: "epic" },
      { type: "operaHouse", tier: "epic" },
      { type: "glacierPeak", tier: "epic" },
      { type: "bioluminescentPool", tier: "epic" },
      { type: "meteorCrater", tier: "epic" },
      { type: "bonsaiGiant", tier: "epic" },
      // Legendary (6) — 5 natural, 1 structure
      { type: "floatingIsland", tier: "legendary" },
      { type: "crystalSpire", tier: "legendary" },
      { type: "dragonNest", tier: "legendary" },
      { type: "worldTree", tier: "legendary" },
      { type: "sakuraEternal", tier: "legendary" },
      { type: "ancientPortal", tier: "legendary" }
    ];
  }
});

// src/themes/terrain/epics/renderers/rare-landscapes.ts
function renderMountFuji(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="5" ry="1" fill="${c.shadow}" opacity="0.15"/><polygon points="-7,0 0,-13 7,0" fill="${c.boulder}"/><polygon points="0,-13 7,0 0,0" fill="${c.rock}" opacity="0.6"/><line x1="-4" y1="-4" x2="4" y2="-4" stroke="${c.rock}" stroke-width="0.3" opacity="0.4"/><line x1="-3" y1="-7" x2="3" y2="-7" stroke="${c.rock}" stroke-width="0.25" opacity="0.35"/><polygon points="-3,-9 0,-13 3,-9" fill="${c.snowCap}"/><polygon points="0,-13 3,-9 0,-9" fill="${c.snowGround}" opacity="0.7"/><path d="M-3,-9 Q-2,-8 -1,-8.6 Q0,-8 1,-8.6 Q2,-8 3,-9" fill="${c.snowCap}" opacity="0.5"/><circle cx="-4" cy="-2" r="0.8" fill="${c.epicJade}" opacity="0.5"/><circle cx="-2.5" cy="-2.5" r="0.7" fill="${c.epicJade}" opacity="0.45"/><circle cx="3" cy="-2" r="0.7" fill="${c.epicJade}" opacity="0.4"/></g>`;
}
function renderGiantSequoia(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3.5" ry="0.8" fill="${c.shadow}" opacity="0.15"/><path d="M-2.5,0 Q-2.2,-0.8 -1.8,-1" stroke="${c.trunk}" stroke-width="0.6" fill="none"/><path d="M2.5,0 Q2.2,-0.8 1.8,-1" stroke="${c.trunk}" stroke-width="0.6" fill="none"/><rect x="-1.8" y="-7" width="3.6" height="7" fill="${c.trunk}" rx="0.6"/><rect x="-0.5" y="-7" width="1" height="7" fill="${c.trunk}" opacity="0.5"/><line x1="-1.8" y1="-4" x2="-2.8" y2="-4.5" stroke="${c.trunk}" stroke-width="0.5"/><line x1="1.8" y1="-5" x2="2.6" y2="-5.5" stroke="${c.trunk}" stroke-width="0.4"/><ellipse cx="0" cy="-9" rx="5.5" ry="3.5" fill="${c.bushDark}"/><ellipse cx="0" cy="-9" rx="5" ry="3.2" fill="${c.epicJade}"/><ellipse cx="-1.5" cy="-11" rx="3.5" ry="2.5" fill="${c.epicJade}" opacity="0.85"/><ellipse cx="1.5" cy="-11" rx="3" ry="2.2" fill="${c.leaf}" opacity="0.6"/><ellipse cx="0" cy="-12.5" rx="2.5" ry="1.8" fill="${c.leafLight}" opacity="0.5"/></g>`;
}
function renderCoralReef(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.12"/><ellipse cx="0" cy="0" rx="5" ry="1.5" fill="${c.coral}" opacity="0.3"/><path d="M-3,0 L-3,-4 L-4,-5.5 M-3,-3 L-2,-5" stroke="${c.coral}" stroke-width="0.8" fill="none"/><path d="M1,0 L1,-5 L0,-7 M1,-3 L2.2,-5.5" stroke="${c.epicMagic}" stroke-width="0.7" fill="none"/><path d="M3.5,0 Q3,-2 4.5,-4 Q5,-3 5.5,-4 Q5,-1.5 3.5,0" fill="${c.epicPortal}" opacity="0.5"/><circle cx="-4" cy="-5.8" r="1" fill="${c.coral}"/><circle cx="-2" cy="-5.3" r="0.7" fill="${c.coral}" opacity="0.8"/><circle cx="0" cy="-7.2" r="1.1" fill="${c.epicMagic}"/><circle cx="2.2" cy="-5.8" r="0.8" fill="${c.epicMagic}" opacity="0.8"/><path d="M-1,-3 L0.2,-3.4 L-1,-3.8 Z" fill="${c.epicGold}" opacity="0.7"/><path d="M-1.3,-3.2 L-1,-3.4 L-1.3,-3.6" fill="${c.epicGold}" opacity="0.5"/><circle cx="1.5" cy="-6" r="0.2" fill="${c.epicCrystal}" opacity="0.3"/><circle cx="0.5" cy="-8" r="0.15" fill="${c.epicCrystal}" opacity="0.25"/></g>`;
}
function renderGeyser(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3.5" ry="0.8" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="0" rx="3.5" ry="1.4" fill="${c.rock}"/><ellipse cx="0" cy="-0.3" rx="2.5" ry="1" fill="${c.boulder}"/><ellipse cx="0" cy="-0.2" rx="1.5" ry="0.5" fill="${c.epicGold}" opacity="0.2"/><path d="M-1,-1 Q-0.6,-5 0,-9 Q0.6,-5 1,-1" fill="${c.epicCrystal}" opacity="0.45"/><path d="M-0.5,-1 Q0,-6 0.5,-1" fill="${c.epicCrystal}" opacity="0.25"/><circle cx="-1.5" cy="-9" r="0.6" fill="${c.epicCrystal}" opacity="0.3"/><circle cx="1.2" cy="-9.5" r="0.5" fill="${c.epicCrystal}" opacity="0.25"/><circle cx="0" cy="-10.5" r="0.7" fill="${c.epicCrystal}" opacity="0.2"/><circle cx="-0.8" cy="-11" r="0.4" fill="${c.epicCrystal}" opacity="0.15"/><path d="M-2,-7 Q-2.5,-8.5 -1.5,-9.5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.2"/><path d="M1.5,-8 Q2,-9.5 1,-10" stroke="${c.epicCrystal}" stroke-width="0.25" fill="none" opacity="0.18"/></g>`;
}
function renderHotSpring(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.12"/><ellipse cx="0" cy="0" rx="5" ry="2.2" fill="${c.rock}"/><circle cx="-3.5" cy="-0.5" r="1" fill="${c.boulder}" opacity="0.6"/><circle cx="3.5" cy="-0.3" r="0.9" fill="${c.boulder}" opacity="0.55"/><circle cx="0" cy="-1.8" r="0.7" fill="${c.boulder}" opacity="0.5"/><ellipse cx="0" cy="-0.3" rx="3.8" ry="1.6" fill="none" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.2"/><ellipse cx="0" cy="-0.3" rx="3.5" ry="1.5" fill="${c.epicCrystal}" opacity="0.45"/><ellipse cx="0" cy="-0.5" rx="2" ry="0.8" fill="${c.epicPortal}" opacity="0.25"/><path d="M-1.5,-1 Q-2,-3 -1,-4.5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.35"/><path d="M0.5,-1 Q0,-3.5 1,-5" stroke="${c.epicCrystal}" stroke-width="0.3" fill="none" opacity="0.3"/><path d="M2,-0.8 Q2.5,-2.5 2,-4" stroke="${c.epicCrystal}" stroke-width="0.25" fill="none" opacity="0.25"/></g>`;
}
function renderGrandCanyon(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="6" ry="1" fill="${c.shadow}" opacity="0.12"/><polygon points="-6,0 -5,-7 -3,-6 -2,-8 -1,-4" fill="${c.boulder}"/><polygon points="-6,0 -5,-5 -3,-4 -1,-4 -1,0" fill="${c.rock}" opacity="0.7"/><line x1="-5.5" y1="-2" x2="-1.5" y2="-2" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.3"/><line x1="-5" y1="-4" x2="-2" y2="-4" stroke="${c.rock}" stroke-width="0.25" opacity="0.4"/><polygon points="1,-4 2,-8 3,-6 5,-7 6,0" fill="${c.boulder}"/><polygon points="1,-4 1,0 6,0 5,-5 3,-4" fill="${c.rock}" opacity="0.7"/><line x1="1.5" y1="-2" x2="5.5" y2="-2" stroke="${c.epicGold}" stroke-width="0.3" opacity="0.3"/><line x1="2" y1="-4" x2="5" y2="-4" stroke="${c.rock}" stroke-width="0.25" opacity="0.4"/><path d="M-0.8,0 Q0,-0.3 0.8,0" fill="${c.epicCrystal}" opacity="0.4"/><circle cx="-5" cy="-7.3" r="0.5" fill="${c.epicJade}" opacity="0.4"/><circle cx="4.5" cy="-7.3" r="0.4" fill="${c.epicJade}" opacity="0.35"/></g>`;
}
function renderOasis(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.12"/><ellipse cx="0" cy="0.2" rx="5.5" ry="2" fill="${c.epicGold}" opacity="0.15"/><ellipse cx="0" cy="0" rx="4" ry="1.5" fill="${c.epicCrystal}" opacity="0.5"/><ellipse cx="0" cy="-0.2" rx="3" ry="1" fill="${c.epicCrystal}" opacity="0.3"/><path d="M-2.5,0 Q-2.8,-3 -2.2,-6" stroke="${c.trunk}" stroke-width="0.7" fill="none"/><path d="M-2.2,-6 Q-4.5,-5.5 -5.5,-4.5" stroke="${c.palm}" stroke-width="0.5" fill="none"/><path d="M-2.2,-6 Q-0.5,-5.5 0.5,-5.5" stroke="${c.palm}" stroke-width="0.5" fill="none"/><path d="M-2.2,-6 Q-3.5,-5 -4,-3.5" stroke="${c.palm}" stroke-width="0.4" fill="none"/><path d="M-2.2,-6 Q-1,-7 0,-7" stroke="${c.palm}" stroke-width="0.4" fill="none"/><path d="M2,0 Q2.3,-2.5 1.8,-5" stroke="${c.trunk}" stroke-width="0.6" fill="none"/><path d="M1.8,-5 Q4,-4.5 4.5,-3.5" stroke="${c.palm}" stroke-width="0.45" fill="none"/><path d="M1.8,-5 Q0,-4.5 -0.8,-4.5" stroke="${c.palm}" stroke-width="0.45" fill="none"/><path d="M1.8,-5 Q3,-3.5 3.5,-2.5" stroke="${c.palm}" stroke-width="0.35" fill="none"/></g>`;
}
var init_rare_landscapes = __esm({
  "src/themes/terrain/epics/renderers/rare-landscapes.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/epics/renderers/rare-landmarks.ts
function renderVolcano(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.15"/><polygon points="-6,0 -1.8,-9 1.8,-9 6,0" fill="${c.boulder}"/><polygon points="0,-9 1.8,-9 6,0 0,0" fill="${c.rock}" opacity="0.5"/><line x1="-4" y1="-3" x2="4" y2="-3" stroke="${c.rock}" stroke-width="0.25" opacity="0.3"/><ellipse cx="0" cy="-9" rx="2" ry="0.8" fill="#ff4500"/><ellipse cx="0" cy="-9" rx="1.2" ry="0.5" fill="#ff8c00"/><ellipse cx="0" cy="-9" rx="0.6" ry="0.25" fill="#ffcc00" opacity="0.7"/><path d="M0.5,-9 Q1,-7 0.8,-5" stroke="#ff4500" stroke-width="0.4" fill="none" opacity="0.6"/><circle cx="-0.5" cy="-10.5" r="0.5" fill="${c.rock}" opacity="0.3"/><circle cx="0.5" cy="-11.5" r="0.6" fill="${c.rock}" opacity="0.25"/><circle cx="-0.2" cy="-12.5" r="0.4" fill="${c.rock}" opacity="0.2"/></g>`;
}
function renderGiantMushroom(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/><rect x="-1.2" y="-5" width="2.4" height="5" fill="${c.mushroom}" rx="0.4"/><ellipse cx="0" cy="-2" rx="1.3" ry="0.3" fill="${c.mushroom}" opacity="0.5"/><ellipse cx="0" cy="-5" rx="5" ry="1.2" fill="${c.mushroom}" opacity="0.6"/><line x1="-3" y1="-5" x2="-1" y2="-5" stroke="${c.mushroom}" stroke-width="0.15" opacity="0.4"/><line x1="1" y1="-5" x2="3" y2="-5" stroke="${c.mushroom}" stroke-width="0.15" opacity="0.4"/><ellipse cx="0" cy="-6.5" rx="5" ry="3.2" fill="${c.mushroomCap}"/><ellipse cx="-1" cy="-7.5" rx="2" ry="1" fill="${c.mushroomCap}" opacity="0.4"/><circle cx="-2.5" cy="-7" r="0.7" fill="${c.mushroom}" opacity="0.5"/><circle cx="1.8" cy="-6.5" r="0.6" fill="${c.mushroom}" opacity="0.45"/><circle cx="0" cy="-8.5" r="0.5" fill="${c.mushroom}" opacity="0.4"/><circle cx="-1" cy="-5.5" r="0.4" fill="${c.mushroom}" opacity="0.35"/></g>`;
}
function renderColosseum(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-2" rx="5.5" ry="3.2" fill="${c.epicMarble}"/><ellipse cx="0" cy="-2.5" rx="3.5" ry="1.8" fill="${c.wallShade}" opacity="0.5"/><line x1="-4" y1="-5" x2="-4" y2="-2" stroke="${c.wall}" stroke-width="0.4"/><line x1="-2" y1="-5.5" x2="-2" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/><line x1="0" y1="-5.5" x2="0" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/><line x1="2" y1="-5.5" x2="2" y2="-2.5" stroke="${c.wall}" stroke-width="0.4"/><line x1="4" y1="-5" x2="4" y2="-2" stroke="${c.wall}" stroke-width="0.4"/><path d="M-4,-4.5 Q-3,-5.5 -2,-4.8" fill="none" stroke="${c.wall}" stroke-width="0.3"/><path d="M-2,-5 Q-1,-5.8 0,-5" fill="none" stroke="${c.wall}" stroke-width="0.3"/><path d="M0,-5 Q1,-5.8 2,-5" fill="none" stroke="${c.wall}" stroke-width="0.3"/><path d="M2,-4.8 Q3,-5.5 4,-4.5" fill="none" stroke="${c.wall}" stroke-width="0.3"/></g>`;
}
function renderPagoda(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/><rect x="-2.5" y="-3" width="5" height="3" fill="${c.epicMarble}"/><rect x="-2.5" y="-3" width="2.5" height="3" fill="${c.wallShade}" opacity="0.2"/><path d="M-4.5,-3 Q-3,-4 0,-4.5 Q3,-4 4.5,-3" fill="${c.roofA}"/><rect x="-1.8" y="-7" width="3.6" height="2.5" fill="${c.epicMarble}"/><path d="M-3.5,-7 Q-2,-8 0,-8.2 Q2,-8 3.5,-7" fill="${c.roofA}"/><rect x="-1.2" y="-10.5" width="2.4" height="2.3" fill="${c.epicMarble}"/><path d="M-2.5,-10.5 Q-1,-11.5 0,-11.8 Q1,-11.5 2.5,-10.5" fill="${c.roofA}"/><line x1="0" y1="-11.8" x2="0" y2="-13.5" stroke="${c.epicGold}" stroke-width="0.4"/><circle cx="0" cy="-13.7" r="0.3" fill="${c.epicGold}"/><circle cx="0" cy="-2" r="0.4" fill="${c.wallShade}" opacity="0.5"/><circle cx="0" cy="-6" r="0.3" fill="${c.wallShade}" opacity="0.4"/></g>`;
}
function renderTorii(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="4" ry="0.7" fill="${c.shadow}" opacity="0.15"/><rect x="-4.5" y="-0.5" width="1.5" height="0.5" fill="${c.rock}" rx="0.2"/><rect x="3" y="-0.5" width="1.5" height="0.5" fill="${c.rock}" rx="0.2"/><path d="M-4.2,-0.5 L-3.8,-8 L-3.3,-8 L-3.5,-0.5 Z" fill="${c.roofA}"/><path d="M3.5,-0.5 L3.3,-8 L3.8,-8 L4.2,-0.5 Z" fill="${c.roofA}"/><path d="M-5.5,-7.5 Q0,-9.5 5.5,-7.5" stroke="${c.roofA}" stroke-width="1" fill="none"/><path d="M-5.5,-7.5 Q0,-9 5.5,-7.5" fill="${c.roofA}"/><rect x="-4.2" y="-6.5" width="8.4" height="0.5" fill="${c.roofA}"/><rect x="-0.8" y="-7.5" width="1.6" height="1.5" fill="${c.epicGold}" opacity="0.3" rx="0.1"/></g>`;
}
function renderEiffelTower(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><path d="M-3.5,0 Q-1.75,-2 0,0" fill="none" stroke="${c.boulder}" stroke-width="0.4"/><path d="M0,0 Q1.75,-2 3.5,0" fill="none" stroke="${c.boulder}" stroke-width="0.4"/><line x1="-3.5" y1="0" x2="-0.6" y2="-10" stroke="${c.boulder}" stroke-width="0.5"/><line x1="3.5" y1="0" x2="0.6" y2="-10" stroke="${c.boulder}" stroke-width="0.5"/><line x1="-2.5" y1="-3" x2="2.5" y2="-3" stroke="${c.boulder}" stroke-width="0.3"/><line x1="-1.8" y1="-5.5" x2="1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.3"/><line x1="-2.5" y1="-3" x2="1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.15" opacity="0.5"/><line x1="2.5" y1="-3" x2="-1.8" y2="-5.5" stroke="${c.boulder}" stroke-width="0.15" opacity="0.5"/><rect x="-2" y="-5.8" width="4" height="0.5" fill="${c.boulder}"/><line x1="0" y1="-10" x2="0" y2="-14" stroke="${c.boulder}" stroke-width="0.4"/><rect x="-0.8" y="-10.3" width="1.6" height="0.5" fill="${c.boulder}"/><line x1="0" y1="-14" x2="0" y2="-14.5" stroke="${c.epicGold}" stroke-width="0.2"/></g>`;
}
function renderWindmillGrand(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="2.5" ry="0.5" fill="${c.shadow}" opacity="0.15"/><polygon points="-2.5,0 -1.5,-8 1.5,-8 2.5,0" fill="${c.windmill}"/><polygon points="-2.5,0 -1.5,-8 0,-8 0,0" fill="${c.wallShade}" opacity="0.15"/><polygon points="-2,-8 0,-10.5 2,-8" fill="${c.roofA}"/><rect x="-0.6" y="-1.5" width="1.2" height="1.5" fill="${c.wallShade}" opacity="0.4" rx="0.6" ry="0"/><circle cx="0" cy="-5" r="0.5" fill="${c.wallShade}" opacity="0.3"/><g transform="translate(0,-7.5)"><g><polygon points="-0.4,0 -0.2,-6 0.2,-6 0.4,0" fill="${c.windBlade}" opacity="0.85"/><polygon points="0,-0.4 6,-0.2 6,0.2 0,0.4" fill="${c.windBlade}" opacity="0.85"/><polygon points="-0.4,0 -0.2,6 0.2,6 0.4,0" fill="${c.windBlade}" opacity="0.85"/><polygon points="0,-0.4 -6,-0.2 -6,0.2 0,0.4" fill="${c.windBlade}" opacity="0.85"/>` + motionMarkup(
    `<animateTransform attributeName="transform" type="rotate" values="0;360" dur="6s" repeatCount="indefinite"/>`
  ) + `</g></g><circle cx="0" cy="-7.5" r="0.6" fill="${c.boulder}"/></g>`;
}
var init_rare_landmarks = __esm({
  "src/themes/terrain/epics/renderers/rare-landmarks.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/epics/renderers/epic-landscapes.ts
function renderAurora(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0" rx="5" ry="1.5" fill="${c.snowGround}" opacity="0.3"/><path d="M-6,-2 Q-3,-8 0,-5 Q3,-9 6,-3" stroke="${c.epicJade}" stroke-width="1.5" fill="none" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/><path d="M-5,-3 Q-2,-10 1,-6 Q4,-11 6,-4" stroke="${c.epicPortal}" stroke-width="1" fill="none" opacity="0.35" ${motionMarkup('class="epic-glow-pulse"')}/><path d="M-6,-1 Q-3,-6 0,-4 Q3,-7 5,-2" stroke="${c.epicMagic}" stroke-width="0.8" fill="none" opacity="0.3"/><path d="M-4,-4 Q-1,-11 2,-7 Q5,-12 6,-5" stroke="${c.epicCrystal}" stroke-width="0.6" fill="none" opacity="0.25" ${motionMarkup('class="epic-glow-pulse"')}/><polygon points="-4,0 -3.5,-2 -3,0" fill="${c.epicJade}" opacity="0.4"/><polygon points="-2,0 -1.5,-2.5 -1,0" fill="${c.epicJade}" opacity="0.35"/><polygon points="2.5,0 3,-1.8 3.5,0" fill="${c.epicJade}" opacity="0.35"/><circle cx="-3" cy="-10" r="0.2" fill="${c.epicCrystal}" opacity="0.5"/><circle cx="2" cy="-11" r="0.15" fill="${c.epicCrystal}" opacity="0.4"/><circle cx="4.5" cy="-9" r="0.18" fill="${c.epicCrystal}" opacity="0.45"/></g>`;
}
function renderGiantWaterfall(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.5" rx="5" ry="1" fill="${c.shadow}" opacity="0.12"/><rect x="-5.5" y="-10" width="4" height="10" fill="${c.boulder}"/><rect x="-5.5" y="-10" width="2" height="10" fill="${c.rock}" opacity="0.3"/><rect x="1.5" y="-10" width="4" height="10" fill="${c.rock}"/><rect x="3.5" y="-10" width="2" height="10" fill="${c.boulder}" opacity="0.3"/><rect x="-1.5" y="-10" width="3" height="10" fill="${c.epicCrystal}" opacity="0.45"/><rect x="-0.6" y="-10" width="1.2" height="10" fill="${c.epicCrystal}" opacity="0.25"/><line x1="-1" y1="-4" x2="1" y2="-4" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.3"/><line x1="-0.8" y1="-7" x2="0.8" y2="-7" stroke="${c.epicCrystal}" stroke-width="0.15" opacity="0.25"/><ellipse cx="0" cy="-10.5" rx="6" ry="1.5" fill="${c.epicJade}"/><ellipse cx="-1" cy="0.5" rx="2.5" ry="0.8" fill="${c.epicCrystal}" opacity="0.2"/><ellipse cx="1" cy="0.3" rx="2" ry="0.6" fill="${c.epicCrystal}" opacity="0.15"/><circle cx="-3" cy="0" r="0.6" fill="${c.boulder}" opacity="0.5"/><circle cx="3.5" cy="0.2" r="0.5" fill="${c.rock}" opacity="0.4"/></g>`;
}
function renderBambooGrove(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3.5" ry="0.7" fill="${c.shadow}" opacity="0.12"/><line x1="-3" y1="0" x2="-3" y2="-11" stroke="${c.epicJade}" stroke-width="0.7"/><line x1="-1.5" y1="0" x2="-1.5" y2="-13" stroke="${c.epicJade}" stroke-width="0.6"/><line x1="0" y1="0" x2="0" y2="-12" stroke="${c.epicJade}" stroke-width="0.7"/><line x1="1.5" y1="0" x2="1.5" y2="-11.5" stroke="${c.epicJade}" stroke-width="0.6"/><line x1="3" y1="0" x2="3" y2="-10" stroke="${c.epicJade}" stroke-width="0.65"/><line x1="-3.4" y1="-4" x2="-2.6" y2="-4" stroke="${c.leaf}" stroke-width="0.3"/><line x1="-3.4" y1="-7" x2="-2.6" y2="-7" stroke="${c.leaf}" stroke-width="0.3"/><line x1="-1.9" y1="-5" x2="-1.1" y2="-5" stroke="${c.leaf}" stroke-width="0.3"/><line x1="-1.9" y1="-9" x2="-1.1" y2="-9" stroke="${c.leaf}" stroke-width="0.3"/><line x1="-0.4" y1="-6" x2="0.4" y2="-6" stroke="${c.leaf}" stroke-width="0.3"/><line x1="1.1" y1="-4.5" x2="1.9" y2="-4.5" stroke="${c.leaf}" stroke-width="0.3"/><line x1="2.6" y1="-5" x2="3.4" y2="-5" stroke="${c.leaf}" stroke-width="0.3"/><path d="M-3,-7 Q-4.5,-7 -5.5,-6.5" stroke="${c.leaf}" stroke-width="0.35" fill="none"/><path d="M-1.5,-9 Q-3,-9 -4,-8.5" stroke="${c.leaf}" stroke-width="0.3" fill="none"/><path d="M0,-6 Q1.5,-6 2.5,-5.5" stroke="${c.leaf}" stroke-width="0.3" fill="none"/><path d="M1.5,-4.5 Q3,-4.5 4,-4" stroke="${c.leaf}" stroke-width="0.3" fill="none"/><path d="M3,-5 Q4.5,-5 5,-4.5" stroke="${c.leaf}" stroke-width="0.25" fill="none"/></g>`;
}
function renderGlacierPeak(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5" ry="1" fill="${c.shadow}" opacity="0.12"/><polygon points="-6,0 -1,-10 1,-10 6,0" fill="${c.ice}"/><polygon points="0,-10 1,-10 6,0 0,0" fill="${c.snowGround}" opacity="0.5"/><polygon points="-1,-10 0,-13.5 1,-10" fill="${c.snowCap}"/><polygon points="-3.5,-5 -2.5,-8 -1.5,-5" fill="${c.icicle}" opacity="0.5"/><polygon points="2,-4 3,-7.5 4,-4" fill="${c.icicle}" opacity="0.45"/><path d="M-5,-2 Q-3,-3 -1,-2 Q1,-3 3,-2 Q5,-3 6,0" fill="${c.snowCap}" opacity="0.25"/><line x1="-2" y1="-3" x2="-1" y2="-5.5" stroke="${c.epicCrystal}" stroke-width="0.25" opacity="0.4"/><line x1="1.5" y1="-2" x2="2" y2="-4" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.35"/><line x1="-3" y1="-1" x2="-3.2" y2="0" stroke="${c.icicle}" stroke-width="0.3" opacity="0.4"/><line x1="3.5" y1="-1" x2="3.7" y2="0" stroke="${c.icicle}" stroke-width="0.25" opacity="0.35"/></g>`;
}
function renderBioluminescentPool(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.1"/><ellipse cx="0" cy="0" rx="5.5" ry="2.2" fill="${c.boulder}"/><circle cx="-4" cy="-0.5" r="0.8" fill="${c.rock}" opacity="0.5"/><circle cx="4" cy="-0.3" r="0.7" fill="${c.rock}" opacity="0.45"/><ellipse cx="0" cy="-0.3" rx="4" ry="1.5" fill="${c.epicPortal}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/><ellipse cx="0" cy="-0.5" rx="2.5" ry="0.9" fill="${c.epicPortal}" opacity="0.3" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="-1.5" cy="-0.3" r="0.3" fill="${c.epicPortal}" opacity="0.6" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="1.2" cy="-0.5" r="0.25" fill="${c.epicCrystal}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="0" cy="0.2" r="0.2" fill="${c.epicPortal}" opacity="0.4"/><line x1="-3" y1="-1" x2="-3" y2="-2" stroke="${c.epicPortal}" stroke-width="0.2"/><ellipse cx="-3" cy="-2.2" rx="0.4" ry="0.25" fill="${c.epicPortal}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/><line x1="3.5" y1="-0.8" x2="3.5" y2="-1.8" stroke="${c.epicPortal}" stroke-width="0.2"/><ellipse cx="3.5" cy="-2" rx="0.35" ry="0.2" fill="${c.epicCrystal}" opacity="0.45" ${motionMarkup('class="epic-glow-pulse"')}/></g>`;
}
function renderMeteorCrater(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1.2" fill="${c.shadow}" opacity="0.12"/><ellipse cx="0" cy="0" rx="5.5" ry="2.8" fill="${c.rock}"/><ellipse cx="0" cy="-0.3" rx="4" ry="1.8" fill="${c.boulder}" opacity="0.7"/><ellipse cx="0" cy="-0.2" rx="2.2" ry="0.9" fill="${c.shadow}" opacity="0.5"/><polygon points="-0.5,-0.5 0.2,-1.2 0.8,-0.3 0.3,0.2" fill="${c.rock}"/><polygon points="-0.5,-0.5 0.2,-1.2 0.8,-0.3 0.3,0.2" fill="${c.epicGold}" opacity="0.3"/><circle cx="0.1" cy="-0.4" r="1" fill="${c.epicGold}" opacity="0.15"/><circle cx="-4.5" cy="-1" r="0.5" fill="${c.rock}" opacity="0.5"/><circle cx="4" cy="0.5" r="0.6" fill="${c.rock}" opacity="0.45"/><circle cx="-2.5" cy="1.2" r="0.35" fill="${c.boulder}" opacity="0.4"/><circle cx="2.5" cy="-1.5" r="0.4" fill="${c.boulder}" opacity="0.35"/><line x1="0" y1="-0.5" x2="-3" y2="-1.5" stroke="${c.shadow}" stroke-width="0.2" opacity="0.3"/><line x1="0" y1="-0.5" x2="2.5" y2="0.5" stroke="${c.shadow}" stroke-width="0.2" opacity="0.25"/></g>`;
}
var init_epic_landscapes = __esm({
  "src/themes/terrain/epics/renderers/epic-landscapes.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/epics/renderers/epic-landmarks.ts
function renderBonsaiGiant(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.2" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="0" rx="2.5" ry="0.8" fill="${c.rock}" opacity="0.5"/><path d="M-0.5,0 Q-1.5,-2 -2,-3.5 Q-2.5,-4.5 -2,-5.5" stroke="${c.trunk}" stroke-width="1.3" fill="none"/><path d="M-1.5,-3 Q0,-4 1.5,-4.5 Q2,-5 2,-6" stroke="${c.trunk}" stroke-width="0.9" fill="none"/><path d="M-2,-5.5 Q-3,-6 -3.5,-6.5" stroke="${c.trunk}" stroke-width="0.5" fill="none"/><ellipse cx="-2.5" cy="-7" rx="2" ry="1.3" fill="${c.bushDark}"/><ellipse cx="-2.5" cy="-7" rx="1.8" ry="1.1" fill="${c.epicJade}"/><ellipse cx="2" cy="-6.5" rx="2.2" ry="1.5" fill="${c.bushDark}"/><ellipse cx="2" cy="-6.5" rx="2" ry="1.3" fill="${c.epicJade}"/><ellipse cx="-0.5" cy="-8.5" rx="1.5" ry="1" fill="${c.bushDark}"/><ellipse cx="-0.5" cy="-8.5" rx="1.3" ry="0.8" fill="${c.epicJade}"/><ellipse cx="-1" cy="-9" rx="0.6" ry="0.4" fill="${c.leafLight}" opacity="0.4"/></g>`;
}
function renderTajMahal(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5" ry="1" fill="${c.shadow}" opacity="0.15"/><rect x="-5" y="-1" width="10" height="1" fill="${c.epicMarble}" opacity="0.8"/><rect x="-3.5" y="-5" width="7" height="4" fill="${c.epicMarble}"/><rect x="0" y="-5" width="3.5" height="4" fill="${c.wallShade}" opacity="0.1"/><path d="M-1.2,-1 L-1.2,-3.5 Q0,-4.5 1.2,-3.5 L1.2,-1" fill="${c.wallShade}" opacity="0.3"/><path d="M-2.5,-5 Q-2.5,-8 0,-10.5 Q2.5,-8 2.5,-5" fill="${c.epicMarble}"/><line x1="0" y1="-10.5" x2="0" y2="-11.5" stroke="${c.epicGold}" stroke-width="0.3"/><circle cx="0" cy="-11.7" r="0.3" fill="${c.epicGold}"/><rect x="-5.5" y="-8" width="0.8" height="7" fill="${c.epicMarble}"/><circle cx="-5.1" cy="-8.3" r="0.4" fill="${c.epicGold}"/><rect x="4.7" y="-8" width="0.8" height="7" fill="${c.epicMarble}"/><circle cx="5.1" cy="-8.3" r="0.4" fill="${c.epicGold}"/><line x1="-3.5" y1="-3" x2="3.5" y2="-3" stroke="${c.epicGold}" stroke-width="0.2" opacity="0.4"/></g>`;
}
function renderStBasils(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/><rect x="-3.5" y="-4" width="7" height="4" fill="${c.epicMarble}"/><rect x="-3.5" y="-4" width="3.5" height="4" fill="${c.wallShade}" opacity="0.1"/><rect x="-0.8" y="-7" width="1.6" height="3" fill="${c.epicMarble}"/><path d="M-3,-4 Q-3,-6 -3,-7 Q-3.8,-6 -3.8,-5 Q-3.8,-4.5 -3,-4" fill="${c.roofA}"/><circle cx="-3" cy="-7.3" r="0.25" fill="${c.epicGold}"/><path d="M-0.8,-7 Q-0.8,-9.5 0,-10.5 Q0.8,-9.5 0.8,-7" fill="${c.epicJade}"/><circle cx="0" cy="-10.8" r="0.3" fill="${c.epicGold}"/><path d="M3,-4 Q3,-6 3,-7 Q3.8,-6 3.8,-5 Q3.8,-4.5 3,-4" fill="${c.epicMagic}"/><circle cx="3" cy="-7.3" r="0.25" fill="${c.epicGold}"/><line x1="-3" y1="-5.5" x2="-3" y2="-6.5" stroke="${c.epicGold}" stroke-width="0.15" opacity="0.4"/><line x1="0" y1="-8" x2="0" y2="-9.5" stroke="${c.epicGold}" stroke-width="0.15" opacity="0.4"/><path d="M-0.4,-4.5 Q0,-5.2 0.4,-4.5" fill="${c.wallShade}" opacity="0.4"/></g>`;
}
function renderOperaHouse(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5.5" ry="1" fill="${c.shadow}" opacity="0.15"/><rect x="-5.5" y="-0.5" width="11" height="0.8" fill="${c.epicMarble}" opacity="0.8"/><rect x="-5" y="-1" width="10" height="0.5" fill="${c.epicMarble}"/><path d="M-5,-1 Q-3.5,-7 -2,-1" fill="${c.epicMarble}"/><path d="M-2.5,-1 Q-0.5,-9 1.5,-1" fill="${c.epicMarble}"/><path d="M0.5,-1 Q2.5,-7.5 4,-1" fill="${c.epicMarble}"/><path d="M3,-1 Q4.2,-5 5,-1" fill="${c.epicMarble}"/><path d="M-5,-1 Q-3.5,-7 -2,-1" fill="none" stroke="${c.wall}" stroke-width="0.2" opacity="0.3"/><path d="M-2.5,-1 Q-0.5,-9 1.5,-1" fill="none" stroke="${c.wall}" stroke-width="0.2" opacity="0.3"/><ellipse cx="0" cy="0.8" rx="4" ry="0.5" fill="${c.epicCrystal}" opacity="0.15"/></g>`;
}
var init_epic_landmarks = __esm({
  "src/themes/terrain/epics/renderers/epic-landmarks.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/epics/renderers/legendary.ts
function renderFloatingIsland(x, y, c) {
  return `<g transform="translate(${x},${y})"><polygon points="-3.5,3 -2,1 0,0.5 2,1 3.5,3 1,4.5 -1,4.5" fill="${c.boulder}" opacity="0.7"/><polygon points="-2,1 0,0.5 2,1 1,4 -1,4" fill="${c.rock}" opacity="0.5"/><path d="M-1,3 Q-1.5,5 -1,6" stroke="${c.trunk}" stroke-width="0.3" fill="none" opacity="0.5"/><path d="M0.5,3.5 Q0,5.5 0.5,7" stroke="${c.trunk}" stroke-width="0.25" fill="none" opacity="0.4"/><ellipse cx="0" cy="-1" rx="4.5" ry="1.8" fill="${c.leaf}"/><ellipse cx="0" cy="-1.3" rx="3.5" ry="1.2" fill="${c.epicJade}" opacity="0.5"/><rect x="-0.3" y="-4.5" width="0.6" height="3" fill="${c.trunk}"/><ellipse cx="0" cy="-5.5" rx="2" ry="1.5" fill="${c.bushDark}"/><ellipse cx="0" cy="-5.5" rx="1.8" ry="1.3" fill="${c.epicJade}"/><circle cx="2.5" cy="-1.5" r="0.8" fill="${c.epicJade}" opacity="0.7"/><ellipse cx="-3" cy="0" rx="1.2" ry="0.4" fill="${c.epicCrystal}" opacity="0.15"/><ellipse cx="3.5" cy="1" rx="1" ry="0.3" fill="${c.epicCrystal}" opacity="0.12"/></g>`;
}
function renderCrystalSpire(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="3" ry="0.6" fill="${c.shadow}" opacity="0.12"/><polygon points="-3.5,0 -3,-3 -2.5,0" fill="${c.epicCrystal}" opacity="0.4"/><polygon points="3,0 3.5,-2.5 4,0" fill="${c.epicCrystal}" opacity="0.35"/><polygon points="-4.5,0 -4,-2 -3.5,0" fill="${c.epicCrystal}" opacity="0.3"/><polygon points="-2,0 -0.5,-10 0,-13 0,0" fill="${c.epicCrystal}" opacity="0.7"/><polygon points="0,0 0,-13 0.5,-10 2,0" fill="${c.epicCrystal}" opacity="0.5"/><polygon points="-0.5,-3 0,-13 0.5,-3" fill="${c.epicCrystal}" opacity="0.3"/><polygon points="-2.5,0 -1.5,-6 -0.5,0" fill="${c.epicCrystal}" opacity="0.45"/><polygon points="1,0 2,-5 3,0" fill="${c.epicCrystal}" opacity="0.4"/><line x1="-0.3" y1="-8" x2="0.3" y2="-7" stroke="${c.epicCrystal}" stroke-width="0.3" opacity="0.6"/><line x1="-0.5" y1="-5" x2="0.2" y2="-4.5" stroke="${c.epicCrystal}" stroke-width="0.2" opacity="0.5"/><circle cx="0" cy="-13" r="0.4" fill="${c.epicCrystal}" opacity="0.4"/></g>`;
}
function renderDragonNest(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="5" ry="1.2" fill="${c.shadow}" opacity="0.15"/><ellipse cx="0" cy="-0.5" rx="5" ry="2" fill="${c.trunk}"/><path d="M-4,-0.5 Q-2,-1.5 0,-0.5 Q2,-1.5 4,-0.5" fill="none" stroke="${c.trunk}" stroke-width="0.5" opacity="0.5"/><path d="M-3.5,0 Q-1.5,-1 0.5,0 Q2.5,-1 4.5,0" fill="none" stroke="${c.trunk}" stroke-width="0.4" opacity="0.4"/><ellipse cx="0" cy="-1" rx="3.5" ry="1.2" fill="${c.trunk}" opacity="0.6"/><ellipse cx="-1.2" cy="-1.5" rx="0.8" ry="1" fill="${c.epicGold}"/><ellipse cx="0.5" cy="-1.5" rx="0.8" ry="1" fill="${c.epicGold}"/><ellipse cx="-0.3" cy="-2" rx="0.7" ry="0.9" fill="${c.epicCrystal}"/><ellipse cx="-1" cy="-1.8" rx="0.2" ry="0.3" fill="${c.epicGold}" opacity="0.3"/><ellipse cx="0.7" cy="-1.8" rx="0.2" ry="0.3" fill="${c.epicGold}" opacity="0.3"/><path d="M3.5,-1 Q4,-3 4.5,-4 Q5.5,-5 5,-6 Q4.5,-5.5 4.5,-5" fill="${c.epicJade}" opacity="0.6"/><path d="M4,-4 Q5.5,-6 6,-4.5 Q5,-3.5 4,-4" fill="${c.epicJade}" opacity="0.4"/><circle cx="4.7" cy="-5.5" r="0.15" fill="${c.epicGold}"/></g>`;
}
function renderWorldTree(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/><path d="M-1.5,0 Q-3,0.5 -4,0" stroke="${c.trunk}" stroke-width="0.5" fill="none"/><path d="M1.5,0 Q3,0.5 4,0" stroke="${c.trunk}" stroke-width="0.5" fill="none"/><rect x="-2" y="-7" width="4" height="7" fill="${c.trunk}" rx="0.8"/><line x1="-0.5" y1="0" x2="-0.5" y2="-7" stroke="${c.trunk}" stroke-width="0.5" opacity="0.3"/><line x1="1" y1="0" x2="1" y2="-7" stroke="${c.trunk}" stroke-width="0.4" opacity="0.25"/><ellipse cx="0" cy="-9" rx="6" ry="4.5" fill="${c.bushDark}"/><ellipse cx="0" cy="-9" rx="5.5" ry="4" fill="${c.epicJade}"/><ellipse cx="-2" cy="-11" rx="3.5" ry="2.8" fill="${c.epicJade}" opacity="0.85"/><ellipse cx="2" cy="-11" rx="3.5" ry="2.8" fill="${c.epicJade}" opacity="0.8"/><ellipse cx="0" cy="-13" rx="3" ry="2" fill="${c.leaf}" opacity="0.6"/><ellipse cx="-1" cy="-13.5" rx="1.5" ry="0.8" fill="${c.leafLight}" opacity="0.4"/><circle cx="-4" cy="-9" r="0.3" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="3" cy="-11" r="0.3" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="0" cy="-7.5" r="0.25" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="-2" cy="-13" r="0.2" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="1.5" cy="-8" r="0.2" fill="${c.epicGold}" ${motionMarkup('class="epic-glow-pulse"')}/></g>`;
}
function renderSakuraEternal(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/><path d="M0,0 Q-0.5,-2 -1,-3.5 Q-1.5,-4.5 -1,-5.5" stroke="${c.trunk}" stroke-width="1.8" fill="none"/><path d="M-1,-5 Q-3,-6 -3.5,-7" stroke="${c.trunk}" stroke-width="1" fill="none"/><path d="M-0.8,-4.5 Q1.5,-6 2.5,-7" stroke="${c.trunk}" stroke-width="0.9" fill="none"/><path d="M-1,-5.5 Q-0.5,-7 0,-8" stroke="${c.trunk}" stroke-width="0.6" fill="none"/><ellipse cx="0" cy="-9.5" rx="5.5" ry="3.8" fill="${c.cherryPetalPink}" opacity="0.9"/><ellipse cx="-2" cy="-11" rx="3.5" ry="2.2" fill="${c.cherryPetalPink}" opacity="0.8"/><ellipse cx="2" cy="-11" rx="3" ry="2" fill="${c.cherryPetalWhite}" opacity="0.65"/><ellipse cx="0" cy="-12.5" rx="2.5" ry="1.5" fill="${c.cherryPetalPink}" opacity="0.6"/><ellipse cx="1" cy="-12" rx="1.2" ry="0.6" fill="${c.cherryPetalWhite}" opacity="0.4"/><circle cx="-5" cy="-5" r="0.3" fill="${c.cherryPetalPink}" opacity="0.6" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="4" cy="-4" r="0.25" fill="${c.cherryPetalWhite}" opacity="0.5" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="-3" cy="-2" r="0.2" fill="${c.cherryPetalPink}" opacity="0.45" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="2" cy="-1" r="0.2" fill="${c.cherryPetalWhite}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/><circle cx="-1" cy="0.5" r="0.18" fill="${c.cherryPetalPink}" opacity="0.35"/></g>`;
}
function renderAncientPortal(x, y, c) {
  return `<g transform="translate(${x},${y})"><ellipse cx="0" cy="0.3" rx="4" ry="0.8" fill="${c.shadow}" opacity="0.15"/><rect x="-4.5" y="-9" width="2.2" height="9" fill="${c.rock}" rx="0.3"/><rect x="-4.5" y="-9" width="1.1" height="9" fill="${c.boulder}" opacity="0.3"/><rect x="2.3" y="-9" width="2.2" height="9" fill="${c.rock}" rx="0.3"/><rect x="3.4" y="-9" width="1.1" height="9" fill="${c.boulder}" opacity="0.3"/><path d="M-3.5,-9 Q0,-13 3.5,-9" fill="${c.rock}"/><path d="M-2.5,-9 Q0,-12 2.5,-9" fill="${c.boulder}" opacity="0.3"/><line x1="-3.5" y1="-3" x2="-3.5" y2="-4.5" stroke="${c.epicPortal}" stroke-width="0.3" opacity="0.4"/><circle cx="-3.5" cy="-6" r="0.3" fill="none" stroke="${c.epicPortal}" stroke-width="0.2" opacity="0.35"/><line x1="3.4" y1="-3" x2="3.4" y2="-4.5" stroke="${c.epicPortal}" stroke-width="0.3" opacity="0.4"/><circle cx="3.4" cy="-6" r="0.3" fill="none" stroke="${c.epicPortal}" stroke-width="0.2" opacity="0.35"/><ellipse cx="0" cy="-4.5" rx="2.5" ry="3.5" fill="${c.epicPortal}" opacity="0.35" ${motionMarkup('class="epic-portal-swirl"')}/><ellipse cx="0" cy="-4.5" rx="1.5" ry="2.5" fill="${c.epicPortal}" opacity="0.25" ${motionMarkup('class="epic-portal-swirl"')}/><ellipse cx="0" cy="-4.5" rx="0.6" ry="1" fill="${c.epicCrystal}" opacity="0.3" ${motionMarkup('class="epic-portal-swirl"')}/><circle cx="0" cy="-11.5" r="0.4" fill="${c.epicPortal}" opacity="0.4" ${motionMarkup('class="epic-glow-pulse"')}/></g>`;
}
var init_legendary = __esm({
  "src/themes/terrain/epics/renderers/legendary.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/epics/renderers.ts
var EPIC_RENDERERS;
var init_renderers2 = __esm({
  "src/themes/terrain/epics/renderers.ts"() {
    "use strict";
    init_cjs_shims();
    init_rare_landscapes();
    init_rare_landmarks();
    init_epic_landscapes();
    init_epic_landmarks();
    init_legendary();
    EPIC_RENDERERS = {
      mountFuji: renderMountFuji,
      giantSequoia: renderGiantSequoia,
      coralReef: renderCoralReef,
      geyser: renderGeyser,
      hotSpring: renderHotSpring,
      grandCanyon: renderGrandCanyon,
      oasis: renderOasis,
      volcano: renderVolcano,
      giantMushroom: renderGiantMushroom,
      colosseum: renderColosseum,
      pagoda: renderPagoda,
      torii: renderTorii,
      eiffelTower: renderEiffelTower,
      windmillGrand: renderWindmillGrand,
      aurora: renderAurora,
      giantWaterfall: renderGiantWaterfall,
      bambooGrove: renderBambooGrove,
      glacierPeak: renderGlacierPeak,
      bioluminescentPool: renderBioluminescentPool,
      meteorCrater: renderMeteorCrater,
      bonsaiGiant: renderBonsaiGiant,
      tajMahal: renderTajMahal,
      stBasils: renderStBasils,
      operaHouse: renderOperaHouse,
      floatingIsland: renderFloatingIsland,
      crystalSpire: renderCrystalSpire,
      dragonNest: renderDragonNest,
      worldTree: renderWorldTree,
      sakuraEternal: renderSakuraEternal,
      ancientPortal: renderAncientPortal
    };
  }
});

// src/themes/terrain/assets/richness.ts
function computeRichness(cell, cellMap) {
  let neighborSum = 0;
  let count = 0;
  for (let dw = -1; dw <= 1; dw++) {
    for (let dd = -1; dd <= 1; dd++) {
      if (dw === 0 && dd === 0) continue;
      const key = `${cell.week + dw},${cell.day + dd}`;
      const n = cellMap.get(key);
      if (n) {
        neighborSum += n.level100;
        count++;
      }
    }
  }
  if (count === 0) return 0;
  return neighborSum / (count * 99);
}
var init_richness = __esm({
  "src/themes/terrain/assets/richness.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/epics/selection.ts
function manhattanDistance(a, w, d) {
  return Math.abs(a.week - w) + Math.abs(a.day - d);
}
function selectEpicBuildings(isoCells, seed, stats, biomeMap) {
  const placed = [];
  const epicCells = /* @__PURE__ */ new Set();
  const cellMap = /* @__PURE__ */ new Map();
  for (const cell of isoCells) {
    cellMap.set(`${cell.week},${cell.day}`, cell);
  }
  const passedTiers = /* @__PURE__ */ new Set();
  for (const tier of ["legendary", "epic", "rare"]) {
    if (TIER_CONFIG[tier].statsGate(stats)) {
      passedTiers.add(tier);
    }
  }
  const eligibleBuildings = EPIC_BUILDINGS.filter((b) => passedTiers.has(b.tier));
  if (eligibleBuildings.length === 0) return { placed, epicCells };
  let streakMultiplier = 1;
  if (stats.currentStreak >= 30) streakMultiplier = 1.44;
  else if (stats.currentStreak >= 7) streakMultiplier = 1.15;
  const shuffled = [...isoCells].sort(
    (a, b) => assetDateSeed(seed, assetCellIdentity(a), "wonder-priority") - assetDateSeed(seed, assetCellIdentity(b), "wonder-priority")
  );
  for (const cell of shuffled) {
    if (placed.length >= MAX_EPIC_BUDGET) break;
    const key = `${cell.week},${cell.day}`;
    const identity = assetCellIdentity(cell);
    const rng = seededRandom(assetDateSeed(seed, identity, "wonder"));
    if (cell.count === 0 || cell.level100 === 0) continue;
    const biome = biomeMap?.get(key);
    if (biome?.isRiver || biome?.isPond) continue;
    const tooClose = placed.some(
      (p) => manhattanDistance(p, cell.week, cell.day) < MIN_MANHATTAN_DISTANCE
    );
    if (tooClose) continue;
    const richness = computeRichness(cell, cellMap);
    for (const tier of ["legendary", "epic", "rare"]) {
      if (!passedTiers.has(tier)) continue;
      const config = TIER_CONFIG[tier];
      if (cell.level100 < config.minLevel) continue;
      if (richness < config.minRichness) continue;
      const richnessExcess = richness - config.minRichness;
      const richnessBonus = 1 + Math.min(richnessExcess * 2, 0.5);
      const finalChance = config.baseChance * richnessBonus * streakMultiplier;
      if (rng() < finalChance) {
        const tierBuildings = eligibleBuildings.filter((b) => b.tier === tier);
        const building = tierBuildings[Math.floor(rng() * tierBuildings.length)];
        placed.push({
          id: `wonder:${identity}`,
          ...cell.date ? { date: cell.date } : {},
          catalogId: building.type,
          type: building.type,
          tier,
          week: cell.week,
          day: cell.day,
          cx: cell.isoX,
          cy: cell.isoY
        });
        epicCells.add(key);
        break;
      }
      break;
    }
  }
  return { placed, epicCells };
}
var MAX_EPIC_BUDGET, MIN_MANHATTAN_DISTANCE;
var init_selection2 = __esm({
  "src/themes/terrain/epics/selection.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    init_date_seed();
    init_richness();
    init_definitions();
    MAX_EPIC_BUDGET = 3;
    MIN_MANHATTAN_DISTANCE = 3;
  }
});

// src/themes/terrain/epics/rendering.ts
function renderEpicGlowDefs(mode) {
  const tiers = [
    { id: "epic-glow-rare", color: "#FFD700", darkOuter: 0, lightOuter: 0 },
    { id: "epic-glow-epic", color: "#9B59B6", darkOuter: 0, lightOuter: 0 },
    { id: "epic-glow-legendary", color: "#00CED1", darkOuter: 0, lightOuter: 0 }
  ];
  return tiers.map(
    (t) => `<radialGradient id="${motionId(t.id)}"><stop offset="0%" stop-color="${t.color}" stop-opacity="${mode === "dark" ? 0.4 : 0.3}"/><stop offset="100%" stop-color="${t.color}" stop-opacity="0"/></radialGradient>`
  ).join("");
}
function renderEpicCSS() {
  return motionMarkup(
    [
      `@keyframes epic-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.9; } }`,
      `.epic-glow-pulse { animation: epic-pulse 3s ease-in-out infinite; }`,
      `@keyframes epic-swirl { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`,
      `.epic-portal-swirl { animation: epic-swirl 8s linear infinite; transform-origin: center; }`
    ].join("\n")
  );
}
function renderEpicBuildings(placed, weekPalettes) {
  if (placed.length === 0) return "";
  const parts = placed.map((epic) => {
    const weekIdx = Math.min(epic.week, weekPalettes.length - 1);
    const palette = weekPalettes[weekIdx];
    const c = palette.assets;
    const renderer = EPIC_RENDERERS[epic.type];
    const glowId = `epic-glow-${epic.tier}`;
    const glow = `<ellipse cx="${epic.cx}" cy="${epic.cy}" rx="8" ry="4" fill="url(#${motionId(glowId)})" opacity="0.6"/>`;
    const building = renderer(epic.cx, epic.cy, c);
    return `<g data-catalog-id="${epic.type}" data-date="${escapeXml(epic.date ?? "")}" data-wonder-id="${escapeXml(epic.id ?? `wonder:${epic.week},${epic.day}`)}">${glow}${building}</g>`;
  });
  return `<g class="epic-buildings">${parts.join("")}</g>`;
}
var init_rendering = __esm({
  "src/themes/terrain/epics/rendering.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_animation();
    init_renderers2();
  }
});

// src/themes/terrain/epics/bounds.ts
var EPIC_BOUNDS;
var init_bounds2 = __esm({
  "src/themes/terrain/epics/bounds.ts"() {
    "use strict";
    init_cjs_shims();
    EPIC_BOUNDS = {
      mountFuji: { x: -8, y: -14, width: 16, height: 17 },
      giantSequoia: { x: -7, y: -16, width: 14, height: 18 },
      coralReef: { x: -7, y: -10, width: 14, height: 13 },
      geyser: { x: -5, y: -13, width: 10, height: 16 },
      hotSpring: { x: -6, y: -7, width: 12, height: 11 },
      grandCanyon: { x: -7, y: -9, width: 14, height: 12 },
      oasis: { x: -7, y: -9, width: 14, height: 13 },
      volcano: { x: -7, y: -14, width: 14, height: 17 },
      giantMushroom: { x: -6, y: -11, width: 12, height: 13 },
      colosseum: { x: -7, y: -7, width: 14, height: 10 },
      pagoda: { x: -6, y: -15, width: 12, height: 17 },
      torii: { x: -7, y: -10, width: 14, height: 12 },
      eiffelTower: { x: -5, y: -16, width: 10, height: 18 },
      windmillGrand: { x: -7, y: -15, width: 14, height: 17 },
      aurora: { x: -8, y: -13, width: 16, height: 16 },
      giantWaterfall: { x: -7, y: -13, width: 14, height: 16 },
      bambooGrove: { x: -7, y: -14, width: 13, height: 16 },
      glacierPeak: { x: -7, y: -15, width: 14, height: 18 },
      bioluminescentPool: { x: -7, y: -4, width: 14, height: 8 },
      meteorCrater: { x: -7, y: -4, width: 14, height: 8 },
      bonsaiGiant: { x: -6, y: -11, width: 12, height: 13 },
      tajMahal: { x: -7, y: -13, width: 14, height: 16 },
      stBasils: { x: -5, y: -13, width: 10, height: 16 },
      operaHouse: { x: -7, y: -7, width: 14, height: 10 },
      floatingIsland: { x: -6, y: -8, width: 12, height: 16 },
      crystalSpire: { x: -6, y: -15, width: 11, height: 17 },
      dragonNest: { x: -6, y: -7, width: 13, height: 10 },
      worldTree: { x: -7, y: -16, width: 14, height: 19 },
      sakuraEternal: { x: -7, y: -15, width: 14, height: 18 },
      ancientPortal: { x: -6, y: -13, width: 12, height: 16 }
    };
  }
});

// src/themes/terrain/epics/descriptions.ts
var WONDER_DESCRIPTIONS;
var init_descriptions = __esm({
  "src/themes/terrain/epics/descriptions.ts"() {
    "use strict";
    init_cjs_shims();
    WONDER_DESCRIPTIONS = {
      mountFuji: ["Mount Fuji", "nature", "A snow-capped volcanic cone above the village."],
      colosseum: ["Colosseum", "landmark", "An oval amphitheatre with two tiers of stone arches."],
      giantSequoia: ["Giant sequoia", "nature", "A towering evergreen with a broad russet trunk."],
      coralReef: ["Coral reef", "nature", "A miniature reef of branching, brightly colored coral."],
      pagoda: ["Pagoda", "landmark", "A tiered tower with sweeping rooflines."],
      torii: ["Torii gate", "landmark", "A vermilion gate with a gently curved crossbeam."],
      geyser: ["Geyser", "nature", "A spring sending pale water jets above a rocky basin."],
      hotSpring: ["Hot spring", "nature", "A steaming pool ringed by warm stones."],
      eiffelTower: ["Eiffel Tower", "landmark", "A tapering lattice tower with a wide arched base."],
      grandCanyon: ["Grand Canyon", "nature", "Layered red cliffs cut by a narrow river."],
      windmillGrand: ["Grand windmill", "landmark", "A tall mill with four large turning sails."],
      oasis: ["Oasis", "nature", "A small turquoise pool sheltered by palms."],
      volcano: ["Volcano", "nature", "A dark volcanic cone with a glowing crater."],
      giantMushroom: [
        "Giant mushroom",
        "nature",
        "An oversized spotted cap rising above smaller fungi."
      ],
      aurora: ["Aurora", "nature", "Ribbons of green and violet light over a dark landscape."],
      tajMahal: ["Taj Mahal", "landmark", "A pale domed monument flanked by slender minarets."],
      giantWaterfall: [
        "Giant waterfall",
        "nature",
        "A broad cascade descending from a high stone ledge."
      ],
      stBasils: [
        "Saint Basil\u2019s Cathedral",
        "landmark",
        "A cluster of colorful onion domes and slender spires."
      ],
      bambooGrove: ["Bamboo grove", "nature", "Tall jointed bamboo stems form a quiet green grove."],
      operaHouse: [
        "Sydney Opera House",
        "landmark",
        "White sail-shaped roofs rising from a low waterfront platform."
      ],
      glacierPeak: ["Glacier peak", "nature", "An angular ice peak with blue crevasses."],
      bioluminescentPool: [
        "Bioluminescent pool",
        "nature",
        "A sheltered pool dotted with softly glowing lights."
      ],
      meteorCrater: [
        "Meteor crater",
        "nature",
        "A round impact basin holding a luminous fallen stone."
      ],
      bonsaiGiant: ["Giant bonsai", "nature", "A broad sculpted canopy on a twisting old trunk."],
      floatingIsland: [
        "Floating island",
        "fantasy",
        "A grassy island suspended above its rocky underside."
      ],
      crystalSpire: ["Crystal spire", "fantasy", "A cluster of translucent pointed crystals."],
      dragonNest: ["Dragon nest", "fantasy", "A rocky nest sheltering a curled dragon."],
      worldTree: ["World tree", "fantasy", "An immense branching tree dotted with golden lights."],
      sakuraEternal: [
        "Eternal sakura",
        "fantasy",
        "A luminous flowering cherry tree with drifting petals."
      ],
      ancientPortal: [
        "Ancient portal",
        "fantasy",
        "An old stone arch framing a swirling magical opening."
      ]
    };
  }
});

// src/themes/terrain/epics/catalog.ts
function isEpicBuildingType(value) {
  return Object.hasOwn(EPIC_RENDERERS, value);
}
function getEpicCatalogEntry(type) {
  return EPIC_CATALOG_BY_ID[type];
}
var EPIC_CATALOG, EPIC_CATALOG_BY_ID, EPIC_CATALOG_COUNTS;
var init_catalog2 = __esm({
  "src/themes/terrain/epics/catalog.ts"() {
    "use strict";
    init_cjs_shims();
    init_gates();
    init_definitions();
    init_renderers2();
    init_bounds2();
    init_descriptions();
    init_gates();
    EPIC_CATALOG = EPIC_BUILDINGS.map(({ type, tier }) => {
      const [displayName, category, description] = WONDER_DESCRIPTIONS[type];
      const config = TIER_CONFIG[tier];
      return {
        id: type,
        type,
        tier,
        displayName,
        category,
        description,
        bounds: EPIC_BOUNDS[type],
        style: "wonder",
        season: "all",
        gate: {
          minLevel: config.minLevel,
          minRichness: config.minRichness,
          baseChance: config.baseChance,
          statsDescription: describeEpicStatsGate(tier),
          stats: EPIC_STATS_RULES[tier]
        }
      };
    });
    EPIC_CATALOG_BY_ID = Object.fromEntries(
      EPIC_CATALOG.map((entry) => [entry.id, entry])
    );
    EPIC_CATALOG_COUNTS = Object.freeze({
      total: EPIC_CATALOG.length,
      rare: EPIC_CATALOG.filter((entry) => entry.tier === "rare").length,
      epic: EPIC_CATALOG.filter((entry) => entry.tier === "epic").length,
      legendary: EPIC_CATALOG.filter((entry) => entry.tier === "legendary").length
    });
  }
});

// src/themes/terrain/epics.ts
var init_epics = __esm({
  "src/themes/terrain/epics.ts"() {
    "use strict";
    init_cjs_shims();
    init_definitions();
    init_renderers2();
    init_selection2();
    init_rendering();
    init_catalog2();
    init_gates();
  }
});

// src/themes/terrain/biomes.ts
function sample(seed, purpose, sector) {
  return seededRandom(hash(`${seed}:${purpose}:${sector}`))();
}
function riverDay(week, river, days, seed) {
  const sector = Math.floor(week / 6);
  const t = (week - sector * 6) / 6;
  const bend = lerp(
    sample(seed, `river-${river}`, sector),
    sample(seed, `river-${river}`, sector + 1),
    t * t * (3 - 2 * t)
  );
  const split = Math.max(1, Math.floor(days / 2));
  const start = river === 0 ? 0 : Math.min(split, days - 1);
  const span = river === 0 ? split : days - start;
  return start + Math.round(bend * Math.max(0, span - 1));
}
function waterAt(week, day, days, seed) {
  const isRiver = day === riverDay(week, 0, days, seed) || day === riverDay(week, 1, days, seed);
  const pondSector = Math.floor(week / 26);
  let isPond = false;
  for (let sector = pondSector - 1; sector <= pondSector + 1; sector++) {
    const centerWeek = sector * 26 + 3 + Math.floor(sample(seed, "pond-week", sector) * 20);
    const centerDay = riverDay(centerWeek, 0, days, seed);
    const radius = sample(seed, "pond-size", sector) > 0.5 ? 1 : 0;
    isPond ||= Math.abs(week - centerWeek) + Math.abs(day - centerDay) <= radius || week === centerWeek && day === Math.min(days - 1, centerDay + 1);
  }
  return { isRiver, isPond };
}
function forestAt(week, day, days, seed) {
  const home = Math.floor(week / 9);
  let density = 0;
  for (let sector = home - 1; sector <= home + 1; sector++) {
    const x = sector * 9 + Math.floor(sample(seed, "forest-week", sector) * 9);
    const y = Math.floor(sample(seed, "forest-day", sector) * days);
    const radius = 2 + sample(seed, "forest-radius", sector) * 2;
    density = Math.max(density, 1 - Math.hypot(week - x, day - y) / radius);
  }
  return density;
}
function generateBiomeMap(weeks, days, seed, firstAbsoluteWeek = 0) {
  const map = /* @__PURE__ */ new Map();
  for (let week = 0; week < weeks; week++) {
    const absoluteWeek = firstAbsoluteWeek + week;
    for (let day = 0; day < days; day++) {
      const water = waterAt(absoluteWeek, day, days, seed);
      const neighbors = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1]
      ];
      const nearWater = !water.isRiver && !water.isPond && neighbors.some(([dw, dd]) => {
        if (day + dd < 0 || day + dd >= days) return false;
        const neighbor = waterAt(absoluteWeek + dw, day + dd, days, seed);
        return neighbor.isRiver || neighbor.isPond;
      });
      map.set(`${week},${day}`, {
        ...water,
        nearWater,
        forestDensity: forestAt(absoluteWeek, day, days, seed)
      });
    }
  }
  return map;
}
var init_biomes = __esm({
  "src/themes/terrain/biomes.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
  }
});

// src/themes/terrain/scene/placements.ts
function assetScenePlacement(placed) {
  const bounds = getAssetCatalogEntry(placed.type).bounds;
  const cx = placed.cx + placed.ox;
  const cy = placed.cy + placed.oy;
  return {
    id: placed.id,
    catalogId: placed.catalogId,
    anchorDate: placed.date ?? "",
    week: placed.cell.week,
    day: placed.cell.day,
    cx,
    cy,
    footprint: { ...bounds, x: cx + bounds.x, y: cy + bounds.y },
    drawOrder: placed.cell.week + placed.cell.day,
    variant: placed.variant,
    animated: placed.animated
  };
}
function gardenPlacements(cells, seed, settings, biomes) {
  return cells.filter((cell) => cell.count === 0).flatMap((cell) => {
    const rng = seededRandom(hash(`${seed}:${cell.date}:garden`));
    if (rng() > 0.28) return [];
    const biome = biomes.get(`${cell.week},${cell.day}`);
    const winter = dateSeasonZone(cell.date, settings.hemisphere) === 0;
    const types = biome?.isRiver || biome?.isPond ? winter ? ["snowCoveredRock"] : ["pondLily", "reeds"] : winter ? ["snowdrift", "bareBush", "snowCoveredRock"] : ["flower", "rock", "bush", "wildflowerPatch"];
    const type = types[Math.floor(rng() * types.length)];
    const bounds = getAssetCatalogEntry(type).bounds;
    const cx = cell.isoX + (rng() - 0.5) * 2;
    const cy = cell.isoY + (rng() - 0.5);
    return [
      {
        id: `garden-${cell.date}`,
        catalogId: type,
        anchorDate: cell.date,
        week: cell.week,
        day: cell.day,
        cx,
        cy,
        footprint: { ...bounds, x: cx + bounds.x, y: cy + bounds.y },
        drawOrder: cell.week + cell.day,
        variant: Math.floor(rng() * 3),
        animated: false,
        decorative: true
      }
    ];
  });
}
var init_placements = __esm({
  "src/themes/terrain/scene/placements.ts"() {
    "use strict";
    init_cjs_shims();
    init_catalog();
    init_math();
    init_season();
  }
});

// src/themes/terrain/assets/rendering.ts
function renderCatalogAsset(type, colors, variant = 0) {
  return ASSET_RENDERERS[type](0, 0, colors, variant);
}
function renderAssetPlacements(placed, palettes) {
  const paletteFor = (week) => {
    if ("assets" in palettes) return palettes;
    return palettes[Math.min(week, palettes.length - 1)];
  };
  const context = currentMotionContext();
  const parts = placed.map((asset) => {
    const palette = paletteFor(asset.cell.week);
    const art = withMotionContext(
      { ...context, mode: asset.animated ? context.mode : "off" },
      () => ASSET_RENDERERS[asset.type](
        asset.cx + asset.ox,
        asset.cy + asset.oy,
        palette.assets,
        asset.variant
      )
    );
    return `<g data-asset-id="${escapeXml(asset.id)}" data-catalog-id="${asset.catalogId}" data-date="${escapeXml(asset.date ?? "")}">${art}</g>`;
  });
  return `<g class="terrain-assets">${parts.join("")}</g>`;
}
function renderAssetCSS() {
  return motionMarkup(
    "@keyframes tree-sway { 0% { transform: rotate(-1.5deg); } 50% { transform: rotate(1.5deg); } 100% { transform: rotate(-1.5deg); } }"
  );
}
var init_rendering2 = __esm({
  "src/themes/terrain/assets/rendering.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_animation();
    init_renderers();
    init_selection();
  }
});

// src/themes/terrain/assets.ts
var init_assets = __esm({
  "src/themes/terrain/assets.ts"() {
    "use strict";
    init_cjs_shims();
    init_level_pool();
    init_richness();
    init_selection();
    init_date_seed();
    init_rendering2();
    init_catalog();
  }
});

// src/themes/terrain/scene/wonders.ts
function wonderScenePlacements(placed, cells, stats) {
  const cellMap = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, cell]));
  return placed.flatMap((wonder) => {
    const cell = cellMap.get(`${wonder.week},${wonder.day}`);
    if (!cell?.date) return [];
    const catalog = getEpicCatalogEntry(wonder.type);
    const gate = TIER_CONFIG[wonder.tier];
    const richness = computeRichness(cell, cellMap);
    const thresholds = [
      {
        metric: "level100",
        required: gate.minLevel,
        current: cell.level100,
        achieved: cell.level100 >= gate.minLevel
      },
      {
        metric: "richness",
        required: gate.minRichness,
        current: richness,
        achieved: richness >= gate.minRichness
      },
      ...getEpicGateThresholds(wonder.tier, stats)
    ];
    return [
      {
        id: `wonder-${cell.date}-${wonder.type}`,
        catalogId: wonder.type,
        anchorDate: cell.date,
        week: cell.week,
        day: cell.day,
        cx: wonder.cx,
        cy: wonder.cy,
        footprint: {
          ...catalog.bounds,
          x: wonder.cx + catalog.bounds.x,
          y: wonder.cy + catalog.bounds.y
        },
        drawOrder: cell.week + cell.day,
        variant: 0,
        animated: true,
        tier: wonder.tier,
        thresholds,
        explanation: `Level ${cell.level100} \u2265 ${gate.minLevel}; neighborhood richness ${richness.toFixed(2)} \u2265 ${gate.minRichness}; ${catalog.gate.statsDescription}. Selected by the deterministic rarity draw, spacing and three-Wonder budget.`
      }
    ];
  });
}
var init_wonders = __esm({
  "src/themes/terrain/scene/wonders.ts"() {
    "use strict";
    init_cjs_shims();
    init_epics();
    init_catalog2();
    init_gates();
    init_assets();
  }
});

// src/themes/terrain/scene/neighborhood.ts
function connector(id, cells, catalogId) {
  const front = [...cells].sort((a, b) => b.week + b.day - a.week - a.day)[0];
  const points = cells.map((cell) => ({ x: cell.isoX + 2, y: cell.isoY + 2 }));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    id,
    catalogId,
    anchorDate: front.date,
    week: front.week,
    day: front.day,
    drawOrder: front.week + front.day,
    points,
    footprint: {
      x: Math.min(...xs) - 2,
      y: Math.min(...ys) - 2,
      width: Math.max(...xs) - Math.min(...xs) + 4,
      height: Math.max(...ys) - Math.min(...ys) + 4
    }
  };
}
function neighborhoodPaths(cells, placements, biomes) {
  const byPosition = new Map(cells.map((cell) => [`${cell.week},${cell.day}`, cell]));
  const byDate = new Map(cells.map((cell) => [cell.date, cell]));
  const residences = placements.filter((placement) => RESIDENCES.has(placement.catalogId) && !placement.decorative).sort((a, b) => a.anchorDate.localeCompare(b.anchorDate) || a.id.localeCompare(b.id));
  const used = /* @__PURE__ */ new Set();
  const paths = [];
  const dry = (cell) => {
    const biome = biomes.get(`${cell.week},${cell.day}`);
    return !biome?.isRiver && !biome?.isPond && !(cell.level100 >= 9 && cell.level100 <= 22);
  };
  for (const residence of residences) {
    if (used.has(residence.id)) continue;
    const origin = byDate.get(residence.anchorDate);
    if (!origin || !dry(origin)) continue;
    const routes = /* @__PURE__ */ new Map([[origin.date, [origin]]]);
    const queue = [origin];
    for (let index = 0; index < queue.length; index++) {
      const current = queue[index];
      const route = routes.get(current.date);
      if (!route || route.length >= 4) continue;
      for (const [dw, dd] of [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1]
      ]) {
        const next = byPosition.get(`${current.week + dw},${current.day + dd}`);
        if (!next || routes.has(next.date) || !dry(next) || Math.abs(current.height - next.height) > 5)
          continue;
        routes.set(next.date, [...route, next]);
        queue.push(next);
      }
    }
    const neighbors = residences.filter(
      (candidate) => candidate.anchorDate !== origin.date && !used.has(candidate.id) && routes.has(candidate.anchorDate)
    ).slice(0, 3);
    if (neighbors.length >= 2) {
      used.add(residence.id);
      for (const neighbor of neighbors) {
        const route = routes.get(neighbor.anchorDate);
        if (!route) continue;
        paths.push(connector(`path-${residence.id}-${neighbor.id}`, route, "neighborhood:path"));
        used.add(neighbor.id);
      }
    }
    if (!biomes.get(`${origin.week},${origin.day}`)?.nearWater) continue;
    const water = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1]
    ].map(([dw, dd]) => byPosition.get(`${origin.week + dw},${origin.day + dd}`)).find(
      (cell) => cell && (biomes.get(`${cell.week},${cell.day}`)?.isRiver || biomes.get(`${cell.week},${cell.day}`)?.isPond)
    );
    if (water && Math.abs(origin.height - water.height) <= 5) {
      paths.push(connector(`deck-${residence.id}`, [origin, water], "neighborhood:deck"));
    }
  }
  return paths.sort((a, b) => a.id.localeCompare(b.id));
}
var RESIDENCES;
var init_neighborhood = __esm({
  "src/themes/terrain/scene/neighborhood.ts"() {
    "use strict";
    init_cjs_shims();
    RESIDENCES = /* @__PURE__ */ new Set([
      "hut",
      "house",
      "houseB",
      "houseWinter",
      "houseBWinter",
      "inn",
      "manor",
      "hanok"
    ]);
  }
});

// src/themes/terrain/scene/bounds.ts
function unionBounds(bounds) {
  if (bounds.length === 0) return { x: 0, y: 0, width: 1, height: 1 };
  const x = Math.min(...bounds.map((item) => item.x));
  const y = Math.min(...bounds.map((item) => item.y));
  return {
    x,
    y,
    width: Math.max(...bounds.map((item) => item.x + item.width)) - x,
    height: Math.max(...bounds.map((item) => item.y + item.height)) - y
  };
}
function sceneBounds(cells, placements, paths) {
  return unionBounds([
    ...cells.map((cell) => ({
      x: cell.isoX - THW - 1,
      y: cell.isoY - THH - 1,
      width: THW * 2 + 2,
      height: THH * 2 + cell.height + 2
    })),
    ...placements.map((placement) => placement.footprint),
    ...paths.map((path) => path.footprint)
  ]);
}
function sceneViewport(layout) {
  return layout === "card" ? { x: 18, y: 82, width: 384, height: 150 } : { x: 315, y: 35, width: 503, height: 175 };
}
function fitScene(bounds, viewport) {
  const scale = Math.min(viewport.width / bounds.width, viewport.height / bounds.height, 1.35);
  return {
    scale,
    x: viewport.x + (viewport.width - bounds.width * scale) / 2 - bounds.x * scale,
    y: viewport.y + (viewport.height - bounds.height * scale) / 2 - bounds.y * scale
  };
}
var init_bounds3 = __esm({
  "src/themes/terrain/scene/bounds.ts"() {
    "use strict";
    init_cjs_shims();
    init_projection();
  }
});

// src/themes/terrain/scene/prepare.ts
function prepareTerrainScene(data, options = {}) {
  const { width: _width, height: _height, namespace: _namespace, ...inputSettings } = options;
  const settings = resolveRenderSettings(inputSettings, {}, data.username);
  const grid = contributionGrid(data, { cellSize: 1, gap: 0, offsetX: 0, offsetY: 0 });
  for (const cell of grid) {
    if (!Number.isInteger(cell.count) || cell.count < 0 || !Number.isInteger(cell.level) || cell.level < 0 || cell.level > 4) {
      throw new InputValidationError([
        {
          path: `days.${cell.date}`,
          message: "Expected a nonnegative integer count and level 0\u20134"
        }
      ]);
    }
  }
  const stats = computeStats(data.weeks);
  const maxCount = settings.normalization.kind === "fixed" ? settings.normalization.maxCount : computeP90Max(grid.map((cell) => cell.count));
  const enriched = enrichGridCells100(grid, data, { kind: "fixed", maxCount });
  const isoCells = toIsoCells(enriched, getTerrainPalette100("light"), 0, 0);
  const cells = isoCells.map((cell) => {
    if (cell.date === void 0 || cell.count === void 0 || cell.absoluteWeek === void 0) {
      throw new InputValidationError([
        { path: "cells", message: "Expected date-positioned contribution cells" }
      ]);
    }
    return {
      date: cell.date,
      count: cell.count,
      week: cell.week,
      day: cell.day,
      absoluteWeek: cell.absoluteWeek,
      level100: cell.level100,
      height: cell.height,
      isoX: cell.isoX,
      isoY: cell.isoY
    };
  });
  const root = `layout-v1:${data.username.trim().toLowerCase()}:${settings.layoutSeed ?? ""}`;
  const seed = hash(root);
  const firstAbsoluteWeek = Math.min(...cells.map((cell) => cell.absoluteWeek));
  const weekCount = cells.length ? Math.max(...cells.map((cell) => cell.week)) + 1 : 0;
  const biomeMap = generateBiomeMap(weekCount, 7, hash(`${root}:biome`), firstAbsoluteWeek);
  const epics = selectEpicBuildings(isoCells, hash(`${root}:wonder`), stats, biomeMap);
  const wonders = wonderScenePlacements(epics.placed, isoCells, stats);
  const selected = selectAssetPlacements(isoCells, seed, {
    variantSeed: hash(`${root}:variant`),
    biomeMap,
    hemisphere: settings.hemisphere,
    density: settings.density,
    excludeCells: epics.epicCells,
    villageStyle: settings.style
  });
  const placements = [
    ...selected.filter((asset) => asset.cell.count !== 0).map(assetScenePlacement),
    ...gardenPlacements(cells, seed, settings, biomeMap)
  ].sort((a, b) => a.id.localeCompare(b.id));
  const paths = neighborhoodPaths(cells, placements, biomeMap);
  return {
    schemaVersion: 1,
    layoutVersion: 1,
    username: data.username,
    year: data.year,
    fromDate: stats.fromDate,
    toDate: stats.toDate,
    settings,
    normalization: {
      kind: settings.normalization.kind,
      maxCount,
      source: settings.normalization.kind === "fixed" ? "explicit-fixed" : "relative-p90"
    },
    stats,
    seed: { root, policy: "username-date-v1" },
    cells,
    biomes: cells.flatMap((cell) => {
      const biome = biomeMap.get(`${cell.week},${cell.day}`);
      return biome ? [{ week: cell.week, day: cell.day, biome }] : [];
    }),
    placements,
    wonders,
    neighborhoodPaths: paths,
    bounds: sceneBounds(cells, [...placements, ...wonders], paths)
  };
}
var init_prepare = __esm({
  "src/themes/terrain/scene/prepare.ts"() {
    "use strict";
    init_cjs_shims();
    init_stats();
    init_errors();
    init_resolve();
    init_normalization();
    init_shared();
    init_palette();
    init_blocks();
    init_selection();
    init_epics();
    init_biomes();
    init_math();
    init_placements();
    init_wonders();
    init_neighborhood();
    init_bounds3();
  }
});

// src/themes/terrain/motion/index.ts
function renderMotionBranches(context, renderBranch) {
  if (context.mode === "off") return withMotionContext(context, renderBranch);
  const rootId = withMotionContext(context, () => motionId("motion"));
  const staticScene = withMotionContext(
    { mode: "off", namespace: `${context.namespace}-static` },
    renderBranch
  );
  const activeScene = withMotionContext(
    { mode: context.mode, namespace: `${context.namespace}-active` },
    renderBranch
  );
  const staticSelector = `#${rootId} > [data-motion-branch="static"]`;
  const activeSelector = `#${rootId} > [data-motion-branch="active"]`;
  const css = `${staticSelector} * { animation: none !important; }@media (prefers-reduced-motion: no-preference) {${staticSelector} { display: none; }${activeSelector} { display: inline; }}`;
  return `<g id="${rootId}" data-motion="${context.mode}"><style>${css}</style><g data-motion-branch="static">${staticScene}</g><g data-motion-branch="active" display="none">${activeScene}</g></g>`;
}
var init_motion = __esm({
  "src/themes/terrain/motion/index.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
  }
});

// src/themes/terrain/effects/selection.ts
function selectEvenly(items, max) {
  if (items.length <= max) return items;
  const step = items.length / max;
  const result = [];
  for (let i = 0; i < max; i++) {
    result.push(items[Math.floor(i * step)]);
  }
  return result;
}
var init_selection3 = __esm({
  "src/themes/terrain/effects/selection.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/effects/css.ts
function renderTerrainCSS(isoCells, biomeMap) {
  const mode = currentMotionContext().mode;
  if (mode === "off") return "";
  const blocks = [];
  const waterCount = isoCells.filter((cell) => cell.level100 >= 10 && cell.level100 <= 22).length;
  const maxWater = mode === "subtle" ? 4 : MAX_WATER;
  const maxRiver = mode === "subtle" ? Math.max(0, 4 - waterCount) : 8;
  if (mode === "subtle") {
    for (let index = 0; index < Math.min(waterCount, maxWater); index++) {
      blocks.push(
        `.${motionId("water-" + index)} { animation: subtle-water 8s ease-in-out infinite; }`
      );
    }
    const riverCount = isoCells.filter((cell) => {
      const biome = biomeMap?.get(`${cell.week},${cell.day}`);
      return cell.level100 > 22 && (biome?.isRiver || biome?.isPond);
    }).length;
    for (let index = 0; index < Math.min(riverCount, maxRiver); index++) {
      blocks.push(
        `.${motionId("river-shimmer-" + index)} { animation: subtle-water 10s ease-in-out infinite; }`
      );
    }
    if (blocks.length > 0)
      blocks.unshift(
        "@keyframes subtle-water { 0%,100% { opacity: 0.16; } 50% { opacity: 0.20; } }"
      );
    return blocks.join("\n");
  }
  const hasWater = isoCells.some((c) => c.level100 >= 10 && c.level100 <= 22);
  const hasTown = isoCells.some((c) => c.level100 >= 90);
  if (hasWater) {
    blocks.push(
      `@keyframes water-shimmer { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }`
    );
    const waterCells = isoCells.filter((c) => c.level100 >= 10 && c.level100 <= 22);
    const selected = selectEvenly(waterCells, MAX_WATER);
    for (let i = 0; i < selected.length; i++) {
      const dur = (3 + i % 3 * 0.8).toFixed(1);
      const delay = (i * 0.7 % 4).toFixed(1);
      blocks.push(
        `.${motionId("water-" + i)} { animation: water-shimmer ${dur}s ease-in-out ${delay}s infinite; }`
      );
    }
  }
  if (hasTown) {
    blocks.push(
      `@keyframes town-sparkle { 0% { opacity: 1; } 40% { opacity: 0.5; } 100% { opacity: 1; } }`
    );
    const townCells = isoCells.filter((c) => c.level100 >= 90);
    const selected = selectEvenly(townCells, MAX_SPARKLE);
    for (let i = 0; i < selected.length; i++) {
      const dur = (2 + i % 4 * 0.5).toFixed(1);
      const delay = (i * 0.9 % 3.5).toFixed(1);
      blocks.push(
        `.${motionId("sparkle-" + i)} { animation: town-sparkle ${dur}s ease-in-out ${delay}s infinite; }`
      );
    }
  }
  if (biomeMap) {
    const riverCells = isoCells.filter((c) => {
      const biome = biomeMap.get(`${c.week},${c.day}`);
      return biome && (biome.isRiver || biome.isPond) && c.level100 > 22;
    });
    const selectedRiver = selectEvenly(riverCells, 8);
    if (selectedRiver.length > 0) {
      if (!hasWater) {
        blocks.push(
          `@keyframes water-shimmer { 0% { opacity: 0.7; } 50% { opacity: 1; } 100% { opacity: 0.7; } }`
        );
      }
      for (let i = 0; i < selectedRiver.length; i++) {
        const dur = (3.5 + i % 3 * 0.6).toFixed(1);
        const delay = (i * 0.8 % 3.5).toFixed(1);
        blocks.push(
          `.${motionId("river-shimmer-" + i)} { animation: water-shimmer ${dur}s ease-in-out ${delay}s infinite; }`
        );
      }
    }
  }
  blocks.push(
    `@keyframes flag-wave { 0% { transform: scaleX(1); } 50% { transform: scaleX(0.7); } 100% { transform: scaleX(1); } }`
  );
  blocks.push(
    `@keyframes sway-gentle { 0% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } 100% { transform: rotate(-2deg); } }`
  );
  blocks.push(
    `.sway-gentle { animation: sway-gentle 3s ease-in-out infinite; transform-origin: bottom center; }`
  );
  blocks.push(
    `@keyframes sway-slow { 0% { transform: rotate(-1deg); } 50% { transform: rotate(1deg); } 100% { transform: rotate(-1deg); } }`
  );
  blocks.push(
    `.sway-slow { animation: sway-slow 4s ease-in-out infinite; transform-origin: bottom center; }`
  );
  return blocks.join("\n");
}
var MAX_WATER, MAX_SPARKLE;
var init_css = __esm({
  "src/themes/terrain/effects/css.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
    init_selection3();
    MAX_WATER = 15;
    MAX_SPARKLE = 10;
  }
});

// src/themes/terrain/effects/overlays.ts
function renderAnimatedOverlays(isoCells, palette) {
  const overlays = [];
  const mode = currentMotionContext().mode;
  const waterCells = isoCells.filter((c) => c.level100 >= 10 && c.level100 <= 22);
  const selectedWater = selectEvenly(waterCells, MAX_WATER2);
  for (let i = 0; i < selectedWater.length; i++) {
    const cell = selectedWater[i];
    const { isoX: cx, isoY: cy } = cell;
    const points = [
      `${cx},${cy - THH + 1}`,
      `${cx + THW - 2},${cy}`,
      `${cx},${cy + THH - 1}`,
      `${cx - THW + 2},${cy}`
    ].join(" ");
    overlays.push(
      `<polygon points="${points}" fill="${palette.text.accent}" opacity="0.15" class="${motionId("water-" + i)}"/>`
    );
  }
  const townCells = isoCells.filter((c) => c.level100 >= 90);
  const selectedTown = selectEvenly(townCells, MAX_SPARKLE2);
  for (let i = 0; i < selectedTown.length; i++) {
    const cell = selectedTown[i];
    const { isoX: cx, isoY: cy, height: h } = cell;
    overlays.push(
      `<circle cx="${cx}" cy="${cy - h - 1}" r="1" fill="#ffe080" opacity="0.7" ${mode === "full" ? `class="${motionId("sparkle-" + i)}"` : ""}/>`
    );
  }
  return `<g class="terrain-overlays">${overlays.join("")}</g>`;
}
var MAX_WATER2, MAX_SPARKLE2;
var init_overlays = __esm({
  "src/themes/terrain/effects/overlays.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
    init_blocks();
    init_selection3();
    MAX_WATER2 = 15;
    MAX_SPARKLE2 = 10;
  }
});

// src/themes/terrain/effects/sky.ts
function renderCelestials(seed, palette, isDark) {
  const rng = seededRandom(seed + 3331);
  const parts = [];
  if (isDark) {
    const numStars = 18 + Math.floor(rng() * 10);
    for (let i = 0; i < numStars; i++) {
      const sx = 30 + rng() * 780;
      const sy = 5 + rng() * 55;
      const sr = 0.3 + rng() * 0.6;
      const opacity = 0.3 + rng() * 0.5;
      parts.push(
        `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr.toFixed(1)}" fill="#fff" opacity="${opacity.toFixed(2)}"/>`
      );
    }
    for (let i = 0; i < 3; i++) {
      const bx = 60 + rng() * 720;
      const by = 8 + rng() * 40;
      const len = 1.2 + rng() * 0.8;
      parts.push(
        `<g opacity="${(0.5 + rng() * 0.3).toFixed(2)}"><line x1="${bx - len}" y1="${by}" x2="${bx + len}" y2="${by}" stroke="#fff" stroke-width="0.4"/><line x1="${bx}" y1="${by - len}" x2="${bx}" y2="${by + len}" stroke="#fff" stroke-width="0.4"/></g>`
      );
    }
    const mx = 750 + rng() * 60;
    const my = 18 + rng() * 15;
    const mr = 8;
    parts.push(
      `<g><circle cx="${mx}" cy="${my}" r="${mr}" fill="#e8e4d0" opacity="0.85"/><circle cx="${mx + 3.5}" cy="${my - 1.5}" r="${mr - 0.5}" fill="${palette.bg.subtle}"/><circle cx="${mx}" cy="${my}" r="${mr + 3}" fill="#e8e4d0" opacity="0.04"/></g>`
    );
  } else {
    const sx = 770 + rng() * 50;
    const sy = 20 + rng() * 12;
    const sr = 7;
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr + 6}" fill="#ffeebb" opacity="0.1"/>`);
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr + 3}" fill="#ffdd88" opacity="0.15"/>`);
    parts.push(`<circle cx="${sx}" cy="${sy}" r="${sr}" fill="#ffe066" opacity="0.9"/>`);
    parts.push(
      `<circle cx="${sx - 1.5}" cy="${sy - 1.5}" r="${sr * 0.45}" fill="#fff8cc" opacity="0.6"/>`
    );
    for (let r = 0; r < 8; r++) {
      const angle = r / 8 * Math.PI * 2;
      const innerR = sr + 2;
      const outerR = sr + 5 + r % 2 * 2;
      const x1 = sx + Math.cos(angle) * innerR;
      const y1 = sy + Math.sin(angle) * innerR;
      const x2 = sx + Math.cos(angle) * outerR;
      const y2 = sy + Math.sin(angle) * outerR;
      parts.push(
        `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#ffdd66" stroke-width="0.8" opacity="0.5" stroke-linecap="round"/>`
      );
    }
  }
  return `<g class="celestials">${parts.join("")}</g>`;
}
function renderClouds(seed, palette) {
  const rng = seededRandom(seed);
  const clouds = [];
  const mode = currentMotionContext().mode;
  for (let i = 0; i < NUM_CLOUDS; i++) {
    const baseCx = 250 + rng() * 500;
    const baseCy = 20 + rng() * 60;
    const scale = 0.8 + rng() * 0.5;
    const fullDuration = (35 + rng() * 20).toFixed(0);
    const dur = mode === "subtle" ? String(Number(fullDuration) * 2) : fullDuration;
    const fullDrift = 60 + rng() * 50;
    const driftX = mode === "subtle" ? Math.min(12, fullDrift / 8) : fullDrift;
    const ellipses = [];
    const f = palette.cloud.fill;
    const s = palette.cloud.stroke;
    const o = palette.cloud.opacity;
    ellipses.push(
      `<ellipse cx="${baseCx}" cy="${baseCy}" rx="${(28 * scale).toFixed(1)}" ry="${(5 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.4" opacity="${o}"/>`
    );
    ellipses.push(
      `<ellipse cx="${(baseCx - 14 * scale).toFixed(1)}" cy="${(baseCy - 3 * scale).toFixed(1)}" rx="${(12 * scale).toFixed(1)}" ry="${(6 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`
    );
    ellipses.push(
      `<ellipse cx="${(baseCx - 2 * scale).toFixed(1)}" cy="${(baseCy - 6 * scale).toFixed(1)}" rx="${(14 * scale).toFixed(1)}" ry="${(8 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`
    );
    ellipses.push(
      `<ellipse cx="${(baseCx + 12 * scale).toFixed(1)}" cy="${(baseCy - 3.5 * scale).toFixed(1)}" rx="${(11 * scale).toFixed(1)}" ry="${(5.5 * scale).toFixed(1)}" fill="${f}" stroke="${s}" stroke-width="0.3" opacity="${o}"/>`
    );
    ellipses.push(
      `<ellipse cx="${(baseCx - 4 * scale).toFixed(1)}" cy="${(baseCy - 9 * scale).toFixed(1)}" rx="${(7 * scale).toFixed(1)}" ry="${(4 * scale).toFixed(1)}" fill="${f}" stroke="none" opacity="${(o * 0.7).toFixed(2)}"/>`
    );
    clouds.push(
      `<g>` + ellipses.join("") + (mode === "off" ? "" : `<animateTransform attributeName="transform" type="translate" values="0,0;${driftX.toFixed(0)},0;0,0" dur="${dur}s" repeatCount="indefinite"/>`) + `</g>`
    );
  }
  return `<g class="terrain-clouds">${clouds.join("")}</g>`;
}
var NUM_CLOUDS;
var init_sky = __esm({
  "src/themes/terrain/effects/sky.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
    init_math();
    NUM_CLOUDS = 2;
  }
});

// src/themes/terrain/effects/water.ts
function renderWaterOverlays(isoCells, palette, biomeMap) {
  const overlays = [];
  let shimmerIdx = 0;
  const mode = currentMotionContext().mode;
  const naturalWaterCount = isoCells.filter(
    (cell) => cell.level100 >= 10 && cell.level100 <= 22
  ).length;
  const maxShimmer = mode === "subtle" ? Math.max(0, 4 - naturalWaterCount) : 8;
  for (const cell of isoCells) {
    const biome = biomeMap.get(`${cell.week},${cell.day}`);
    if (!biome || !biome.isRiver && !biome.isPond) continue;
    const { isoX: cx, isoY: cy } = cell;
    const color = biome.isPond ? palette.assets.pondOverlay : palette.assets.riverOverlay;
    const outerPoints = [
      `${cx},${cy - THH + 0.5}`,
      `${cx + THW - 1},${cy}`,
      `${cx},${cy + THH - 0.5}`,
      `${cx - THW + 1},${cy}`
    ].join(" ");
    const innerInset = 2.2;
    const innerPoints = [
      `${cx},${cy - THH + innerInset}`,
      `${cx + THW - innerInset * 1.2},${cy}`,
      `${cx},${cy + THH - innerInset}`,
      `${cx - THW + innerInset * 1.2},${cy}`
    ].join(" ");
    const shimmerClass = mode !== "off" && cell.level100 > 22 && shimmerIdx < maxShimmer ? ` class="${motionId("river-shimmer-" + shimmerIdx++)}"` : "";
    overlays.push(
      `<polygon points="${outerPoints}" fill="${color}"${mode === "full" ? shimmerClass : ""}/>`
    );
    overlays.push(
      `<polygon points="${innerPoints}" fill="${palette.assets.waterLight}" opacity="0.18"${mode === "subtle" ? shimmerClass : ""}/>`
    );
  }
  return overlays.length > 0 ? `<g class="water-overlays">${overlays.join("")}</g>` : "";
}
function renderWaterRipples(isoCells, palette, biomeMap) {
  const ripples = [];
  const color = palette.assets.waterLight;
  const rng = seededRandom(isoCells.length * 7 + 31);
  for (const cell of isoCells) {
    const biome = biomeMap.get(`${cell.week},${cell.day}`);
    if (!biome || !biome.isRiver && !biome.isPond) continue;
    const { isoX: cx, isoY: cy } = cell;
    const jitterX = (rng() - 0.5) * 2;
    const jitterY = (rng() - 0.5) * 0.8;
    const amp1 = 0.3 + rng() * 0.15;
    ripples.push(
      `<path d="M${cx - THW * 0.55 + jitterX},${cy - THH * 0.05 + jitterY} Q${cx - THW * 0.1},${cy - THH * amp1} ${cx + THW * 0.4},${cy - THH * 0.12}" stroke="${color}" fill="none" stroke-width="0.25" opacity="0.28"/>`
    );
    const amp2 = 0.15 + rng() * 0.2;
    ripples.push(
      `<path d="M${cx - THW * 0.35 + jitterX * 0.5},${cy + THH * 0.15 + jitterY} Q${cx + THW * 0.05},${cy - THH * amp2} ${cx + THW * 0.45},${cy + THH * 0.05}" stroke="${color}" fill="none" stroke-width="0.2" opacity="0.22"/>`
    );
    const amp3 = 0.1 + rng() * 0.12;
    ripples.push(
      `<path d="M${cx - THW * 0.2 + jitterX * 0.3},${cy + THH * 0.35 + jitterY} Q${cx + THW * 0.15},${cy + THH * amp3} ${cx + THW * 0.35},${cy + THH * 0.28}" stroke="${color}" fill="none" stroke-width="0.2" opacity="0.18"/>`
    );
  }
  return ripples.length > 0 ? `<g class="water-ripples">${ripples.join("")}</g>` : "";
}
var init_water = __esm({
  "src/themes/terrain/effects/water.ts"() {
    "use strict";
    init_cjs_shims();
    init_animation();
    init_blocks();
    init_math();
  }
});

// src/themes/terrain/effects/particles.ts
function renderSnowParticles(isoCells, seed, seasonRotation = 0) {
  const rng = seededRandom(seed + 9991);
  const particles = [];
  const maxParticles = 40;
  let count = 0;
  const winterCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 0 || zone === 1 || zone === 7;
  });
  if (winterCells.length === 0) return "";
  const selected = selectEvenly(winterCells, maxParticles);
  for (const cell of selected) {
    if (count >= maxParticles) break;
    const zone = getSeasonZone(cell.week, seasonRotation);
    const density = zone === 0 ? 0.8 : 0.4;
    if (rng() > density) continue;
    const px = cell.isoX + (rng() - 0.5) * 10;
    const py = cell.isoY - cell.height - 5 - rng() * 20;
    const r = 0.3 + rng() * 0.4;
    const opacity = 0.3 + rng() * 0.4;
    particles.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${opacity.toFixed(2)}"/>`
    );
    count++;
  }
  return particles.length > 0 ? `<g class="snow-particles">${particles.join("")}</g>` : "";
}
function renderFallingPetals(isoCells, seed, palette, seasonRotation = 0) {
  const rng = seededRandom(seed + 7771);
  const petals = [];
  const maxPetals = 30;
  let count = 0;
  const petalColor = palette.assets.cherryPetalPink || "#f5a0b8";
  const springCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 2 || zone === 1 || zone === 3;
  });
  if (springCells.length === 0) return "";
  const selected = selectEvenly(springCells, maxPetals);
  for (const cell of selected) {
    if (count >= maxPetals) break;
    const zone = getSeasonZone(cell.week, seasonRotation);
    const density = zone === 2 ? 0.7 : 0.35;
    if (rng() > density) continue;
    const px = cell.isoX + (rng() - 0.5) * 8;
    const py = cell.isoY - cell.height - 3 - rng() * 15;
    const rx = 0.3 + rng() * 0.2;
    const ry = 0.12 + rng() * 0.08;
    const rotation = Math.floor(rng() * 180);
    const opacity = 0.35 + rng() * 0.3;
    petals.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(2)}" fill="${petalColor}" opacity="${opacity.toFixed(2)}" transform="rotate(${rotation},${px.toFixed(1)},${py.toFixed(1)})"/>`
    );
    count++;
  }
  return petals.length > 0 ? `<g class="falling-petals">${petals.join("")}</g>` : "";
}
function renderFallingLeaves(isoCells, seed, palette, seasonRotation = 0) {
  const rng = seededRandom(seed + 5551);
  const leaves = [];
  const maxLeaves = 30;
  let count = 0;
  const leafColors = [
    palette.assets.fallenLeafRed || "#c04030",
    palette.assets.fallenLeafOrange || "#d08030",
    palette.assets.fallenLeafGold || "#d0a030",
    palette.assets.mapleRed || "#c83020",
    palette.assets.oakGold || "#c8a030"
  ];
  const autumnCells = isoCells.filter((c) => {
    const zone = getSeasonZone(c.week, seasonRotation);
    return zone === 6 || zone === 5 || zone === 7;
  });
  if (autumnCells.length === 0) return "";
  const selected = selectEvenly(autumnCells, maxLeaves);
  for (const cell of selected) {
    if (count >= maxLeaves) break;
    const zone = getSeasonZone(cell.week, seasonRotation);
    const density = zone === 6 ? 0.7 : 0.35;
    if (rng() > density) continue;
    const px = cell.isoX + (rng() - 0.5) * 8;
    const py = cell.isoY - cell.height - 2 - rng() * 12;
    const rx = 0.4 + rng() * 0.3;
    const ry = 0.15 + rng() * 0.1;
    const rotation = Math.floor(rng() * 360);
    const opacity = 0.4 + rng() * 0.3;
    const color = leafColors[Math.floor(rng() * leafColors.length)];
    leaves.push(
      `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(2)}" fill="${color}" opacity="${opacity.toFixed(2)}" transform="rotate(${rotation},${px.toFixed(1)},${py.toFixed(1)})"/>`
    );
    count++;
  }
  return leaves.length > 0 ? `<g class="falling-leaves">${leaves.join("")}</g>` : "";
}
var init_particles = __esm({
  "src/themes/terrain/effects/particles.ts"() {
    "use strict";
    init_cjs_shims();
    init_math();
    init_seasons();
    init_selection3();
  }
});

// src/themes/terrain/effects.ts
var init_effects = __esm({
  "src/themes/terrain/effects.ts"() {
    "use strict";
    init_cjs_shims();
    init_css();
    init_overlays();
    init_sky();
    init_water();
    init_particles();
  }
});

// src/themes/terrain/scene/depth.ts
function sceneDrawList(scene) {
  const items = [
    ...scene.placements.map((value) => ({ kind: "asset", value })),
    ...scene.wonders.map((value) => ({ kind: "wonder", value })),
    ...scene.neighborhoodPaths.map((value) => ({ kind: "path", value }))
  ];
  return items.sort(
    (a, b) => a.value.drawOrder - b.value.drawOrder || a.value.week - b.value.week || a.value.day - b.value.day || (a.kind === "path" ? 0 : 1) - (b.kind === "path" ? 0 : 1) || a.value.id.localeCompare(b.value.id)
  );
}
function renderDrawable(item, cells, palettes) {
  const value = item.value;
  const palette = palettes[value.week];
  switch (item.kind) {
    case "path": {
      const deck = value.catalogId === "neighborhood:deck";
      return svgElement("polyline", {
        points: item.value.points.map((point) => `${point.x},${point.y}`).join(" "),
        fill: "none",
        stroke: deck ? palette.assets.driftwood : palette.text.secondary,
        "stroke-width": deck ? 3.2 : 1.4,
        "stroke-linecap": "round",
        ...deck ? {} : { "stroke-dasharray": "1.3 1.1" },
        opacity: deck ? 0.85 : 0.65
      });
    }
    case "asset": {
      const cell = cells.get(item.value.anchorDate);
      if (!cell || !isAssetType(item.value.catalogId)) return "";
      return renderAssetPlacements(
        [
          {
            id: item.value.id,
            date: item.value.anchorDate,
            type: item.value.catalogId,
            catalogId: item.value.catalogId,
            cell,
            cx: item.value.cx,
            cy: item.value.cy,
            ox: 0,
            oy: 0,
            variant: item.value.variant,
            animated: item.value.animated
          }
        ],
        palettes
      );
    }
    case "wonder":
      if (!isEpicBuildingType(item.value.catalogId)) return "";
      return renderEpicBuildings(
        [
          {
            id: item.value.id,
            date: item.value.anchorDate,
            catalogId: item.value.catalogId,
            type: item.value.catalogId,
            tier: item.value.tier,
            week: item.value.week,
            day: item.value.day,
            cx: item.value.cx,
            cy: item.value.cy
          }
        ],
        palettes
      );
    default: {
      const exhaustive = item;
      return exhaustive;
    }
  }
}
function renderDepthLayer(scene, isoCells, palettes) {
  const cells = new Map(
    isoCells.flatMap((cell) => cell.date ? [[cell.date, cell]] : [])
  );
  return `<g class="terrain-assets terrain-drawables">${sceneDrawList(scene).map(
    (item) => `<g data-placement-id="${escapeXml(item.value.id)}" data-catalog-id="${escapeXml(item.value.catalogId)}" data-anchor-date="${item.value.anchorDate}" data-draw-order="${item.value.drawOrder}"` + (item.kind === "asset" && item.value.decorative ? ' data-decorative="true"' : "") + `>${renderDrawable(item, cells, palettes)}</g>`
  ).join("")}</g>`;
}
var init_depth = __esm({
  "src/themes/terrain/scene/depth.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_catalog();
    init_rendering2();
    init_catalog2();
    init_epics();
  }
});

// src/themes/terrain/scene/calendar-timeline.ts
function seasonForMonth(month, hemisphere) {
  const northernIndex = Math.floor(month % 12 / 3);
  const index = hemisphere === "south" ? (northernIndex + 2) % 4 : northernIndex;
  return SEASON_NAMES[index] ?? "Winter";
}
function cueForCell(cell, hemisphere) {
  const month = cell.date.slice(0, 7);
  const monthNumber = Number(cell.date.slice(5, 7));
  return {
    date: cell.date,
    month,
    monthName: MONTH_NAMES2[monthNumber - 1] ?? month,
    season: seasonForMonth(monthNumber, hemisphere),
    position: cell.week + cell.day / 7
  };
}
function deriveCalendarCues(cells, hemisphere) {
  const firstByMonth = /* @__PURE__ */ new Map();
  for (const cell of cells) {
    const month = cell.date.slice(0, 7);
    const existing = firstByMonth.get(month);
    if (!existing || cell.date < existing.date) firstByMonth.set(month, cell);
  }
  return [...firstByMonth.values()].sort((left, right) => left.date.localeCompare(right.date)).map((cell) => cueForCell(cell, hemisphere));
}
function geometry(layout) {
  return layout === "card" ? { x: 24, width: 372, lineY: 67, labelY: 62, maximumCues: 5 } : { x: 315, width: 503, lineY: 21, labelY: 14, maximumCues: 6 };
}
function labelsOverlap(left, right) {
  return left.x + left.labelWidth / 2 + 4 > right.x - right.labelWidth / 2;
}
function samplePositionedCues(cues, maximum) {
  if (cues.length <= maximum) return cues;
  const sampled = [];
  for (let index = 0; index < maximum; index++) {
    const cue = cues[Math.round(index * (cues.length - 1) / (maximum - 1))];
    if (cue && sampled.at(-1)?.month !== cue.month) sampled.push(cue);
  }
  return sampled;
}
function positionCalendarCues(scene, layout) {
  const cues = deriveCalendarCues(scene.cells, scene.settings.hemisphere);
  if (cues.length === 0) return [];
  let firstPosition = Number.POSITIVE_INFINITY;
  let lastPosition = Number.NEGATIVE_INFINITY;
  for (const cell of scene.cells) {
    const position = cell.week + cell.day / 7;
    firstPosition = Math.min(firstPosition, position);
    lastPosition = Math.max(lastPosition, position);
  }
  const inset = 28;
  const usableWidth = layout.width - inset * 2;
  const fontSize = scene.settings.layout === "card" ? 7 : 8;
  const positioned = cues.map((cue) => {
    const ratio = lastPosition === firstPosition ? 0.5 : (cue.position - firstPosition) / (lastPosition - firstPosition);
    const label = `${cue.monthName} \xB7 ${cue.season}`;
    return {
      ...cue,
      label,
      labelWidth: label.length * fontSize * 0.52,
      x: layout.x + inset + usableWidth * ratio
    };
  });
  const seasonal = positioned.filter(
    (cue, index) => index === 0 || cue.season !== positioned[index - 1]?.season
  );
  const finalCue = positioned.at(-1);
  if (finalCue && seasonal.at(-1)?.month !== finalCue.month) seasonal.push(finalCue);
  const candidates = samplePositionedCues(seasonal, layout.maximumCues);
  const first = candidates[0];
  const last = candidates.at(-1);
  if (!first || !last || first.month === last.month) return first ? [first] : [];
  const selected = [first];
  for (const cue of candidates.slice(1, -1)) {
    const previous = selected.at(-1);
    if (previous && !labelsOverlap(previous, cue)) selected.push(cue);
  }
  while (selected.length > 1) {
    const previous = selected.at(-1);
    if (!previous || !labelsOverlap(previous, last)) break;
    selected.pop();
  }
  selected.push(last);
  return selected;
}
function renderCalendarTimeline(scene, palette) {
  const layout = geometry(scene.settings.layout);
  const cues = positionCalendarCues(scene, layout);
  const label = scene.fromDate ? `Calendar timeline from ${scene.fromDate} to ${scene.toDate}. Month and season cues follow supplied contribution dates.` : "Calendar timeline. No dates supplied.";
  const line = svgElement("line", {
    x1: layout.x,
    y1: layout.lineY,
    x2: layout.x + layout.width,
    y2: layout.lineY,
    stroke: palette.text.secondary,
    "stroke-opacity": 0.45,
    "stroke-width": 0.8
  });
  if (cues.length === 0) {
    return svgElement(
      "g",
      { class: "calendar-timeline", role: "group", "aria-label": label },
      line + svgText(layout.x + layout.width / 2, layout.labelY, "No dates supplied", {
        "font-family": FONT,
        "font-size": 8,
        "text-anchor": "middle",
        fill: palette.text.secondary
      })
    );
  }
  const markers = cues.map((cue) => {
    return svgElement(
      "g",
      {
        class: "calendar-cue",
        transform: `translate(${svgNumber(cue.x)} 0)`,
        "data-date": cue.date,
        "data-month": cue.month,
        "data-season": cue.season,
        role: "img",
        "aria-label": `${cue.month}, ${cue.season}; first supplied date ${cue.date}`
      },
      svgElement("circle", {
        cx: 0,
        cy: layout.lineY,
        r: 2.2,
        fill: palette.text.accent,
        stroke: palette.text.primary,
        "stroke-width": 0.6
      }) + svgText(0, layout.labelY, cue.label, {
        "font-family": FONT,
        "font-size": scene.settings.layout === "card" ? 7 : 8,
        "text-anchor": "middle",
        fill: palette.text.secondary
      })
    );
  }).join("");
  return svgElement(
    "g",
    { class: "calendar-timeline", role: "group", "aria-label": label },
    line + markers
  );
}
var FONT, MONTH_NAMES2, SEASON_NAMES;
var init_calendar_timeline = __esm({
  "src/themes/terrain/scene/calendar-timeline.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    FONT = "'Segoe UI', system-ui, sans-serif";
    MONTH_NAMES2 = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec"
    ];
    SEASON_NAMES = ["Winter", "Spring", "Summer", "Autumn"];
  }
});

// src/themes/terrain/scene/legend.ts
function scaleName(scene) {
  return scene.normalization.kind === "fixed" ? "Fixed scale" : "Relative P90 scale";
}
function renderSwatches(palette, layout) {
  const card = layout === "card";
  const startX = 24;
  const y = card ? 327 : 69;
  const width = card ? 64 : 34;
  const gap = card ? 13 : 5;
  const labelY = card ? 354 : 94;
  return LEGEND_BINS.map((bin, index) => {
    const x = startX + index * (width + gap);
    return svgElement("rect", {
      class: "height-legend-swatch",
      x,
      y,
      width,
      height: card ? 11 : 10,
      rx: 2,
      fill: palette.getElevation(bin.level).top,
      stroke: palette.text.secondary,
      "stroke-opacity": 0.38,
      "stroke-width": 0.6,
      "data-level": bin.level,
      "data-bin": bin.label.toLowerCase(),
      role: "img",
      "aria-label": `${bin.label} contribution height; representative elevation ${bin.level} of 99`
    }) + svgText(x + width / 2, labelY, bin.label, {
      "font-family": FONT2,
      "font-size": card ? 9 : 8,
      "text-anchor": "middle",
      fill: palette.text.secondary
    });
  }).join("");
}
function renderHeightLegend(scene, palette) {
  const card = scene.settings.layout === "card";
  const scale = scaleName(scene);
  const maximum = formatNumber(scene.normalization.maxCount);
  const ariaLabel = `Contribution height legend. ${scale} from 0 to ${maximum} contributions. Five palette bins from low to high.`;
  const heading = card ? `Height \xB7 Low \u2192 High \xB7 ${scale} 0\u2013${maximum}` : "Contribution height \xB7 Low \u2192 High";
  const visibleScale = `${scale} \xB7 0\u2013${maximum} contributions`;
  return svgElement(
    "g",
    { class: "height-legend", role: "group", "aria-label": ariaLabel },
    svgText(24, card ? 318 : 59, heading, {
      "font-family": FONT2,
      "font-size": card ? 10 : 11,
      "font-weight": 600,
      fill: palette.text.primary
    }) + renderSwatches(palette, scene.settings.layout) + (card ? "" : svgText(24, 111, visibleScale, {
      "font-family": FONT2,
      "font-size": 9,
      fill: palette.text.secondary
    }))
  );
}
var FONT2, LEGEND_BINS;
var init_legend = __esm({
  "src/themes/terrain/scene/legend.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    FONT2 = "'Segoe UI', system-ui, sans-serif";
    LEGEND_BINS = [
      { label: "Empty", level: 0 },
      { label: "Low", level: 20 },
      { label: "Mid", level: 45 },
      { label: "High", level: 70 },
      { label: "Max", level: 99 }
    ];
  }
});

// src/themes/terrain/scene/presentation.ts
function bridge(palette) {
  const color = (level) => ({
    hex: palette.getElevation(level).top,
    opacity: level ? 1 : 0.5
  });
  return {
    text: palette.text,
    background: palette.bg,
    contribution: { levels: [color(0), color(20), color(45), color(70), color(95)] }
  };
}
function renderPresentation(scene, palette) {
  const themePalette = bridge(palette);
  const card = scene.settings.layout === "card";
  const font = { "font-family": FONT3, fill: palette.text.primary };
  const compactTitle = scene.settings.title.length > 44 ? `${scene.settings.title.slice(0, 43)}\u2026` : scene.settings.title;
  const range = scene.fromDate ? `${scene.fromDate} to ${scene.toDate}` : "No contribution dates supplied";
  const sparseNote = scene.stats.total === 0 && scene.cells.length ? "Garden decorations \xB7 0 contributions" : "";
  if (!card) {
    return renderTitle(compactTitle, themePalette) + renderSubtitle(scene.stats, scene.wonders.length, themePalette) + renderStatsBar(scene.stats, themePalette) + renderHeightLegend(scene, palette) + renderCalendarTimeline(scene, palette) + svgText(24, 129, "Water and trees are scenery, not contributions", {
      ...font,
      fill: palette.text.secondary,
      "font-size": 9
    }) + (sparseNote ? svgText(24, 148, sparseNote, { ...font, "font-size": 10 }) : "") + (!scene.cells.length ? svgText(24, 148, range, { ...font, "font-size": 10 }) : "");
  }
  const stats = [
    { value: formatNumber(scene.stats.total), label: "Contributions", x: 24 },
    { value: formatNumber(scene.stats.activeDays), label: "Active days", x: 163 },
    { value: `${scene.stats.longestStreak}d`, label: "Best streak", x: 292 }
  ];
  return svgText(24, 28, compactTitle, { ...font, "font-size": 18, "font-weight": 600 }) + svgText(24, 49, range, { ...font, fill: palette.text.secondary, "font-size": 12 }) + renderCalendarTimeline(scene, palette) + `<g class="stats-bar">${stats.map(
    (stat2) => svgText(stat2.x, 280, stat2.value, { ...font, "font-size": 26, "font-weight": 600 }) + svgText(stat2.x, 302, stat2.label, {
      ...font,
      "font-size": 16,
      fill: palette.text.secondary
    })
  ).join("")}</g>` + renderHeightLegend(scene, palette);
}
var FONT3;
var init_presentation = __esm({
  "src/themes/terrain/scene/presentation.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_shared();
    init_calendar_timeline();
    init_legend();
    FONT3 = "'Segoe UI', system-ui, sans-serif";
  }
});

// src/themes/terrain/scene/render.ts
function renderTerrainScene(scene, mode, options = {}) {
  const supported = /* @__PURE__ */ new Set(["width", "height", "namespace", "title", "motion", "layout"]);
  for (const key of Object.keys(options)) {
    if (!supported.has(key))
      throw new InputValidationError([
        { path: key, message: "Prepare a new terrain scene to change geometry settings" }
      ]);
  }
  const { width, height, namespace: customNamespace, ...overrides } = options;
  for (const [key, value] of [
    ["width", width],
    ["height", height]
  ]) {
    if (value !== void 0 && (!Number.isFinite(value) || value <= 0)) {
      throw new InputValidationError([
        { path: key, message: "Expected a positive finite display size" }
      ]);
    }
  }
  const settings = resolveRenderSettings(overrides, scene.settings, scene.username);
  const presented = { ...scene, settings };
  const card = settings.layout === "card";
  const viewWidth = card ? 420 : 840;
  const viewHeight = card ? 360 : 240;
  const namespace = `${customNamespace ?? `maeul-${hash(JSON.stringify(scene))}`}-${mode}-${settings.layout}`;
  const accessibilityNamespace = withMotionContext(
    { mode: "off", namespace },
    () => motionId("svg")
  );
  const reference = getTerrainPalette100(mode);
  const weekCount = scene.cells.length ? Math.max(...scene.cells.map((cell) => cell.week)) + 1 : 1;
  const firstSunday = scene.fromDate ? Date.parse(scene.fromDate) - new Date(scene.fromDate).getUTCDay() * 864e5 : 0;
  const palettes = Array.from({ length: weekCount }, (_, week) => {
    const date = new Date(firstSunday + week * 6048e5).toISOString().slice(0, 10);
    return getSeasonalPalette100(mode, 0, dateSeasonPosition(date, settings.hemisphere));
  });
  const isoCells = scene.cells.map((cell) => ({
    ...cell,
    colors: palettes[cell.week].getElevation(cell.level100)
  }));
  const biomes = new Map(scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]));
  const transform = fitScene(scene.bounds, sceneViewport(settings.layout));
  const seed = hash(scene.seed.root);
  const rotation = dateSeasonPosition(scene.fromDate, settings.hemisphere);
  const body = renderMotionBranches({ mode: settings.motion, namespace }, () => {
    const css = renderTerrainCSS(isoCells, biomes) + renderAssetCSS() + renderEpicCSS();
    const definitions = scene.wonders.length ? `<defs>${renderEpicGlowDefs(mode)}</defs>` : "";
    const sky = renderCelestials(seed, reference, mode === "dark") + renderClouds(seed, reference);
    const terrain = renderPreparedTerrainBlocks(isoCells, palettes, rotation, biomes, settings.hemisphere) + renderWaterOverlays(isoCells, reference, biomes) + renderWaterRipples(isoCells, reference, biomes) + renderDepthLayer(scene, isoCells, palettes) + renderSnowParticles(isoCells, seed, rotation) + renderFallingPetals(isoCells, seed, reference, rotation) + renderFallingLeaves(isoCells, seed, reference, rotation) + renderAnimatedOverlays(isoCells, reference);
    return (css ? svgStyle(css) : "") + definitions + `<svg x="0" y="0" width="${viewWidth}" height="${card ? 240 : viewHeight}" viewBox="0 0 840 240" aria-hidden="true">${sky}</svg><g class="terrain-fit" transform="translate(${svgNumber(transform.x)} ${svgNumber(transform.y)}) scale(${transform.scale.toFixed(6)})">${terrain}</g>`;
  });
  const description = `Isometric contribution terrain for @${scene.username} ${scene.fromDate ? `from ${scene.fromDate} to ${scene.toDate}` : "with no supplied contribution dates"}. ${formatNumber(scene.stats.total)} contributions across ${formatNumber(scene.stats.activeDays)} active days. ${scene.wonders.length} wonders discovered. ${scene.normalization.kind} normalization, maximum ${scene.normalization.maxCount}.`;
  const content = `<rect width="${viewWidth}" height="${viewHeight}" rx="10" fill="${mode === "dark" ? "#0d1117" : "#ffffff"}"/>` + body + renderPresentation(presented, reference);
  return svgRoot(
    {
      width: width ?? viewWidth,
      height: height ?? viewHeight,
      viewBox: `0 0 ${viewWidth} ${viewHeight}`,
      "data-layout": settings.layout,
      "data-scene": scene.seed.root,
      "data-color-mode": mode
    },
    content,
    { title: settings.title, description, namespace: accessibilityNamespace }
  );
}
var init_render = __esm({
  "src/themes/terrain/scene/render.ts"() {
    "use strict";
    init_cjs_shims();
    init_svg();
    init_errors();
    init_resolve();
    init_palette();
    init_blocks();
    init_assets();
    init_epics();
    init_motion();
    init_animation();
    init_effects();
    init_math();
    init_bounds3();
    init_season();
    init_depth();
    init_presentation();
  }
});

// src/themes/terrain/scene/metadata.ts
function terrainMetadata(scene) {
  const biomes = new Map(scene.biomes.map((entry) => [`${entry.week},${entry.day}`, entry.biome]));
  const byDate = (placements) => {
    const result = /* @__PURE__ */ new Map();
    for (const placement of placements) {
      const ids = result.get(placement.anchorDate) ?? [];
      ids.push(placement.id);
      result.set(placement.anchorDate, ids);
    }
    return result;
  };
  const assets = byDate(scene.placements);
  const wonders = byDate(scene.wonders);
  const span = scene.fromDate && scene.toDate ? Math.round((Date.parse(scene.toDate) - Date.parse(scene.fromDate)) / 864e5) + 1 : 0;
  return {
    schemaVersion: 1,
    layoutVersion: 1,
    username: scene.username,
    year: scene.year,
    fromDate: scene.fromDate,
    toDate: scene.toDate,
    dataDayCount: scene.cells.length,
    missingDayCount: span - scene.cells.length,
    stats: scene.stats,
    normalization: scene.normalization,
    seed: scene.seed,
    bounds: scene.bounds,
    cells: scene.cells.map((cell) => ({
      date: cell.date,
      count: cell.count,
      week: cell.week,
      day: cell.day,
      level100: cell.level100,
      biome: biomes.get(`${cell.week},${cell.day}`) ?? {
        isRiver: false,
        isPond: false,
        nearWater: false,
        forestDensity: 0
      },
      assetIds: assets.get(cell.date) ?? [],
      wonderIds: wonders.get(cell.date) ?? []
    })),
    placements: scene.placements,
    wonders: scene.wonders,
    neighborhoodPaths: scene.neighborhoodPaths
  };
}
var init_metadata = __esm({
  "src/themes/terrain/scene/metadata.ts"() {
    "use strict";
    init_cjs_shims();
  }
});

// src/themes/terrain/index.ts
var terrain_exports = {};
__export(terrain_exports, {
  prepareTerrainScene: () => prepareTerrainScene,
  renderTerrain: () => renderTerrain,
  renderTerrainScene: () => renderTerrainScene,
  terrainTheme: () => terrainTheme
});
function renderTerrain(data, options = {}) {
  const scene = prepareTerrainScene(data, options);
  const display = { width: options.width, height: options.height, namespace: options.namespace };
  return {
    dark: renderTerrainScene(scene, "dark", display),
    light: renderTerrainScene(scene, "light", display),
    metadata: terrainMetadata(scene)
  };
}
var terrainTheme;
var init_terrain = __esm({
  "src/themes/terrain/index.ts"() {
    "use strict";
    init_cjs_shims();
    init_prepare();
    init_render();
    init_metadata();
    init_prepare();
    init_render();
    terrainTheme = {
      name: "terrain",
      displayName: "Terrain",
      description: "Your contributions build a living world with forests, homes and Wonders",
      render(data, options) {
        const { dark, light } = renderTerrain(data, options);
        return { dark, light };
      }
    };
  }
});

// src/lib.ts
var lib_exports = {};
__export(lib_exports, {
  ASSET_CATALOG: () => ASSET_CATALOG,
  ASSET_CATALOG_COUNTS: () => ASSET_CATALOG_COUNTS,
  DEFAULT_VILLAGE_PRESET: () => DEFAULT_VILLAGE_PRESET,
  EPIC_CATALOG: () => EPIC_CATALOG,
  EPIC_CATALOG_COUNTS: () => EPIC_CATALOG_COUNTS,
  GitHubApiError: () => GitHubApiError,
  InputValidationError: () => InputValidationError,
  VILLAGE_PRESETS: () => VILLAGE_PRESETS,
  computeSharedNormalization: () => computeSharedNormalization,
  computeStats: () => computeStats,
  createArchive: () => createArchive,
  createArchiveGenerator: () => createArchiveGenerator,
  createPreviewServer: () => createPreviewServer,
  createSnapshot: () => createSnapshot,
  createTerrainGenerator: () => createTerrainGenerator,
  fetchContributions: () => fetchContributions,
  generateArchive: () => generateArchive,
  generateTerrain: () => generateTerrain,
  getAssetCatalogEntry: () => getAssetCatalogEntry,
  getEpicCatalogEntry: () => getEpicCatalogEntry,
  getTheme: () => getTheme,
  isAssetType: () => isAssetType,
  isEpicBuildingType: () => isEpicBuildingType,
  isVillagePreset: () => isVillagePreset,
  listThemes: () => listThemes,
  parseArchive: () => parseArchive,
  parseSettings: () => parseSettings,
  parseSnapshot: () => parseSnapshot,
  prepareTerrainScene: () => prepareTerrainScene,
  registerTheme: () => registerTheme,
  renderCatalogAsset: () => renderCatalogAsset,
  renderPng: () => renderPng,
  renderTerrain: () => renderTerrain,
  renderTerrainScene: () => renderTerrainScene,
  resolveRenderSettings: () => resolveRenderSettings,
  selectComparisonSnapshots: () => selectComparisonSnapshots,
  serializeArchive: () => serializeArchive,
  serializeSettings: () => serializeSettings,
  serializeSnapshot: () => serializeSnapshot,
  snapshotToContributionData: () => snapshotToContributionData,
  startPreviewServer: () => startPreviewServer,
  upsertArchiveSnapshot: () => upsertArchiveSnapshot
});
module.exports = __toCommonJS(lib_exports);
init_cjs_shims();

// src/browser.ts
init_cjs_shims();
init_stats();
init_presets();

// src/themes/registry.ts
init_cjs_shims();
init_terrain();
var themes = /* @__PURE__ */ new Map([[terrainTheme.name, terrainTheme]]);
function registerTheme(theme) {
  themes.set(theme.name, theme);
}
function getTheme(name) {
  return themes.get(name);
}
function listThemes() {
  return [...themes.keys()];
}
function getDefaultTheme() {
  return terrainTheme.name;
}

// src/browser.ts
init_terrain();
init_assets();
init_epics();

// src/core/settings/parse.ts
init_cjs_shims();
init_stats();
init_boundary();
init_resolve();

// src/core/settings/snapshot-schema.ts
init_cjs_shims();
var import_zod2 = require("zod");
init_boundary();
init_schema();
init_resolve();
init_calendar();
var contributionDateSchema = import_zod2.z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
  const timestamp = Date.parse(`${date}T00:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
}, "Invalid calendar date");
var contributionDaySchema = import_zod2.z.object({
  date: contributionDateSchema.refine(
    (date) => date >= "0001-01-01",
    "Contribution dates require a year from 1 to 9999"
  ),
  count: import_zod2.z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  level: import_zod2.z.union([import_zod2.z.literal(0), import_zod2.z.literal(1), import_zod2.z.literal(2), import_zod2.z.literal(3), import_zod2.z.literal(4)])
});
var contributionWeeksSchema = import_zod2.z.array(
  import_zod2.z.object({
    firstDay: contributionDateSchema,
    days: import_zod2.z.array(contributionDaySchema).max(7)
  })
).max(MAX_CONTRIBUTION_DAYS).superRefine((weeks, context) => {
  let count = 0;
  let total = 0;
  const dates = /* @__PURE__ */ new Set();
  for (const [weekIndex, week] of weeks.entries()) {
    count += week.days.length;
    for (const [dayIndex, day] of week.days.entries()) {
      total += day.count;
      if (dates.has(day.date)) {
        context.addIssue({
          code: "custom",
          path: [weekIndex, "days", dayIndex, "date"],
          message: "Duplicate contribution date"
        });
      }
      dates.add(day.date);
    }
  }
  if (count > MAX_CONTRIBUTION_DAYS) {
    context.addIssue({ code: "custom", message: "Import exceeds 20,000 contribution days" });
  }
  if (!Number.isSafeInteger(total)) {
    context.addIssue({
      code: "custom",
      message: "Contribution total exceeds the safe integer limit"
    });
  }
});
var sourceSchema = import_zod2.z.object({
  kind: import_zod2.z.enum(["github", "import", "sample"]),
  fetchedAt: import_zod2.z.iso.datetime({ offset: true }).transform((value) => new Date(value).toISOString()).optional()
});
var settingsEnvelopeSchema = import_zod2.z.object({
  schemaVersion: import_zod2.z.literal(1),
  kind: import_zod2.z.literal("maeul-settings"),
  username: usernameSchema,
  year: yearSchema.optional(),
  settings: renderSettingsInputSchema
});
var snapshotSchema = import_zod2.z.object({
  schemaVersion: import_zod2.z.literal(1),
  kind: import_zod2.z.literal("maeul-snapshot"),
  username: usernameSchema,
  year: yearSchema,
  weeks: contributionWeeksSchema,
  settings: renderSettingsInputSchema,
  source: sourceSchema
}).transform((parsed) => ({
  schemaVersion: 1,
  kind: "maeul-snapshot",
  username: parsed.username,
  year: parsed.year,
  weeks: normalizeContributionWeeks(parsed.weeks),
  settings: resolveRenderSettings(parsed.settings, {}, parsed.username),
  source: {
    kind: parsed.source.kind,
    ...parsed.source.fetchedAt === void 0 ? {} : { fetchedAt: parsed.source.fetchedAt }
  }
}));

// src/core/settings/parse.ts
function parseSettings(input) {
  const parsed = parseBoundary(settingsEnvelopeSchema, readJsonInput(input));
  return {
    schemaVersion: 1,
    kind: "maeul-settings",
    username: parsed.username,
    ...parsed.year === void 0 ? {} : { year: parsed.year },
    settings: resolveRenderSettings(parsed.settings, {}, parsed.username)
  };
}
function parseSnapshot(input) {
  return parseBoundary(snapshotSchema, readJsonInput(input));
}
function snapshotToContributionData(snapshot) {
  const weeks = snapshot.weeks.map((week) => ({
    firstDay: week.firstDay,
    days: week.days.map((day) => ({ ...day }))
  }));
  return { username: snapshot.username, year: snapshot.year, weeks, stats: computeStats(weeks) };
}
function createSnapshot(data, settings = {}, source = { kind: "import" }) {
  return parseSnapshot({
    schemaVersion: 1,
    kind: "maeul-snapshot",
    username: data.username,
    year: data.year,
    weeks: data.weeks,
    settings,
    source
  });
}

// src/browser.ts
init_resolve();
init_errors();

// src/core/settings/serialize.ts
init_cjs_shims();
function serializeSettings(settings) {
  return JSON.stringify(parseSettings(settings));
}
function serializeSnapshot(snapshot) {
  return JSON.stringify(parseSnapshot(snapshot));
}

// src/core/archive/parse.ts
init_cjs_shims();
init_boundary();

// src/core/archive/schema.ts
init_cjs_shims();
var import_zod3 = require("zod");
init_boundary();
init_schema();
var comparisonYearsSchema = import_zod3.z.array(yearSchema).min(2).max(5).refine((years) => new Set(years).size === years.length, "Comparison years must be unique").transform((years) => [...years].sort((a, b) => a - b));
var archiveSnapshotsSchema = import_zod3.z.array(snapshotSchema).max(MAX_ARCHIVE_SNAPSHOTS).superRefine((snapshots, context) => {
  const identities = /* @__PURE__ */ new Set();
  let days = 0;
  for (const [index, snapshot] of snapshots.entries()) {
    const identity = `${snapshot.username.toLowerCase()}:${snapshot.year}`;
    if (identities.has(identity)) {
      context.addIssue({
        code: "custom",
        path: [index],
        message: "Duplicate username/year requires explicit replacement"
      });
    }
    identities.add(identity);
    days += snapshot.weeks.reduce((sum, week) => sum + week.days.length, 0);
  }
  if (days > MAX_CONTRIBUTION_DAYS) {
    context.addIssue({
      code: "custom",
      message: "Import exceeds 20,000 contribution days across snapshots"
    });
  }
}).transform(
  (snapshots) => [...snapshots].sort(
    (a, b) => a.year - b.year || a.username.toLowerCase().localeCompare(b.username.toLowerCase())
  )
);
var archiveSchema = import_zod3.z.object({
  schemaVersion: import_zod3.z.literal(1),
  kind: import_zod3.z.literal("maeul-archive"),
  snapshots: archiveSnapshotsSchema,
  comparison: import_zod3.z.object({
    normalization: fixedNormalizationSchema,
    years: comparisonYearsSchema
  })
});

// src/core/archive/selection.ts
init_cjs_shims();
init_boundary();
init_errors();
function selectComparisonSnapshots(snapshots, years) {
  const selection = parseBoundary(comparisonYearsSchema, years, "comparison.years");
  const selected = selection.map((year) => {
    const matches = snapshots.filter((snapshot2) => snapshot2.year === year);
    const [snapshot] = matches;
    if (matches.length !== 1 || snapshot === void 0) {
      throw new InputValidationError([
        {
          path: "comparison.years",
          message: `Year ${year} must identify exactly one stored snapshot`
        }
      ]);
    }
    return snapshot;
  });
  if (new Set(selected.map((snapshot) => snapshot.username.toLowerCase())).size !== 1) {
    throw new InputValidationError([
      { path: "comparison.years", message: "Compare snapshots from the same username" }
    ]);
  }
  return selected;
}

// src/core/archive/parse.ts
function parseArchive(input) {
  const archive = parseBoundary(archiveSchema, readJsonInput(input));
  selectComparisonSnapshots(archive.snapshots, archive.comparison.years);
  return archive;
}

// src/core/archive/comparison.ts
init_cjs_shims();
init_errors();
init_boundary();
init_schema();
init_normalization();
function computeSharedNormalization(snapshots, normalization = { kind: "relative" }) {
  const selected = selectComparisonSnapshots(
    snapshots,
    snapshots.map((snapshot) => snapshot.year)
  );
  const option = parseBoundary(normalizationSchema, normalization, "comparison.normalization");
  switch (option.kind) {
    case "fixed":
      return option;
    case "relative":
      return {
        kind: "fixed",
        maxCount: computeP90Max(
          selected.flatMap(
            (snapshot) => snapshot.weeks.flatMap((week) => week.days.map((day) => day.count))
          )
        )
      };
    default:
      return option;
  }
}
function createArchive(snapshots, years = snapshots.map((snapshot) => snapshot.year), normalization = { kind: "relative" }) {
  const stored = parseBoundary(archiveSnapshotsSchema, readJsonInput(snapshots), "snapshots");
  const selected = selectComparisonSnapshots(stored, years);
  return {
    schemaVersion: 1,
    kind: "maeul-archive",
    snapshots: stored,
    comparison: {
      normalization: computeSharedNormalization(selected, normalization),
      years: selected.map((snapshot) => snapshot.year)
    }
  };
}
function upsertArchiveSnapshot(snapshots, snapshot, replace = false) {
  const incoming = parseSnapshot(snapshot);
  const matching = (stored) => stored.username.toLowerCase() === incoming.username.toLowerCase() && stored.year === incoming.year;
  if (snapshots.some(matching) && !replace) {
    throw new InputValidationError([
      { path: "snapshots", message: "Duplicate username/year requires explicit replacement" }
    ]);
  }
  const updated = [...snapshots.filter((stored) => !matching(stored)), incoming];
  return parseBoundary(archiveSnapshotsSchema, readJsonInput(updated), "snapshots");
}

// src/core/archive/serialize.ts
init_cjs_shims();
function serializeArchive(archive) {
  return JSON.stringify(parseArchive(archive));
}

// src/api/client.ts
init_cjs_shims();
init_calendar();
init_stats();

// src/api/queries.ts
init_cjs_shims();
var CONTRIBUTIONS_QUERY = `
  query ContributionsCalendar($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              date
              contributionCount
              contributionLevel
            }
          }
        }
      }
    }
  }
`;

// src/api/request.ts
init_cjs_shims();

// src/api/errors.ts
init_cjs_shims();
var ERROR_MESSAGES = {
  auth: "Authentication failed: invalid GitHub token or insufficient permissions",
  notfound: "GitHub user not found",
  ratelimit: "GitHub API rate limit exceeded",
  timeout: "GitHub API request timed out",
  network: "Network failure: unable to reach GitHub API",
  http: "GitHub API HTTP error",
  invalidresponse: "GitHub API returned an invalid response",
  aborted: "GitHub API request cancelled",
  configuration: "Invalid GitHub API request configuration"
};
var GitHubApiError = class extends Error {
  constructor(code, details = {}) {
    super(
      code === "http" ? `${ERROR_MESSAGES.http}: HTTP ${details.status}` : ERROR_MESSAGES[code]
    );
    this.code = code;
    this.status = details.status;
    this.retryAfterMs = details.retryAfterMs;
    this.retryable = code === "network" || code === "timeout" || code === "ratelimit" || code === "http" && (details.status === 408 || [500, 502, 503, 504].includes(details.status ?? 0));
  }
  name = "GitHubApiError";
  retryable;
  status;
  retryAfterMs;
};

// src/api/response.ts
init_cjs_shims();
var import_zod4 = require("zod");
var countSchema = import_zod4.z.number().finite().int().nonnegative();
var calendarSchema = import_zod4.z.object({
  totalContributions: countSchema,
  weeks: import_zod4.z.array(
    import_zod4.z.object({
      contributionDays: import_zod4.z.array(
        import_zod4.z.object({
          date: import_zod4.z.iso.date(),
          contributionCount: countSchema,
          contributionLevel: import_zod4.z.enum([
            "NONE",
            "FIRST_QUARTILE",
            "SECOND_QUARTILE",
            "THIRD_QUARTILE",
            "FOURTH_QUARTILE"
          ])
        })
      )
    })
  )
}).refine((calendar) => {
  const dates = calendar.weeks.flatMap((week) => week.contributionDays.map((day) => day.date));
  return new Set(dates).size === dates.length;
});
var graphQLErrorSchema = import_zod4.z.object({
  type: import_zod4.z.string().optional(),
  message: import_zod4.z.string(),
  extensions: import_zod4.z.object({ code: import_zod4.z.string().optional() }).optional()
});
var envelopeSchema = import_zod4.z.object({
  data: import_zod4.z.object({
    user: import_zod4.z.object({ contributionsCollection: import_zod4.z.object({ contributionCalendar: calendarSchema }) }).nullable()
  }).nullish(),
  errors: import_zod4.z.array(graphQLErrorSchema).optional()
});
var errorBodySchema = import_zod4.z.object({
  message: import_zod4.z.string().optional(),
  errors: import_zod4.z.array(graphQLErrorSchema).optional()
});
function retryAfterMs(headers) {
  const retryAfter = headers.get("retry-after");
  const reset = headers.get("x-ratelimit-reset");
  const delays = [];
  if (retryAfter !== null) {
    if (/^\d+(?:\.\d+)?$/.test(retryAfter)) {
      delays.push(Math.min(Math.ceil(Number(retryAfter) * 1e3), Number.MAX_SAFE_INTEGER));
    } else if (/^[A-Za-z]{3}, \d{2} [A-Za-z]{3} \d{4} \d{2}:\d{2}:\d{2} GMT$/.test(retryAfter)) {
      const delay = Date.parse(retryAfter) - Date.now();
      if (Number.isFinite(delay)) delays.push(Math.max(0, delay));
    }
  }
  if (headers.get("x-ratelimit-remaining") === "0" && reset !== null && /^\d+$/.test(reset)) {
    const delay = Math.min(Number(reset) * 1e3 - Date.now(), Number.MAX_SAFE_INTEGER);
    delays.push(Math.max(0, delay));
  }
  return delays.length > 0 ? Math.max(...delays) : void 0;
}
function rateLimitError(response) {
  return new GitHubApiError("ratelimit", {
    status: response.status,
    retryAfterMs: retryAfterMs(response.headers) ?? 6e4
  });
}
async function parseGitHubResponse(response) {
  const { status } = response;
  if (status === 401) throw new GitHubApiError("auth", { status });
  if (status === 404) throw new GitHubApiError("notfound", { status });
  if (status === 429 || status === 403 && (response.headers.get("x-ratelimit-remaining") === "0" || response.headers.has("retry-after")))
    throw rateLimitError(response);
  if (!response.ok && status !== 403) {
    const delay = retryAfterMs(response.headers);
    throw new GitHubApiError("http", {
      status,
      ...delay === void 0 ? {} : { retryAfterMs: delay }
    });
  }
  let body;
  try {
    body = await response.json();
  } catch (error) {
    if (status === 403) throw new GitHubApiError("auth", { status });
    if (error instanceof SyntaxError) throw new GitHubApiError("invalidresponse", { status });
    throw error;
  }
  if (status === 403) {
    const parsed2 = errorBodySchema.safeParse(body);
    if (parsed2.success && parsed2.data.errors?.some(
      (error) => error.type === "RATE_LIMITED" || error.extensions?.code === "RATE_LIMITED"
    ))
      throw rateLimitError(response);
    const messages = parsed2.success ? [parsed2.data.message ?? "", ...parsed2.data.errors?.map((error) => error.message) ?? []] : [];
    if (messages.some((message) => /rate limit/i.test(message))) throw rateLimitError(response);
    throw new GitHubApiError("auth", { status });
  }
  const parsed = envelopeSchema.safeParse(body);
  if (!parsed.success) throw new GitHubApiError("invalidresponse", { status });
  const errors = parsed.data.errors ?? [];
  const codes = new Set(errors.flatMap((error) => [error.type, error.extensions?.code]));
  if (["UNAUTHORIZED", "UNAUTHENTICATED", "FORBIDDEN"].some((code) => codes.has(code))) {
    throw new GitHubApiError("auth", { status });
  }
  if (errors.length > 0) {
    if (codes.has("NOT_FOUND") || errors.some((error) => /Could not resolve to a User/i.test(error.message))) {
      throw new GitHubApiError("notfound", { status });
    }
    if (codes.has("RATE_LIMITED") || errors.some((error) => /rate limit/i.test(error.message)) || response.headers.get("x-ratelimit-remaining") === "0")
      throw rateLimitError(response);
    throw new GitHubApiError("invalidresponse", { status });
  }
  if (parsed.data.data?.user === null) throw new GitHubApiError("notfound", { status });
  if (!parsed.data.data) throw new GitHubApiError("invalidresponse", { status });
  return parsed.data.data.user.contributionsCollection.contributionCalendar;
}

// src/api/request.ts
var GITHUB_API_ENDPOINT = "https://api.github.com/graphql";
var RETRY_DELAYS = [1e3, 2e3];
var TOTAL_TIMEOUT_MS = 3e4;
function requestConfig(options) {
  const timeoutMs = options.timeoutMs ?? 1e4;
  const maxRetryWaitMs = options.maxRetryWaitMs ?? 1e4;
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0 || timeoutMs > 12e4 || !Number.isInteger(maxRetryWaitMs) || maxRetryWaitMs < 0 || maxRetryWaitMs > 6e4) {
    throw new GitHubApiError("configuration");
  }
  let endpoint;
  try {
    endpoint = new URL(options.endpoint ?? GITHUB_API_ENDPOINT);
  } catch (error) {
    if (error instanceof TypeError) throw new GitHubApiError("configuration");
    throw error;
  }
  const isGitHub = endpoint.href === GITHUB_API_ENDPOINT;
  const isLoopback = ["127.0.0.1", "[::1]"].includes(endpoint.hostname) && ["http:", "https:"].includes(endpoint.protocol);
  if (!isGitHub && !isLoopback || endpoint.username || endpoint.password || endpoint.search || endpoint.hash) {
    throw new GitHubApiError("configuration");
  }
  return { timeoutMs, maxRetryWaitMs, endpoint: endpoint.href, isGitHub };
}
async function requestAttempt(endpoint, init, timeoutMs, signal) {
  if (signal?.aborted) throw new GitHubApiError("aborted");
  const controller = new AbortController();
  const abort = () => controller.abort(new GitHubApiError("aborted"));
  signal?.addEventListener("abort", abort, { once: true });
  const timer = setTimeout(() => controller.abort(new GitHubApiError("timeout")), timeoutMs);
  let rejectAbort = () => {
  };
  const interrupted = new Promise((_resolve, reject) => {
    rejectAbort = () => reject(controller.signal.reason);
    controller.signal.addEventListener("abort", rejectAbort, { once: true });
  });
  try {
    const request = fetch(endpoint, { ...init, signal: controller.signal }).then(
      parseGitHubResponse
    );
    return await Promise.race([request, interrupted]);
  } catch (error) {
    if (error instanceof GitHubApiError) throw error;
    throw new GitHubApiError("network");
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", abort);
    controller.signal.removeEventListener("abort", rejectAbort);
    controller.abort();
  }
}
async function waitForRetry(delay, signal) {
  if (signal?.aborted) throw new GitHubApiError("aborted");
  await new Promise((resolve3, reject) => {
    const abort = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      reject(new GitHubApiError("aborted"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", abort);
      resolve3();
    }, delay);
    signal?.addEventListener("abort", abort, { once: true });
  });
}
async function makeGraphQLRequest(query, variables, token, options) {
  const config = requestConfig(options);
  const deadline = Date.now() + TOTAL_TIMEOUT_MS;
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": "maeul-in-the-sky"
  };
  if (token && config.isGitHub) headers["Authorization"] = `bearer ${token}`;
  const init = {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
    redirect: "manual"
  };
  let waitedMs = 0;
  for (let attempt = 0; ; attempt++) {
    const remainingMs = deadline - Date.now();
    if (remainingMs <= 0) throw new GitHubApiError("timeout");
    try {
      return await requestAttempt(
        config.endpoint,
        init,
        Math.min(config.timeoutMs, remainingMs),
        options.signal
      );
    } catch (error) {
      if (!(error instanceof GitHubApiError)) throw error;
      const backoff = RETRY_DELAYS[attempt];
      if (!error.retryable || backoff === void 0) throw error;
      const delay = error.retryAfterMs ?? backoff;
      if (delay > config.maxRetryWaitMs - waitedMs || delay >= deadline - Date.now()) throw error;
      await waitForRetry(delay, options.signal);
      waitedMs += delay;
    }
  }
}

// src/api/client.ts
var CONTRIBUTION_LEVELS = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4
};
async function fetchContributions(username, year, token, options = {}) {
  let from;
  let to;
  let effectiveYear;
  if (year != null) {
    from = `${year}-01-01T00:00:00Z`;
    to = `${year}-12-31T23:59:59Z`;
    effectiveYear = year;
  } else {
    const now = /* @__PURE__ */ new Date();
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    from = oneYearAgo.toISOString();
    to = now.toISOString();
    effectiveYear = now.getFullYear();
  }
  const calendar = await makeGraphQLRequest(
    CONTRIBUTIONS_QUERY,
    { username, from, to },
    token,
    options
  );
  const rawWeeks = calendar.weeks.map((week) => {
    const days = week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
      level: CONTRIBUTION_LEVELS[day.contributionLevel]
    }));
    return {
      days,
      firstDay: days[0]?.date ?? ""
    };
  });
  const weeks = normalizeContributionWeeks(rawWeeks);
  const stats = computeStats(weeks);
  return {
    weeks,
    stats: {
      ...stats,
      total: calendar.totalContributions
    },
    year: effectiveYear,
    username
  };
}

// src/generate.ts
init_cjs_shims();

// src/generate/dependencies.ts
init_cjs_shims();
var import_promises2 = require("fs/promises");

// src/output/png.ts
init_cjs_shims();
var import_promises = require("fs/promises");
var import_node_module = require("module");
var import_resvg_wasm = require("@resvg/resvg-wasm");
var import_zod5 = require("zod");
init_boundary();
var initialization;
var defaultFont;
async function readBundledFile(bundled, source) {
  try {
    return await (0, import_promises.readFile)(bundled);
  } catch (error) {
    if (!(error instanceof Error) || !("code" in error) || error.code !== "ENOENT") throw error;
    return (0, import_promises.readFile)(source());
  }
}
async function initialize(wasmPath) {
  const bytes = wasmPath ? await (0, import_promises.readFile)(wasmPath) : await readBundledFile(
    new URL("./resvg.wasm", importMetaUrl),
    () => (0, import_node_module.createRequire)(importMetaUrl).resolve("@resvg/resvg-wasm/index_bg.wasm")
  );
  await (0, import_resvg_wasm.initWasm)(new Uint8Array(bytes));
}
async function renderPng(svg, options) {
  const scale = parseBoundary(import_zod5.z.number().int().min(1).max(4), options.scale ?? 2, "scale");
  const mode = parseBoundary(import_zod5.z.enum(["dark", "light"]), options.mode, "mode");
  initialization ??= initialize(options.wasmPath).catch((error) => {
    initialization = void 0;
    throw error;
  });
  await initialization;
  const font = options.fontPath ? await (0, import_promises.readFile)(options.fontPath) : await (defaultFont ??= readBundledFile(
    new URL("./fonts/NotoSansKR.ttf", importMetaUrl),
    () => new URL("../../assets/fonts/NotoSansKR.ttf", importMetaUrl)
  ));
  const renderer = new import_resvg_wasm.Resvg(svg, {
    fitTo: { mode: "zoom", value: scale },
    background: mode === "dark" ? "#0d1117" : "#ffffff",
    font: {
      fontBuffers: [font],
      defaultFontFamily: "Noto Sans KR",
      sansSerifFamily: "Noto Sans KR"
    }
  });
  try {
    const image = renderer.render();
    try {
      return new Uint8Array(image.asPng());
    } finally {
      image.free();
    }
  } finally {
    renderer.free();
  }
}

// src/generate/dependencies.ts
var nodeGeneratorDependencies = {
  fetchContributions,
  getTheme,
  listThemes,
  getDefaultTheme,
  makeDirectory: async (path) => {
    await (0, import_promises2.mkdir)(path, { recursive: true });
  },
  writeFile: async (path, content) => {
    await (0, import_promises2.writeFile)(path, content, "utf-8");
  },
  readFile: async (path) => (0, import_promises2.readFile)(path, "utf-8"),
  writeBinaryFile: async (path, content) => {
    await (0, import_promises2.writeFile)(path, content);
  },
  renderPng
};

// src/generate/input.ts
init_cjs_shims();
var import_promises3 = require("fs/promises");
init_boundary();
init_schema();
init_resolve();

// src/generate/options.ts
init_cjs_shims();
var import_zod6 = require("zod");
init_boundary();
init_errors();
init_schema();
function invalidOption(field, message) {
  throw new InputValidationError([{ path: field, message: `Invalid ${field}: ${message}` }]);
}
function optionalNumber(value, field) {
  if (value === void 0 || value === "") return void 0;
  if (typeof value === "string" && value.trim() === "")
    return invalidOption(field, "expected a number");
  const parsed = import_zod6.z.coerce.number().finite().safeParse(value);
  if (!parsed.success) return invalidOption(field, "expected a finite number");
  return parsed.data;
}
function parseGenerationYear(value) {
  const year = optionalNumber(value, "year");
  if (year === void 0) return void 0;
  const parsed = yearSchema.safeParse(year);
  if (!parsed.success) return invalidOption("year", "expected an integer from 1 to 9999");
  return parsed.data;
}
function parseGenerationSettings(request, archive = false) {
  const normalization = request.normalization || void 0;
  const maxCount = optionalNumber(request.maxCount, "maxCount");
  if (normalization === "shared" && !archive)
    invalidOption("normalization", "shared requires an archive");
  if (normalization && !["relative", "fixed", "shared"].includes(normalization)) {
    invalidOption("normalization", "expected relative, fixed, or shared");
  }
  if (maxCount !== void 0 && normalization !== "fixed")
    invalidOption("maxCount", "requires fixed normalization");
  if (normalization === "fixed" && maxCount === void 0)
    invalidOption("maxCount", "required for fixed normalization");
  if (request.style && request.villageStyle && request.style !== request.villageStyle) {
    invalidOption("style", "conflicts with villageStyle");
  }
  const explicit = {
    preset: request.preset || void 0,
    density: optionalNumber(request.density, "density"),
    title: request.title || void 0,
    hemisphere: request.hemisphere || void 0,
    motion: request.motion || void 0,
    layout: request.layout || void 0,
    style: request.style || request.villageStyle || void 0,
    layoutSeed: request.layoutSeed,
    normalization: normalization === "fixed" ? { kind: "fixed", maxCount } : normalization === "relative" ? { kind: "relative" } : void 0
  };
  const parsed = renderSettingsInputSchema.safeParse(explicit);
  if (!parsed.success) {
    throw new InputValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: `Invalid ${String(issue.path[0])}: ${issue.message}`
      }))
    );
  }
  return parsed.data;
}
function parseOutputOptions(request) {
  const format = parseBoundary(import_zod6.z.enum(["svg", "png", "both"]), request.format || "svg", "format");
  const scale = parseBoundary(
    import_zod6.z.number().int().min(1).max(4),
    optionalNumber(request.scale, "scale") ?? 2,
    "scale"
  );
  return { format, scale };
}
function parseGenerationYears(value) {
  if (value === void 0 || value === "") return void 0;
  const values = typeof value === "string" ? value.split(",").map((part) => optionalNumber(part.trim(), "years")) : value;
  const years = parseBoundary(import_zod6.z.array(yearSchema).min(2).max(5), values, "years");
  if (new Set(years).size !== years.length)
    invalidOption("years", "duplicate years are not allowed");
  return [...years].sort((a, b) => a - b);
}

// src/generate/input.ts
async function loadConfiguration(request, dependencies) {
  if (request.config === void 0) return void 0;
  return parseSettings(
    typeof request.config === "string" ? await (dependencies.readFile ?? ((path) => (0, import_promises3.readFile)(path, "utf-8")))(request.config) : request.config
  );
}
async function loadSnapshot(request, dependencies) {
  if (request.input === void 0) return void 0;
  return parseSnapshot(
    typeof request.input === "string" ? await (dependencies.readFile ?? ((path) => (0, import_promises3.readFile)(path, "utf-8")))(request.input) : request.input
  );
}
async function resolveGenerationInput(request, dependencies) {
  if (request.years !== void 0 && request.years !== "")
    invalidOption("years", "use generateArchive for multiple years");
  const explicit = parseGenerationSettings(request);
  const output = parseOutputOptions(request);
  const config = await loadConfiguration(request, dependencies);
  const snapshot = await loadSnapshot(request, dependencies);
  const username = request.username?.trim() || snapshot?.username || config?.username;
  if (!username) invalidOption("username", "GitHub username is required");
  parseBoundary(usernameSchema, username, "username");
  if (snapshot && snapshot.username.toLowerCase() !== username.toLowerCase())
    invalidOption("username", "does not match the input snapshot");
  const year = parseGenerationYear(request.year) ?? snapshot?.year ?? config?.year;
  if (snapshot && year !== snapshot.year)
    invalidOption("year", "does not match the input snapshot");
  const settings = resolveRenderSettings(
    explicit,
    config?.settings ?? snapshot?.settings ?? {},
    username
  );
  const advanced = snapshot !== void 0 || config !== void 0 || [
    request.motion,
    request.layout,
    request.style,
    request.villageStyle,
    request.normalization,
    request.layoutSeed
  ].some((value) => value !== void 0 && value !== "");
  return { username, year, settings, snapshot, advanced, ...output };
}

// src/output/files.ts
init_cjs_shims();
var import_node_path = require("path");
var import_promises4 = require("fs/promises");
async function writeTerrainOutputs(input, dependencies) {
  const { request, data, theme, settings, options, format, scale, source } = input;
  const directory = request.outputDir?.trim() || "./";
  await dependencies.makeDirectory(directory);
  let darkPath = "";
  let lightPath = "";
  if (format !== "png") {
    const output = theme.render(data, options);
    darkPath = (0, import_node_path.join)(directory, "maeul-in-the-sky-dark.svg");
    lightPath = (0, import_node_path.join)(directory, "maeul-in-the-sky-light.svg");
    await dependencies.writeFile(darkPath, output.dark);
    await dependencies.writeFile(lightPath, output.light);
  }
  const pngPaths = {};
  if (format !== "svg") {
    const staticOutput = theme.render(data, { ...options, motion: "off" });
    const png = dependencies.renderPng ?? renderPng;
    const writeBinary = dependencies.writeBinaryFile ?? (async (path, bytes) => {
      await (0, import_promises4.writeFile)(path, bytes);
    });
    pngPaths.darkPngPath = (0, import_node_path.join)(directory, "maeul-in-the-sky-dark.png");
    pngPaths.lightPngPath = (0, import_node_path.join)(directory, "maeul-in-the-sky-light.png");
    await writeBinary(pngPaths.darkPngPath, await png(staticOutput.dark, { mode: "dark", scale }));
    await writeBinary(
      pngPaths.lightPngPath,
      await png(staticOutput.light, { mode: "light", scale })
    );
  }
  if (!request.writeSnapshot) return { darkPath, lightPath, ...pngPaths };
  const snapshotPath = typeof request.writeSnapshot === "string" ? request.writeSnapshot : (0, import_node_path.join)(directory, "maeul-in-the-sky.snapshot.json");
  await dependencies.makeDirectory((0, import_node_path.dirname)(snapshotPath));
  await dependencies.writeFile(
    snapshotPath,
    serializeSnapshot(createSnapshot(data, settings, source))
  );
  return { darkPath, lightPath, ...pngPaths, snapshotPath };
}

// src/generate.ts
function createTerrainGenerator(dependencies) {
  return async function generateTerrain2(request) {
    const input = await resolveGenerationInput(request, dependencies);
    const themeName = request.theme?.trim() || dependencies.getDefaultTheme();
    const theme = dependencies.getTheme(themeName);
    if (!theme)
      invalidOption(
        "theme",
        `Unknown theme "${themeName}". Available themes: ${dependencies.listThemes().join(", ")}`
      );
    const { username, year, settings, snapshot, advanced } = input;
    request.onProgress?.(
      snapshot ? `Reading snapshot for @${username} (${year})...` : `Fetching contributions for @${username} (${year ?? "last 52 weeks"})...`
    );
    const data = snapshot ? snapshotToContributionData(snapshot) : await dependencies.fetchContributions(username, year, request.token || void 0);
    request.onProgress?.(`Rendering with ${theme.displayName} theme...`);
    const options = {
      title: settings.title,
      width: settings.layout === "card" ? 420 : 840,
      height: settings.layout === "card" ? 360 : 240,
      hemisphere: settings.hemisphere,
      density: settings.density,
      ...advanced ? {
        motion: settings.motion,
        layout: settings.layout,
        style: settings.style,
        normalization: settings.normalization,
        ...settings.layoutSeed === void 0 ? {} : { layoutSeed: settings.layoutSeed }
      } : {}
    };
    const paths = await writeTerrainOutputs(
      { ...input, request, data, theme, options, source: snapshot?.source ?? { kind: "github" } },
      dependencies
    );
    return {
      ...paths,
      themeName: theme.name,
      themeDisplayName: theme.displayName,
      presetName: settings.preset,
      density: settings.density
    };
  };
}
var generateTerrain = createTerrainGenerator(nodeGeneratorDependencies);

// src/archive.ts
init_cjs_shims();
var import_node_path2 = require("path");
init_resolve();

// src/archive/input.ts
init_cjs_shims();
var import_promises5 = require("fs/promises");
init_resolve();
init_boundary();
init_schema();
async function resolveArchiveInput(request, dependencies) {
  if (typeof request.writeSnapshot === "string") {
    invalidOption(
      "writeSnapshot",
      "archive snapshots are written inside each year directory; omit the path"
    );
  }
  if (request.year !== void 0 && request.year !== "")
    invalidOption("year", "cannot be combined with years or archive input");
  const { input, snapshots: supplied, ...singleRequest } = request;
  const explicit = parseGenerationSettings(singleRequest, true);
  parseOutputOptions(singleRequest);
  const config = await loadConfiguration(singleRequest, dependencies);
  if (input !== void 0 && supplied !== void 0)
    invalidOption("input", "cannot be combined with snapshots");
  const loaded = input === void 0 ? void 0 : parseArchive(
    typeof input === "string" ? await (dependencies.readFile ?? ((path) => (0, import_promises5.readFile)(path, "utf-8")))(input) : input
  );
  const snapshots = supplied?.map((snapshot) => parseSnapshot(snapshot)) ?? loaded?.snapshots;
  const years = parseGenerationYears(request.years) ?? loaded?.comparison.years ?? snapshots?.map((snapshot) => snapshot.year);
  if (years === void 0) invalidOption("years", "an archive requires 2\u20135 years");
  const selected = snapshots ? selectComparisonSnapshots(snapshots, years) : void 0;
  const username = request.username?.trim() || selected?.[0]?.username || config?.username;
  if (!username) invalidOption("username", "GitHub username is required");
  parseBoundary(usernameSchema, username, "username");
  if (selected?.some((snapshot) => snapshot.username.toLowerCase() !== username.toLowerCase()))
    invalidOption("username", "does not match archive snapshots");
  const settings = resolveRenderSettings(explicit, config?.settings ?? {}, username);
  const normalization = request.normalization === "shared" ? { kind: "relative" } : explicit.normalization ?? config?.settings.normalization ?? loaded?.comparison.normalization ?? settings.normalization;
  const fetched = [];
  if (!selected) {
    for (const year of years) {
      request.onProgress?.(`Fetching contributions for @${username} (${year})...`);
      const data = await dependencies.fetchContributions(
        username,
        year,
        request.token || void 0
      );
      fetched.push(createSnapshot(data, settings, { kind: "github" }));
    }
  }
  const archive = createArchive(snapshots ?? fetched, years, normalization);
  return {
    archive,
    explicit,
    config,
    source: normalization.kind === "fixed" ? "explicit-fixed" : "shared-p90"
  };
}

// src/archive/comparison.ts
init_cjs_shims();
init_svg();

// src/archive/svg-composition.ts
init_cjs_shims();

// src/archive/svg-css.ts
init_cjs_shims();
var import_css_tree3 = require("css-tree");
init_errors();

// src/archive/svg-css-source.ts
init_cjs_shims();
init_errors();

// src/archive/svg-css-serialization.ts
init_cjs_shims();
function escapeCssXmlText(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
function serializeCssCdata(value) {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}

// src/archive/svg-css-source.ts
var XML_ENTITIES = /* @__PURE__ */ new Map([
  ["amp", "&"],
  ["apos", "'"],
  ["gt", ">"],
  ["lt", "<"],
  ["quot", '"']
]);
var XML_REFERENCE = /&(?:#x[\dA-Fa-f]+|#[\d]+|amp|apos|gt|lt|quot);/g;
function invalidCss(message) {
  return new InputValidationError([{ path: "theme.svg.style", message }]);
}
function decodeXmlReference(reference) {
  if (reference.startsWith("&#x")) {
    return String.fromCodePoint(Number.parseInt(reference.slice(3, -1), 16));
  }
  if (reference.startsWith("&#")) {
    return String.fromCodePoint(Number.parseInt(reference.slice(2, -1), 10));
  }
  return XML_ENTITIES.get(reference.slice(1, -1)) ?? reference;
}
function normalizeCssSource(source, xmlText) {
  if (!xmlText) {
    return {
      value: source,
      offsets: Array.from({ length: source.length + 1 }, (_, index) => index)
    };
  }
  let value = "";
  let cursor = 0;
  const offsets = [0];
  for (const match of source.matchAll(XML_REFERENCE)) {
    const reference = match[0];
    const start = match.index;
    for (let index = cursor; index < start; index++) {
      value += source[index] ?? "";
      offsets.push(index + 1);
    }
    const decoded = decodeXmlReference(reference);
    value += decoded;
    for (let index = 0; index < decoded.length; index++) {
      offsets.push(index === decoded.length - 1 ? start + reference.length : start);
    }
    cursor = start + reference.length;
  }
  for (let index = cursor; index < source.length; index++) {
    value += source[index] ?? "";
    offsets.push(index + 1);
  }
  return { value, offsets };
}
function cssReplacement(normalized, node, value, xmlText) {
  const location = node.loc;
  if (location === void 0) throw invalidCss("CSS token has no source position");
  const start = normalized.offsets[location.start.offset];
  const end = normalized.offsets[location.end.offset];
  if (start === void 0 || end === void 0) throw invalidCss("CSS token position is invalid");
  return {
    start,
    end,
    value: xmlText ? escapeCssXmlText(value) : value
  };
}
function applyCssReplacements(source, replacements) {
  const ordered = [...replacements].sort((left, right) => right.start - left.start);
  let output = source;
  let previousStart = source.length;
  for (const replacement of ordered) {
    if (replacement.end > previousStart) throw invalidCss("Overlapping CSS reference tokens");
    output = `${output.slice(0, replacement.start)}${replacement.value}${output.slice(replacement.end)}`;
    previousStart = replacement.start;
  }
  return output;
}

// src/archive/svg-css-selectors.ts
init_cjs_shims();
var import_css_tree = require("css-tree");
function asciiInsensitive(value) {
  return value.replace(/[A-Z]/g, (character) => character.toLowerCase());
}
function normalizedCssKeyword(name) {
  return asciiInsensitive(import_css_tree.ident.decode(name));
}
function namespaceSeparator(encoded) {
  for (let index = encoded.length - 1; index >= 0; index--) {
    if (encoded[index] !== "|") continue;
    let backslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && encoded[cursor] === "\\"; cursor--) {
      backslashes++;
    }
    if (backslashes % 2 === 0) return index;
  }
  return -1;
}
function reserveSelectorPrefix(encoded, reserved) {
  const separator = namespaceSeparator(encoded);
  if (separator < 0) return;
  const prefix = import_css_tree.ident.decode(encoded.slice(0, separator));
  if (prefix !== "" && prefix !== "*") reserved.add(prefix);
}
function cssNamespaceRegistry(ast) {
  const bindings = /* @__PURE__ */ new Map();
  const reserved = /* @__PURE__ */ new Set();
  const declarationUrls = /* @__PURE__ */ new Set();
  (0, import_css_tree.walk)(ast, (node) => {
    if (node.type === "AttributeSelector") {
      reserveSelectorPrefix(node.name.name, reserved);
    }
    if (node.type === "TypeSelector") {
      reserveSelectorPrefix(node.name, reserved);
    }
    if (node.type !== "Atrule" || normalizedCssKeyword(node.name) !== "namespace" || node.prelude === null) {
      return;
    }
    const children = node.prelude.type === "AtrulePrelude" ? node.prelude.children.toArray() : [];
    const namespace = children.at(-1);
    if (namespace?.type !== "String" && namespace?.type !== "Url") return;
    if (namespace.type === "Url") declarationUrls.add(namespace);
    const prefix = children.length > 1 ? children[0] : void 0;
    if (prefix?.type === "Identifier") {
      bindings.set(import_css_tree.ident.decode(prefix.name), namespace.value);
      reserved.add(import_css_tree.ident.decode(prefix.name));
    }
  });
  return { bindings, generated: /* @__PURE__ */ new Map(), reserved, declarationUrls };
}
function generatedNamespaceRules(registry) {
  return [...registry.generated].map(([uri, prefix]) => `@namespace ${prefix} ${import_css_tree.string.encode(uri)};`).join("");
}
function generatedPrefix(registry, uri) {
  const existing = [...registry.bindings].find(([, namespace]) => namespace === uri)?.[0];
  if (existing !== void 0) return existing;
  const generated = registry.generated.get(uri);
  if (generated !== void 0) return generated;
  let index = registry.generated.size;
  let prefix = `maeulNs${index}`;
  while (registry.reserved.has(prefix)) {
    index++;
    prefix = `maeulNs${index}`;
  }
  registry.bindings.set(prefix, uri);
  registry.generated.set(uri, prefix);
  registry.reserved.add(prefix);
  return prefix;
}
function selectorTarget(encoded, registry) {
  const separator = namespaceSeparator(encoded);
  if (separator < 0) return { kind: "none", local: import_css_tree.ident.decode(encoded), explicit: false };
  const prefix = import_css_tree.ident.decode(encoded.slice(0, separator));
  const local = import_css_tree.ident.decode(encoded.slice(separator + 1));
  if (prefix === "") return { kind: "none", local, explicit: true };
  if (prefix === "*") return { kind: "wildcard", local };
  const uri = registry.bindings.get(prefix);
  return uri === void 0 ? void 0 : { kind: "named", local, prefix, uri };
}
function selectorValue(node) {
  if (node.value?.type === "String") return node.value.value;
  return node.value?.type === "Identifier" ? import_css_tree.ident.decode(node.value.name) : void 0;
}
function attributeMatches(candidateValue, matcher, expectedValue, insensitive) {
  const candidate = insensitive ? asciiInsensitive(candidateValue) : candidateValue;
  const expected = insensitive ? asciiInsensitive(expectedValue) : expectedValue;
  if (matcher === "=") return candidate === expected;
  if (expected === "" && (matcher === "^=" || matcher === "$=" || matcher === "*=" || matcher === "~=")) {
    return false;
  }
  if (matcher === "^=") return candidate.startsWith(expected);
  if (matcher === "$=") return candidate.endsWith(expected);
  if (matcher === "*=") return candidate.includes(expected);
  if (matcher === "~=") return candidate.split(/[\t\n\f\r ]+/).includes(expected);
  if (matcher === "|=") return candidate === expected || candidate.startsWith(`${expected}-`);
  return false;
}
function attributeName(target, namespace, registry) {
  const local = import_css_tree.ident.encode(target.local);
  if (namespace === "") {
    return target.kind === "none" && !target.explicit ? local : `|${local}`;
  }
  const prefix = target.kind === "named" ? target.prefix : generatedPrefix(registry, namespace);
  return `${import_css_tree.ident.encode(prefix)}|${local}`;
}
function selectorBranch(name, matcher, value, flags) {
  const suffix = flags === null ? "" : ` ${flags}`;
  return `[${name}${matcher}${import_css_tree.string.encode(value)}${suffix}]`;
}
function rewriteAttributeSelector(node, attributes, registry) {
  const target = selectorTarget(node.name.name, registry);
  const value = selectorValue(node);
  if (target === void 0 || node.matcher === null || value === void 0) return { kind: "none" };
  const selected = attributes.filter(
    (attribute) => attribute.local === target.local && (target.kind === "wildcard" || (target.kind === "none" ? attribute.namespace === "" : attribute.namespace === target.uri))
  );
  if (selected.length === 0 || selected.every(({ original, rewritten }) => original === rewritten)) {
    return { kind: "none" };
  }
  const insensitive = node.flags?.toLowerCase() === "i";
  const namespaces = [...new Set(selected.map(({ namespace }) => namespace))];
  const branches = [];
  for (const namespace of namespaces) {
    const states = selected.filter((attribute) => attribute.namespace === namespace);
    const name = attributeName(target, namespace, registry);
    if (states.every(({ original, rewritten }) => original === rewritten)) {
      branches.push(selectorBranch(name, node.matcher, value, node.flags));
      continue;
    }
    const matching = states.filter(
      ({ original }) => attributeMatches(original, node.matcher ?? "", value, insensitive)
    );
    const finalValues = [...new Set(matching.map(({ rewritten }) => rewritten))];
    const nonMatching = states.filter(
      ({ original }) => !attributeMatches(original, node.matcher ?? "", value, insensitive)
    );
    const collision = finalValues.find(
      (finalValue) => nonMatching.some(
        ({ rewritten }) => attributeMatches(rewritten, "=", finalValue, insensitive)
      )
    );
    if (collision !== void 0) {
      return {
        kind: "unsupported",
        message: `Attribute selector cannot preserve colliding ${target.local} value ${JSON.stringify(collision)}`
      };
    }
    branches.push(
      ...finalValues.map((finalValue) => selectorBranch(name, "=", finalValue, node.flags))
    );
  }
  if (branches.length === 0) {
    const state = selected[0];
    if (state === void 0) return { kind: "none" };
    branches.push(`:not(*|*)[${attributeName(target, state.namespace, registry)}]`);
  }
  return { kind: "selector", value: `:is(${branches.join(",")})` };
}

// src/archive/svg-css-scope.ts
init_cjs_shims();
var import_css_tree2 = require("css-tree");
init_errors();
function invalidCss2(message) {
  return new InputValidationError([{ path: "theme.svg.style", message }]);
}
function parseStylesheet(source, xmlEntities) {
  const normalized = normalizeCssSource(source, xmlEntities);
  try {
    return {
      ast: (0, import_css_tree2.parse)(normalized.value, {
        context: "stylesheet",
        parseCustomProperty: true,
        positions: true
      }),
      normalized
    };
  } catch (error) {
    if (error instanceof Error) throw invalidCss2(`Unable to parse CSS: ${error.message}`);
    throw error;
  }
}
function namespaceSeparator2(encoded) {
  for (let index = encoded.length - 1; index >= 0; index--) {
    if (encoded[index] !== "|") continue;
    let backslashes = 0;
    for (let cursor = index - 1; cursor >= 0 && encoded[cursor] === "\\"; cursor--) {
      backslashes++;
    }
    if (backslashes % 2 === 0) return index;
  }
  return -1;
}
function stylesheetAttributeNames(source, xmlEntities) {
  const { ast } = parseStylesheet(source, xmlEntities);
  const names = /* @__PURE__ */ new Set();
  (0, import_css_tree2.walk)(ast, (node) => {
    if (node.type !== "AttributeSelector") return;
    const separator = namespaceSeparator2(node.name.name);
    names.add(import_css_tree2.ident.decode(node.name.name.slice(separator + 1)));
  });
  return names;
}
function selectorBoundary(scope) {
  const attribute = import_css_tree2.ident.encode(scope.attribute);
  const exact = `*|*[${attribute}=${import_css_tree2.string.encode(scope.value)}]`;
  return `:where(${exact},${exact} *|*)`;
}
function selectorInsertions(selector, boundary, subjectOnly, normalized, xmlEntities) {
  const location = selector.loc;
  if (location === void 0) throw invalidCss2("CSS selector has no source position");
  const children = selector.children.toArray();
  let lastCombinator = -1;
  for (const [index, child] of children.entries()) {
    if (child.type === "Combinator") lastCombinator = index;
  }
  const relative2 = children[0]?.type === "Combinator";
  const suffixNode = children.slice(lastCombinator + 1).find((child) => child.type === "PseudoElementSelector");
  const encodedBoundary = xmlEntities ? escapeCssXmlText(boundary) : boundary;
  const replacements = [];
  if (!subjectOnly && !relative2) {
    const leading = children[0];
    const normalizedOffset = leading?.type === "TypeSelector" || leading?.type === "NestingSelector" ? leading.loc?.end.offset ?? location.start.offset : location.start.offset;
    const start = normalized.offsets[normalizedOffset];
    if (start === void 0) throw invalidCss2("CSS selector start position is invalid");
    replacements.push({ start, end: start, value: encodedBoundary });
  }
  if (subjectOnly || relative2 || lastCombinator >= 0) {
    const normalizedOffset = suffixNode?.loc?.start.offset ?? location.end.offset;
    const end = normalized.offsets[normalizedOffset];
    if (end === void 0) throw invalidCss2("CSS selector subject position is invalid");
    replacements.push({ start: end, end, value: encodedBoundary });
  }
  return replacements;
}
function isKeyframes(name) {
  return name === "keyframes" || /^-[a-z]+-keyframes$/.test(name);
}
function scopeStylesheet(source, scope, xmlEntities) {
  const { ast, normalized } = parseStylesheet(source, xmlEntities);
  const boundary = selectorBoundary(scope);
  const rootReplacement = `[${import_css_tree2.ident.encode(scope.attribute)}]`;
  const zeroSpecificityRootReplacement = `:where(${rootReplacement})`;
  const rootReplacements = [];
  const selectorReplacements = [];
  const atRules = [];
  (0, import_css_tree2.walk)(ast, {
    enter(node) {
      if (node.type === "Atrule") {
        atRules.push(normalizedCssKeyword(node.name));
        return;
      }
      if (node.type !== "Rule" || node.prelude.type !== "SelectorList" || atRules.some(isKeyframes)) {
        return;
      }
      const nestedRule = this.rule !== null;
      for (const selector of node.prelude.children) {
        if (selector.type !== "Selector") continue;
        (0, import_css_tree2.walk)(selector, (selectorNode) => {
          const keyword = selectorNode.type === "PseudoClassSelector" && selectorNode.children === null ? normalizedCssKeyword(selectorNode.name) : void 0;
          if (keyword === "root" || keyword === "scope" && !atRules.includes("scope") || selectorNode.type === "NestingSelector" && !nestedRule) {
            rootReplacements.push(
              cssReplacement(
                normalized,
                selectorNode,
                selectorNode.type === "NestingSelector" ? zeroSpecificityRootReplacement : rootReplacement,
                xmlEntities
              )
            );
          }
        });
        selectorReplacements.push(
          ...selectorInsertions(selector, boundary, nestedRule, normalized, xmlEntities)
        );
        (0, import_css_tree2.walk)(selector, {
          visit: "Selector",
          enter(nestedSelector) {
            if (nestedSelector === selector) return;
            const relativePseudo = this.function?.type === "PseudoClassSelector" && normalizedCssKeyword(this.function.name) === "has";
            selectorReplacements.push(
              ...selectorInsertions(
                nestedSelector,
                boundary,
                relativePseudo,
                normalized,
                xmlEntities
              )
            );
          }
        });
      }
    },
    leave(node) {
      if (node.type === "Atrule") atRules.pop();
    }
  });
  return applyCssReplacements(source, [...rootReplacements, ...selectorReplacements]);
}

// src/archive/svg-css.ts
var IDREF_LIST_ATTRIBUTES = /* @__PURE__ */ new Set([
  "aria-controls",
  "aria-describedby",
  "aria-labelledby",
  "aria-owns",
  "headers"
]);
var SINGLE_IDREF_ATTRIBUTES = /* @__PURE__ */ new Set(["aria-activedescendant", "aria-details", "for"]);
var CSS_VALUE_ATTRIBUTES = /^(clip-path|cursor|fill|filter|marker(?:-(end|mid|start))?|mask|stroke)$/;
function invalidCss3(message) {
  return new InputValidationError([{ path: "theme.svg.style", message }]);
}
function rewriteFragment(value, ids) {
  if (!value.startsWith("#")) return value;
  const mapped = ids.get(value.slice(1));
  return mapped === void 0 ? value : `#${mapped}`;
}
function rewriteIdList(value, ids) {
  return value.replace(/[^\s]+/g, (id) => ids.get(id) ?? id);
}
function rewriteTiming(value, ids) {
  const candidates = [...ids.keys()].sort((left, right) => right.length - left.length);
  return value.replace(/[^;]+/g, (timing) => {
    const leading = timing.match(/^\s*/)?.[0] ?? "";
    const trailing = timing.match(/\s*$/)?.[0] ?? "";
    const core = timing.slice(leading.length, timing.length - trailing.length);
    const id = candidates.find((candidate) => core.startsWith(`${candidate}.`));
    if (id === void 0) return timing;
    return `${leading}${ids.get(id) ?? id}${core.slice(id.length)}${trailing}`;
  });
}
function rewriteReferenceAttribute(name, value, ids) {
  if (name === "id") return ids.get(value) ?? value;
  if (name === "href" || name === "xlink:href") return rewriteFragment(value, ids);
  if (IDREF_LIST_ATTRIBUTES.has(name)) return rewriteIdList(value, ids);
  if (SINGLE_IDREF_ATTRIBUTES.has(name)) return ids.get(value) ?? value;
  if (name === "begin" || name === "end") return rewriteTiming(value, ids);
  return void 0;
}
function addReplacement(replacements, normalized, node, value, xmlText) {
  replacements.push(cssReplacement(normalized, node, value, xmlText));
}
function collectReplacement(replacements, normalized, node, ids, selectors, xmlText, attributes, namespaces) {
  if (node.type === "Raw" && /#|url\s*\(/i.test(node.value)) {
    throw invalidCss3("Unsupported raw CSS contains an ID reference");
  }
  if (selectors && node.type === "IdSelector") {
    const mapped = ids.get(import_css_tree3.ident.decode(node.name));
    if (mapped !== void 0) {
      addReplacement(replacements, normalized, node, `#${import_css_tree3.ident.encode(mapped)}`, xmlText);
    }
    return;
  }
  if (node.type === "Url") {
    if (namespaces.declarationUrls.has(node)) return;
    const mapped = rewriteFragment(node.value, ids);
    if (mapped !== node.value) {
      addReplacement(replacements, normalized, node, import_css_tree3.url.encode(mapped), xmlText);
    }
    return;
  }
  if (!selectors || node.type !== "AttributeSelector" || node.value === null) {
    return;
  }
  const rewrite = rewriteAttributeSelector(node, attributes, namespaces);
  if (rewrite.kind === "unsupported") throw invalidCss3(rewrite.message);
  if (rewrite.kind === "selector") {
    addReplacement(replacements, normalized, node, rewrite.value, xmlText);
  }
}
function namespaceInsertionOffset(ast) {
  if (ast.type !== "StyleSheet") return 0;
  let preImportOffset = 0;
  let importOffset;
  for (const node of ast.children) {
    if (node.type !== "Atrule") break;
    const name = normalizedCssKeyword(node.name);
    const allowed = name === "charset" || name === "import" || name === "layer" && node.block === null;
    if (!allowed) break;
    const end = node.loc?.end.offset;
    if (end === void 0) continue;
    if (name === "import") {
      importOffset = end;
    } else if (importOffset === void 0) {
      preImportOffset = end;
    }
  }
  return importOffset ?? preImportOffset;
}
function rewriteCss(source, ids, context, xmlEntities, attributes) {
  const normalized = normalizeCssSource(source, xmlEntities);
  let ast;
  try {
    ast = (0, import_css_tree3.parse)(normalized.value, { context, parseCustomProperty: true, positions: true });
  } catch (error) {
    if (error instanceof Error) throw invalidCss3(`Unable to parse CSS: ${error.message}`);
    throw error;
  }
  const replacements = [];
  const namespaces = cssNamespaceRegistry(ast);
  (0, import_css_tree3.walk)(
    ast,
    (node) => collectReplacement(
      replacements,
      normalized,
      node,
      ids,
      context === "stylesheet",
      xmlEntities,
      attributes,
      namespaces
    )
  );
  const namespaceRules = generatedNamespaceRules(namespaces);
  if (namespaceRules !== "") {
    const normalizedOffset = namespaceInsertionOffset(ast);
    const offset = normalized.offsets[normalizedOffset];
    if (offset === void 0) throw invalidCss3("CSS namespace insertion position is invalid");
    replacements.push({
      start: offset,
      end: offset,
      value: xmlEntities ? escapeCssXmlText(namespaceRules) : namespaceRules
    });
  }
  return applyCssReplacements(source, replacements);
}
function rewriteStylesheet(source, ids, attributes, scope, xmlEntities = true) {
  const rewritten = rewriteCss(source, ids, "stylesheet", xmlEntities, attributes);
  return scopeStylesheet(rewritten, scope, xmlEntities);
}
function rewriteCssAttribute(name, source, ids) {
  if (name === "style") return rewriteCss(source, ids, "declarationList", false, []);
  return CSS_VALUE_ATTRIBUTES.test(name) ? rewriteCss(source, ids, "value", false, []) : void 0;
}

// src/archive/svg-xml.ts
init_cjs_shims();
var import_saxes = require("saxes");
init_errors();
var SVG_NAMESPACE = "http://www.w3.org/2000/svg";
var ATTRIBUTE_PATTERN = /(\s)([^\s=/>]+)(\s*=\s*)(["'])([\s\S]*?)\4/g;
function invalidXml(message) {
  return new InputValidationError([{ path: "theme.svg", message }]);
}
function findMarkupEnd(source, start, declaration) {
  let quote;
  let subsetDepth = 0;
  for (let index = start; index < source.length; index++) {
    const character = source[index];
    if (quote !== void 0) {
      if (character === quote) quote = void 0;
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (declaration && character === "[") subsetDepth++;
    else if (declaration && character === "]") subsetDepth = Math.max(0, subsetDepth - 1);
    else if (character === ">" && subsetDepth === 0) return index + 1;
  }
  return source.length;
}
function scanMarkup(source) {
  const tokens = [];
  let cursor = 0;
  while (cursor < source.length) {
    const opening = source.indexOf("<", cursor);
    if (opening < 0) {
      tokens.push({ kind: "text", source: source.slice(cursor) });
      break;
    }
    if (opening > cursor) tokens.push({ kind: "text", source: source.slice(cursor, opening) });
    if (source.startsWith("<!--", opening)) {
      const close = source.indexOf("-->", opening + 4);
      const end2 = close < 0 ? source.length : close + 3;
      tokens.push({ kind: "comment", source: source.slice(opening, end2) });
      cursor = end2;
      continue;
    }
    if (source.startsWith("<![CDATA[", opening)) {
      const close = source.indexOf("]]>", opening + 9);
      const end2 = close < 0 ? source.length : close + 3;
      tokens.push({
        kind: "cdata",
        source: source.slice(opening, end2),
        content: source.slice(opening + 9, close < 0 ? source.length : close)
      });
      cursor = end2;
      continue;
    }
    if (source.startsWith("<?", opening)) {
      const close = source.indexOf("?>", opening + 2);
      const end2 = close < 0 ? source.length : close + 2;
      const tokenSource = source.slice(opening, end2);
      tokens.push({
        kind: /^<\?xml(?:\s|\?>)/.test(tokenSource) ? "declaration" : "pi",
        source: tokenSource
      });
      cursor = end2;
      continue;
    }
    if (source.startsWith("<!", opening)) {
      const end2 = findMarkupEnd(source, opening + 2, true);
      tokens.push({ kind: "doctype", source: source.slice(opening, end2) });
      cursor = end2;
      continue;
    }
    const end = findMarkupEnd(source, opening + 1, false);
    const tag = source.slice(opening, end);
    const match = /^<\s*(\/?)\s*([^\s/>]+)/.exec(tag);
    if (match === null || match[2] === void 0) {
      tokens.push({ kind: "text", source: tag });
      cursor = end;
      continue;
    }
    tokens.push({
      kind: match[1] === "/" ? "close" : "open",
      source: tag,
      name: match[2]
    });
    cursor = end;
  }
  return tokens;
}
function semanticElements(source) {
  const elements = [];
  const parser = new import_saxes.SaxesParser({ xmlns: true });
  parser.on("opentag", (tag) => {
    const attributes = new Map(
      Object.values(tag.attributes).map((attribute) => [
        attribute.name,
        {
          name: attribute.name,
          local: attribute.local,
          prefix: attribute.prefix,
          uri: attribute.uri,
          value: attribute.value
        }
      ])
    );
    elements.push({
      name: tag.name,
      local: tag.local,
      uri: tag.uri,
      selfClosing: tag.isSelfClosing,
      attributes
    });
  });
  try {
    parser.write(source).close();
  } catch (error) {
    if (error instanceof Error) throw invalidXml(`Malformed SVG XML: ${error.message}`);
    throw error;
  }
  return elements;
}
function parseSvgDocument(source) {
  const tokens = scanMarkup(source);
  const elements = semanticElements(source);
  const lexicalOpenCount = tokens.filter((token) => token.kind === "open").length;
  if (lexicalOpenCount !== elements.length) throw invalidXml("Unable to align SVG XML tokens");
  const root = elements[0];
  if (root === void 0 || root.local !== "svg" || root.uri !== SVG_NAMESPACE) {
    throw invalidXml("Theme output must have an SVG namespace document element");
  }
  return { tokens, elements };
}
function escapeAttributeValue(value, quote) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(quote, quote === '"' ? "&quot;" : "&apos;");
}
function rewriteTagAttributes(source, element, rewrite) {
  return source.replace(
    ATTRIBUTE_PATTERN,
    (attribute, space, name, equals, quote) => {
      const semantic = element.attributes.get(name);
      if (semantic === void 0) return attribute;
      const value = rewrite(semantic);
      return value === void 0 ? attribute : `${space}${name}${equals}${quote}${escapeAttributeValue(value, quote)}${quote}`;
    }
  );
}
function setRootAttribute(source, element, name, value) {
  const current = [...element.attributes.values()].find(
    (attribute) => attribute.prefix === "" && attribute.local === name
  );
  if (current !== void 0) {
    return rewriteTagAttributes(
      source,
      element,
      (attribute) => attribute.name === current.name ? value : void 0
    );
  }
  const closingLength = /\/\s*>$/.test(source) ? 2 : 1;
  return `${source.slice(0, -closingLength)} ${name}="${value}"${source.slice(-closingLength)}`;
}
function setRootCoordinate(source, element, name, value) {
  return setRootAttribute(source, element, name, String(value));
}

// src/archive/svg-composition.ts
var XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";
var ROW_SCOPE_ATTRIBUTE = "data-maeul-archive-scope";
function timingSafeId(prefix, id) {
  const encoded = [...id].map((character) => (character.codePointAt(0) ?? 0).toString(16)).join("_");
  return `${prefix.replaceAll("-", "_")}smil_${encoded}`;
}
function unqualifiedAttribute(element, name) {
  return [...element.attributes.values()].find(
    (attribute) => attribute.prefix === "" && attribute.local === name
  );
}
function referenceAttributeName(attribute) {
  if (attribute.prefix === "") return attribute.local;
  if (attribute.uri === XLINK_NAMESPACE && attribute.local === "href") return "xlink:href";
  return void 0;
}
function createIdMap(elements, prefix) {
  const originalIds = elements.map((element) => unqualifiedAttribute(element, "id")?.value).filter((id) => id !== void 0);
  const timingValues = elements.flatMap(
    (element) => ["begin", "end"].map((name) => unqualifiedAttribute(element, name)?.value).filter((value) => value !== void 0)
  );
  return new Map(
    originalIds.map((id) => [
      id,
      timingValues.some(
        (value) => value.split(";").some((timing) => timing.trim().startsWith(`${id}.`))
      ) ? timingSafeId(prefix, id) : `${prefix}${id}`
    ])
  );
}
function createAttributeStates(elements, ids) {
  return elements.flatMap(
    (element) => [...element.attributes.values()].map((attribute) => {
      const name = referenceAttributeName(attribute);
      const rewritten = name === void 0 ? attribute.value : rewriteReferenceAttribute(name, attribute.value, ids) ?? rewriteCssAttribute(name, attribute.value, ids) ?? attribute.value;
      return {
        namespace: attribute.uri,
        local: attribute.local,
        original: attribute.value,
        rewritten
      };
    })
  );
}
function rewriteOpenTag(source, element, ids) {
  return rewriteTagAttributes(source, element, (attribute) => {
    const name = referenceAttributeName(attribute);
    if (name === void 0) return void 0;
    const reference = rewriteReferenceAttribute(name, attribute.value, ids);
    return reference ?? rewriteCssAttribute(name, attribute.value, ids);
  });
}
function isStyleElement(element) {
  return element?.local === "style" && element.uri === SVG_NAMESPACE;
}
function stylesheetSources(document2) {
  const sources = [];
  const stack = [];
  let elementIndex = 0;
  for (const token of document2.tokens) {
    if (token.kind === "close") {
      stack.pop();
      continue;
    }
    if (token.kind === "open") {
      const element = document2.elements[elementIndex];
      elementIndex++;
      if (element !== void 0 && !element.selfClosing) stack.push(element);
      continue;
    }
    if (!isStyleElement(stack.at(-1))) continue;
    if (token.kind === "text") sources.push({ source: token.source, xmlEntities: true });
    if (token.kind === "cdata") sources.push({ source: token.content, xmlEntities: false });
  }
  return sources;
}
function createRowScope(document2, prefix) {
  const stylesheets = stylesheetSources(document2);
  if (stylesheets.length === 0) return void 0;
  const reserved = new Set(
    document2.elements.flatMap(
      (element) => [...element.attributes.values()].map((attribute2) => attribute2.local)
    )
  );
  for (const stylesheet of stylesheets) {
    for (const name of stylesheetAttributeNames(stylesheet.source, stylesheet.xmlEntities)) {
      reserved.add(name);
    }
  }
  let attribute = ROW_SCOPE_ATTRIBUTE;
  let index = 1;
  while (reserved.has(attribute)) {
    attribute = `${ROW_SCOPE_ATTRIBUTE}-${index}`;
    index++;
  }
  return { attribute, value: prefix };
}
function namespaceAndPositionSvg(source, prefix, x, y) {
  const document2 = parseSvgDocument(source);
  const ids = createIdMap(document2.elements, prefix);
  const attributes = createAttributeStates(document2.elements, ids);
  const scope = createRowScope(document2, prefix);
  const stack = [];
  let elementIndex = 0;
  let positioned = false;
  return document2.tokens.map((token) => {
    if (token.kind === "declaration" || token.kind === "doctype") return "";
    if (token.kind === "text") {
      return isStyleElement(stack.at(-1)) && scope !== void 0 ? rewriteStylesheet(token.source, ids, attributes, scope) : token.source;
    }
    if (token.kind === "cdata") {
      return isStyleElement(stack.at(-1)) && scope !== void 0 ? serializeCssCdata(rewriteStylesheet(token.content, ids, attributes, scope, false)) : token.source;
    }
    if (token.kind === "close") {
      stack.pop();
      return token.source;
    }
    if (token.kind !== "open") return token.source;
    const element = document2.elements[elementIndex];
    elementIndex++;
    if (element === void 0) return token.source;
    let rewritten = rewriteOpenTag(token.source, element, ids);
    if (!positioned && element.local === "svg" && element.uri === SVG_NAMESPACE) {
      rewritten = setRootCoordinate(
        setRootCoordinate(rewritten, element, "x", x),
        element,
        "y",
        y
      );
      if (scope !== void 0) {
        rewritten = setRootAttribute(rewritten, element, scope.attribute, scope.value);
      }
      positioned = true;
    }
    if (!element.selfClosing) stack.push(element);
    return rewritten;
  }).join("");
}

// src/archive/comparison.ts
function renderArchiveComparison(archive, theme, source) {
  const width = 420;
  const header = 64;
  const rowHeight = 390;
  const snapshots = selectComparisonSnapshots(archive.snapshots, archive.comparison.years);
  const height = header + rowHeight * snapshots.length;
  const rows = snapshots.map((snapshot) => ({
    year: snapshot.year,
    svg: theme.render(snapshotToContributionData(snapshot), {
      title: snapshot.settings.title,
      width,
      height: 360,
      hemisphere: snapshot.settings.hemisphere,
      density: snapshot.settings.density,
      style: snapshot.settings.style,
      layout: "card",
      motion: snapshot.settings.motion,
      layoutSeed: snapshot.settings.layoutSeed,
      normalization: archive.comparison.normalization
    })
  }));
  const renderMode = (mode) => {
    const background = mode === "dark" ? "#0d1117" : "#ffffff";
    const foreground = mode === "dark" ? "#f0f6fc" : "#1f2328";
    const label = source === "shared-p90" ? "Pooled nonzero P90" : "Fixed common maximum";
    const legend = `${label}: ${archive.comparison.normalization.maxCount} contributions/day`;
    const username = snapshots[0]?.username ?? "";
    const body = rows.map((row, index) => {
      const top = header + index * rowHeight;
      const svg = namespaceAndPositionSvg(
        row.svg[mode],
        `archive-${mode}-${index}-`,
        0,
        top + 30
      );
      return `<text x="16" y="${top + 22}" font-size="18" font-weight="600">${row.year}</text>${svg}`;
    }).join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="archive-${mode}-title archive-${mode}-desc"><title id="archive-${mode}-title">${escapeXml(username)} annual village comparison</title><desc id="archive-${mode}-desc">${escapeXml(legend)}. Equal contribution counts use equal terrain heights.</desc><rect width="${width}" height="${height}" fill="${background}"/><g fill="${foreground}" font-family="Noto Sans KR, sans-serif"><text x="16" y="25" font-size="18">@${escapeXml(username)} \xB7 ${archive.comparison.years.join(", ")}</text><text x="16" y="49" font-size="12">${escapeXml(legend)}</text>${body}</g></svg>`;
  };
  return { dark: renderMode("dark"), light: renderMode("light") };
}

// src/archive.ts
function createArchiveGenerator(dependencies) {
  return async function generateArchive2(request) {
    const themeName = request.theme?.trim() || dependencies.getDefaultTheme();
    const theme = dependencies.getTheme(themeName);
    if (!theme)
      invalidOption(
        "theme",
        `Unknown theme "${themeName}". Available themes: ${dependencies.listThemes().join(", ")}`
      );
    const resolved = await resolveArchiveInput(request, dependencies);
    const directory = request.outputDir?.trim() || "./";
    const snapshots = resolved.archive.snapshots.map((snapshot) => ({
      ...snapshot,
      settings: resolveRenderSettings(
        resolved.explicit,
        resolved.config?.settings ?? snapshot.settings,
        snapshot.username
      )
    }));
    const archive = { ...resolved.archive, snapshots };
    const selectedSnapshots = selectComparisonSnapshots(snapshots, archive.comparison.years);
    const comparison = renderArchiveComparison(archive, theme, resolved.source);
    const generate = createTerrainGenerator(dependencies);
    const outputs = [];
    for (const snapshot of selectedSnapshots) {
      outputs.push(
        await generate({
          input: snapshot,
          theme: themeName,
          outputDir: (0, import_node_path2.join)(directory, String(snapshot.year)),
          format: request.format,
          scale: request.scale,
          writeSnapshot: true,
          onProgress: request.onProgress
        })
      );
    }
    await dependencies.makeDirectory(directory);
    const archivePath = (0, import_node_path2.join)(directory, "archive.json");
    const comparisonDarkPath = (0, import_node_path2.join)(directory, "maeul-in-the-sky-comparison-dark.svg");
    const comparisonLightPath = (0, import_node_path2.join)(directory, "maeul-in-the-sky-comparison-light.svg");
    await dependencies.writeFile(archivePath, serializeArchive(archive));
    await dependencies.writeFile(comparisonDarkPath, comparison.dark);
    await dependencies.writeFile(comparisonLightPath, comparison.light);
    return {
      archivePath,
      comparisonDarkPath,
      comparisonLightPath,
      years: archive.comparison.years,
      normalization: archive.comparison.normalization,
      outputs
    };
  };
}
var generateArchive = createArchiveGenerator(nodeGeneratorDependencies);

// src/preview/index.ts
init_cjs_shims();

// src/preview/server.ts
init_cjs_shims();
var import_node_http = require("http");
var import_node_url2 = require("url");
var import_node_path4 = require("path");

// src/preview/assets.ts
init_cjs_shims();
var import_promises6 = require("fs/promises");
var import_node_fs = require("fs");
var import_node_path3 = require("path");
var import_node_url = require("url");

// src/preview/errors.ts
init_cjs_shims();
var PreviewError = class extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
  name = "PreviewError";
};
function publicError(error) {
  if (error instanceof PreviewError) return error;
  if (error instanceof GitHubApiError) {
    switch (error.code) {
      case "auth":
        if (error.status === 403) {
          return new PreviewError(403, "forbidden", "GitHub denied access to this account.");
        }
        return new PreviewError(401, "auth", "Check the server GITHUB_TOKEN permissions.");
      case "notfound":
        return new PreviewError(404, "not_found", "GitHub account not found.");
      case "ratelimit":
        return new PreviewError(429, "rate_limit", "GitHub rate limit reached. Try again later.");
      case "timeout":
        return new PreviewError(504, "timeout", "GitHub request timed out. Try again.");
      case "aborted":
        return new PreviewError(503, "cancelled", "Preview request was cancelled.");
      case "http":
        return new PreviewError(
          error.status === 403 ? 403 : 502,
          "upstream",
          "GitHub request failed."
        );
      case "network":
      case "invalidresponse":
      case "configuration":
        return new PreviewError(502, "upstream", "GitHub data is temporarily unavailable.");
      default: {
        const exhaustive = error.code;
        return exhaustive;
      }
    }
  }
  return new PreviewError(500, "internal", "Unable to create this preview.");
}

// src/preview/assets.ts
var MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".webp": "image/webp"
};
function defaultAssetRoot() {
  const directory = (0, import_node_path3.dirname)((0, import_node_url.fileURLToPath)(importMetaUrl));
  const packaged = (0, import_node_path3.resolve)(directory, "demo");
  return (0, import_node_fs.existsSync)(packaged) ? packaged : (0, import_node_path3.resolve)(directory, "../../docs/demo");
}
function inside(root, path) {
  const rel = (0, import_node_path3.relative)(root, path);
  return rel !== ".." && !rel.startsWith(`..${import_node_path3.sep}`) && !(0, import_node_path3.isAbsolute)(rel);
}
async function serveAsset(root, rawPath, response) {
  let path;
  try {
    path = decodeURIComponent(rawPath.split("?")[0]);
  } catch (error) {
    if (error instanceof URIError) throw new PreviewError(400, "path", "Invalid asset path.");
    throw error;
  }
  if (!path.startsWith("/") || path.includes("\\") || path.includes("\0") || path.split("/").some((part) => part === ".." || part.startsWith("."))) {
    throw new PreviewError(403, "path", "Asset path is not allowed.");
  }
  const candidate = (0, import_node_path3.resolve)(root, `.${path.endsWith("/") ? `${path}index.html` : path}`);
  if (!inside(root, candidate)) throw new PreviewError(403, "path", "Asset path is not allowed.");
  try {
    const [realRoot, realFile] = await Promise.all([(0, import_promises6.realpath)(root), (0, import_promises6.realpath)(candidate)]);
    if (!inside(realRoot, realFile))
      throw new PreviewError(403, "path", "Asset path is not allowed.");
    const type = MIME[(0, import_node_path3.extname)(realFile)];
    if (!type || !(await (0, import_promises6.stat)(realFile)).isFile())
      throw new PreviewError(404, "not_found", "Asset not found.");
    const content = await (0, import_promises6.readFile)(realFile);
    response.writeHead(200, {
      "Content-Type": type,
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
    });
    response.end(content);
  } catch (error) {
    if (error instanceof Error && "code" in error && ["ENOENT", "ENOTDIR", "EACCES"].includes(String(error.code))) {
      throw new PreviewError(404, "not_found", "Asset not found.");
    }
    throw error;
  }
}

// src/preview/cache.ts
init_cjs_shims();
var PreviewCache = class {
  constructor(ttlMs, maxEntries, timeoutMs) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
    this.timeoutMs = timeoutMs;
  }
  cached = /* @__PURE__ */ new Map();
  pending = /* @__PURE__ */ new Map();
  closed = false;
  async get(key, signal, load) {
    if (this.closed || signal.aborted)
      throw new PreviewError(503, "cancelled", "Preview request was cancelled.");
    const hit = this.cached.get(key);
    if (hit && hit.expires > Date.now()) {
      this.cached.delete(key);
      this.cached.set(key, hit);
      return hit.value;
    }
    this.cached.delete(key);
    let entry = this.pending.get(key);
    if (!entry) {
      if (this.pending.size >= this.maxEntries)
        throw new PreviewError(503, "busy", "Too many pending previews. Try again shortly.");
      entry = this.begin(key, load);
    }
    return this.subscribe(entry, signal);
  }
  begin(key, load) {
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(new PreviewError(504, "timeout", "GitHub request timed out. Try again.")),
      this.timeoutMs
    );
    const interrupted = new Promise((_resolve, reject) => {
      controller.signal.addEventListener("abort", () => reject(controller.signal.reason), {
        once: true
      });
    });
    const promise = Promise.race([
      Promise.resolve().then(() => load(controller.signal)),
      interrupted
    ]).then((value) => {
      if (!controller.signal.aborted && !this.closed && this.ttlMs > 0) {
        this.cached.set(key, { value, expires: Date.now() + this.ttlMs });
        while (this.cached.size > this.maxEntries) {
          const oldest = this.cached.keys().next().value;
          if (oldest !== void 0) this.cached.delete(oldest);
        }
      }
      return value;
    }).finally(() => {
      clearTimeout(timer);
      if (this.pending.get(key)?.controller === controller) this.pending.delete(key);
      controller.abort();
    });
    const entry = { controller, promise, waiters: 0 };
    this.pending.set(key, entry);
    return entry;
  }
  async subscribe(entry, signal) {
    entry.waiters++;
    let rejectAbort = () => {
    };
    const interrupted = new Promise((_resolve, reject) => {
      rejectAbort = () => reject(new PreviewError(503, "cancelled", "Preview request was cancelled."));
      signal.addEventListener("abort", rejectAbort, { once: true });
      if (signal.aborted) rejectAbort();
    });
    try {
      return await Promise.race([entry.promise, interrupted]);
    } finally {
      signal.removeEventListener("abort", rejectAbort);
      entry.waiters--;
      if (entry.waiters === 0)
        entry.controller.abort(
          new PreviewError(503, "cancelled", "Preview request was cancelled.")
        );
    }
  }
  close() {
    this.closed = true;
    this.cached.clear();
    for (const entry of this.pending.values())
      entry.controller.abort(new PreviewError(503, "shutdown", "Preview server is closing."));
    this.pending.clear();
  }
};

// src/preview/data.ts
init_cjs_shims();
var import_zod7 = require("zod");
init_resolve();
init_schema();
var requestSchema = import_zod7.z.strictObject({
  username: usernameSchema,
  year: import_zod7.z.number().int().min(2008).max(9999).optional(),
  settings: renderSettingsInputSchema.optional()
});
function parsePreviewRequest(input) {
  const result = requestSchema.safeParse(input);
  if (!result.success) {
    const path = result.error.issues[0]?.path.join(".") || "request";
    throw new PreviewError(400, "invalid_request", `Invalid ${path}. Check the preview settings.`);
  }
  if (result.data.year !== void 0 && result.data.year > (/* @__PURE__ */ new Date()).getUTCFullYear()) {
    throw new PreviewError(
      400,
      "invalid_request",
      "Invalid year. Choose a year up to the current year."
    );
  }
  return {
    ...result.data,
    settings: resolveRenderSettings(result.data.settings, {}, result.data.username)
  };
}
async function createPreviewResponse(data, request, fetchedAt) {
  const snapshot = createSnapshot(data, request.settings, { kind: "github", fetchedAt });
  const verified = snapshotToContributionData(snapshot);
  const { renderTerrain: renderTerrain2 } = await Promise.resolve().then(() => (init_terrain(), terrain_exports));
  const rendered = renderTerrain2(verified, { ...snapshot.settings, width: 840, height: 240 });
  return { snapshot, metadata: rendered.metadata };
}

// src/preview/http.ts
init_cjs_shims();
function sendJson(response, status, body) {
  if (response.destroyed || response.writableEnded) return;
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer"
  });
  response.end(JSON.stringify(body));
}
function sendError(response, error) {
  const safe = publicError(error);
  sendJson(response, safe.status, { error: { code: safe.code, message: safe.message } });
}
function checkOrigin(request, origin) {
  const expectedHost = new URL(origin).host;
  const headerNames = request.rawHeaders.filter((_value, index) => index % 2 === 0).map((name) => name.toLowerCase());
  if (headerNames.filter((name) => name === "host").length !== 1 || headerNames.filter((name) => name === "origin").length > 1 || request.headers.host !== expectedHost || request.headers.origin !== void 0 && request.headers.origin !== origin || request.headers["sec-fetch-site"] !== void 0 && !["same-origin", "none"].includes(String(request.headers["sec-fetch-site"]))) {
    throw new PreviewError(403, "origin", "Use the local preview address from this server.");
  }
}
async function readJson(request) {
  if (!/^application\/json(?:\s*;\s*charset=utf-8)?$/i.test(request.headers["content-type"] ?? "")) {
    throw new PreviewError(415, "content_type", "Send application/json.");
  }
  if (request.headers["content-encoding"] && request.headers["content-encoding"] !== "identity") {
    throw new PreviewError(415, "content_encoding", "Compressed request bodies are not supported.");
  }
  const limit = 16 * 1024;
  if (Number(request.headers["content-length"]) > limit) {
    throw new PreviewError(413, "body_too_large", "Request body exceeds 16 KiB.");
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of request.iterator({ destroyOnReturn: false })) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk));
    size += buffer.length;
    if (size > limit) throw new PreviewError(413, "body_too_large", "Request body exceeds 16 KiB.");
    chunks.push(buffer);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch (error) {
    if (error instanceof SyntaxError)
      throw new PreviewError(400, "invalid_json", "Send valid JSON.");
    throw error;
  }
}

// src/preview/server.ts
function bounded(value, min, max, field) {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new PreviewError(400, "configuration", `Invalid preview ${field}.`);
  }
  return value;
}
function createPreviewServer(options = {}) {
  const host = options.host ?? "127.0.0.1";
  if (host !== "127.0.0.1" && host !== "::1") {
    throw new PreviewError(
      400,
      "configuration",
      "Preview host must be a loopback address (127.0.0.1 or ::1)."
    );
  }
  const port = bounded(options.port ?? 4318, 0, 65535, "port");
  const timeoutMs = bounded(options.requestTimeoutMs ?? 3e4, 1, 12e4, "timeout");
  const cache = new PreviewCache(
    bounded(options.cacheTtlMs ?? 3e5, 0, 3e5, "cache TTL"),
    bounded(options.cacheMaxEntries ?? 32, 1, 32, "cache size"),
    timeoutMs
  );
  const assetRoot = options.assetRoot instanceof URL ? (0, import_node_url2.fileURLToPath)(options.assetRoot) : (0, import_node_path4.resolve)(options.assetRoot ?? defaultAssetRoot());
  const token = (options.token ?? process.env.GITHUB_TOKEN)?.trim();
  const fetchData = options.fetchContributions ?? fetchContributions;
  const active = /* @__PURE__ */ new Set();
  let origin = "";
  let closed = false;
  let listening;
  let closing;
  async function route(request, response, signal) {
    checkOrigin(request, origin);
    if (closed) throw new PreviewError(503, "shutdown", "Preview server is closing.");
    switch (request.url) {
      case "/api/health":
        if (request.method !== "GET")
          throw new PreviewError(405, "method", "Use GET for server health.");
        sendJson(response, 200, { status: "ok", capabilities: { github: Boolean(token) } });
        return;
      case "/api/preview": {
        if (request.method !== "POST")
          throw new PreviewError(405, "method", "Use POST for account preview.");
        const input = parsePreviewRequest(await readJson(request));
        if (!token)
          throw new PreviewError(
            503,
            "missing_token",
            "Start the local preview server with GITHUB_TOKEN set in its environment."
          );
        const key = JSON.stringify([input.username.toLowerCase(), input.year ?? "rolling"]);
        const fetched = await cache.get(key, signal, async (fetchSignal) => ({
          data: await fetchData(input.username, input.year, token, { signal: fetchSignal }),
          fetchedAt: (/* @__PURE__ */ new Date()).toISOString()
        }));
        if (signal.aborted) return;
        sendJson(
          response,
          200,
          await createPreviewResponse(fetched.data, input, fetched.fetchedAt)
        );
        return;
      }
      default:
        if (request.url?.startsWith("/api/"))
          throw new PreviewError(404, "not_found", "API route not found.");
        if (request.method !== "GET")
          throw new PreviewError(405, "method", "Use GET for demo assets.");
        await serveAsset(assetRoot, request.url ?? "/", response);
    }
  }
  const server = (0, import_node_http.createServer)((request, response) => {
    const controller = new AbortController();
    active.add(controller);
    const timer = setTimeout(() => {
      controller.abort();
      response.shouldKeepAlive = false;
      sendError(response, new PreviewError(504, "timeout", "Preview request timed out."));
    }, timeoutMs);
    const disconnect = () => {
      clearTimeout(timer);
      active.delete(controller);
      controller.abort();
      if (!request.complete) request.destroy();
    };
    response.once("close", disconnect);
    void route(request, response, controller.signal).catch((error) => {
      response.shouldKeepAlive = false;
      sendError(response, error);
      request.resume();
    }).finally(() => clearTimeout(timer));
  });
  server.headersTimeout = Math.max(timeoutMs, 1e3);
  server.requestTimeout = timeoutMs;
  server.keepAliveTimeout = 1e3;
  function listen() {
    if (closed)
      return Promise.reject(new PreviewError(503, "shutdown", "Preview server is closed."));
    if (listening) return listening;
    listening = new Promise((accept, reject) => {
      const failed = (error) => {
        server.removeListener("listening", ready);
        reject(error);
      };
      const ready = () => {
        server.removeListener("error", failed);
        const address = server.address();
        if (!address || typeof address === "string") {
          reject(new PreviewError(500, "listen", "Preview server did not bind a TCP address."));
          return;
        }
        origin = `http://${host === "::1" ? "[::1]" : host}:${address.port}`;
        accept({ host, port: address.port, url: origin });
      };
      server.once("error", failed);
      server.once("listening", ready);
      server.listen(port, host);
    });
    return listening;
  }
  function close() {
    if (closing) return closing;
    closed = true;
    cache.close();
    for (const controller of active) controller.abort();
    closing = Promise.allSettled(listening ? [listening] : []).then(
      () => new Promise((accept, reject) => {
        server.close((error) => {
          if (error && (!("code" in error) || error.code !== "ERR_SERVER_NOT_RUNNING"))
            reject(error);
          else accept();
        });
        server.closeAllConnections();
      })
    );
    return closing;
  }
  return { server, listen, close };
}
async function startPreviewServer(options = {}) {
  const handle = createPreviewServer(options);
  try {
    return { ...handle, ...await handle.listen() };
  } catch (error) {
    await handle.close();
    throw error;
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ASSET_CATALOG,
  ASSET_CATALOG_COUNTS,
  DEFAULT_VILLAGE_PRESET,
  EPIC_CATALOG,
  EPIC_CATALOG_COUNTS,
  GitHubApiError,
  InputValidationError,
  VILLAGE_PRESETS,
  computeSharedNormalization,
  computeStats,
  createArchive,
  createArchiveGenerator,
  createPreviewServer,
  createSnapshot,
  createTerrainGenerator,
  fetchContributions,
  generateArchive,
  generateTerrain,
  getAssetCatalogEntry,
  getEpicCatalogEntry,
  getTheme,
  isAssetType,
  isEpicBuildingType,
  isVillagePreset,
  listThemes,
  parseArchive,
  parseSettings,
  parseSnapshot,
  prepareTerrainScene,
  registerTheme,
  renderCatalogAsset,
  renderPng,
  renderTerrain,
  renderTerrainScene,
  resolveRenderSettings,
  selectComparisonSnapshots,
  serializeArchive,
  serializeSettings,
  serializeSnapshot,
  snapshotToContributionData,
  startPreviewServer,
  upsertArchiveSnapshot
});
//# sourceMappingURL=lib.cjs.map