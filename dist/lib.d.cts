/** A single day's contribution data */
interface ContributionDay {
    /** ISO date string (YYYY-MM-DD) */
    date: string;
    /** Raw contribution count */
    count: number;
    /** GitHub's intensity level (0 = none, 4 = max) */
    level: 0 | 1 | 2 | 3 | 4;
}
/** Available contribution days in one Sunday–Saturday calendar week */
interface ContributionWeek {
    /** Available days, sorted by date; edge weeks may be partial */
    days: ContributionDay[];
    /** ISO date of the calendar week's Sunday */
    firstDay: string;
}
/** Computed statistics from contribution data */
interface ContributionStats {
    /** Total contributions in the requested range */
    total: number;
    /** Longest consecutive contribution streak (days) */
    longestStreak: number;
    /** Current active streak (days, 0 if broken) */
    currentStreak: number;
    /** Most active day of the week (e.g., "Wednesday") */
    mostActiveDay: string;
    /** Number of days with at least one contribution */
    activeDays: number;
    /** Most active calendar month in YYYY-MM format, or empty when inactive */
    busiestMonth: string;
    /** First available contribution date in YYYY-MM-DD format */
    fromDate: string;
    /** Last available contribution date in YYYY-MM-DD format */
    toDate: string;
}
/** Complete contribution data for a requested calendar range */
interface ContributionData {
    /** Sunday-based calendar weeks, typically 52 or 53 */
    weeks: ContributionWeek[];
    /** Computed statistics */
    stats: ContributionStats;
    /** Effective year used for deterministic terrain variants */
    year: number;
    /** GitHub username */
    username: string;
}
/** Options passed to theme renderers */
interface ThemeOptions {
    /** Title text displayed in the SVG */
    title: string;
    /** SVG viewBox width (default: 840) */
    width: number;
    /** SVG viewBox height (default: 240) */
    height: number;
    /** Hemisphere for seasonal terrain (default: 'north') */
    hemisphere?: 'north' | 'south';
    /** Building density 1-10 (default: 5, higher = buildings at lower activity) */
    density?: number;
}
/** Rendered SVG output for both color modes */
interface ThemeOutput {
    /** SVG string for dark mode (GitHub dark: #0d1117) */
    dark: string;
    /** SVG string for light mode (GitHub light: #ffffff) */
    light: string;
}
/** Theme renderer interface — each theme must implement this */
interface Theme {
    /** Unique theme identifier (e.g., "terrain") */
    name: string;
    /** Human-readable display name */
    displayName: string;
    /** Brief description */
    description: string;
    /** Render contribution data into dark and light SVGs */
    render(data: ContributionData, options: ThemeOptions): ThemeOutput;
}
/** GitHub color mode */
type ColorMode = 'dark' | 'light';

/**
 * GitHub GraphQL API client for fetching contribution data
 */

/**
 * Fetch GitHub contribution data for a specific user.
 *
 * When `year` is provided, fetches the full calendar year (Jan 1 – Dec 31).
 * When `year` is omitted, fetches a rolling 52-week window ending today,
 * matching GitHub's own profile contribution graph.
 *
 * @param username - GitHub username
 * @param year - Optional year to fetch. Omit for rolling 52 weeks.
 * @param token - Optional GitHub personal access token (required for private profiles)
 * @returns Promise resolving to ContributionData
 * @throws Error if user not found, rate limited, or network failure
 */
declare function fetchContributions(username: string, year?: number, token?: string): Promise<ContributionData>;

/**
 * Computes contribution statistics from weekly contribution data.
 *
 * @param weeks - Sunday-based contribution weeks; edge weeks may be partial
 * @returns Computed statistics including total, streaks, and most active day
 */
declare function computeStats(weeks: ContributionWeek[]): ContributionStats;

declare const VILLAGE_PRESETS: {
    readonly nature: {
        readonly displayName: "Nature";
        readonly description: "Fewer buildings, with more forests and open terrain";
        readonly density: 2;
    };
    readonly balanced: {
        readonly displayName: "Balanced";
        readonly description: "A mix of nature, farms, villages, and cities";
        readonly density: 5;
    };
    readonly civilization: {
        readonly displayName: "Civilization";
        readonly description: "More buildings across everyday contribution levels";
        readonly density: 9;
    };
};
type VillagePreset = keyof typeof VILLAGE_PRESETS;
declare const DEFAULT_VILLAGE_PRESET: VillagePreset;
declare function isVillagePreset(value: string): value is VillagePreset;

interface TerrainGenerationRequest {
    username: string;
    token?: string;
    theme?: string;
    title?: string;
    outputDir?: string;
    year?: string | number;
    hemisphere?: string;
    preset?: string;
    density?: string | number;
    onProgress?: (message: string) => void;
}
interface TerrainGenerationResult {
    darkPath: string;
    lightPath: string;
    themeName: string;
    themeDisplayName: string;
    presetName: VillagePreset;
    density: number;
}
declare const generateTerrain: (request: TerrainGenerationRequest) => Promise<TerrainGenerationResult>;

/**
 * Register a theme in the global registry
 * @param theme - Theme to register
 */
declare function registerTheme(theme: Theme): void;
/**
 * Retrieve a theme by its unique name
 * @param name - Theme identifier
 * @returns The theme, or undefined if not found
 */
declare function getTheme(name: string): Theme | undefined;
/**
 * List all registered theme names
 * @returns Array of theme identifiers
 */
declare function listThemes(): string[];

export { type ColorMode, type ContributionData, type ContributionDay, type ContributionStats, type ContributionWeek, DEFAULT_VILLAGE_PRESET, type TerrainGenerationRequest, type TerrainGenerationResult, type Theme, type ThemeOptions, type ThemeOutput, VILLAGE_PRESETS, type VillagePreset, computeStats, fetchContributions, generateTerrain, getTheme, isVillagePreset, listThemes, registerTheme };
