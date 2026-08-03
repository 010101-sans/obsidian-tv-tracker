// src/dataParser.ts
import { TrackerData, MediaGroup } from "./types";

export function parseTrackerData(jsonString: string): TrackerData | null {
    try {
        const raw = JSON.parse(jsonString) as Record<string, unknown>;
        if (!raw || typeof raw !== "object") return null;

        const rawGroups = (raw.groups || raw.columns) as unknown[];
        if (!Array.isArray(rawGroups)) return null;

        const groups: MediaGroup[] = rawGroups.map((item: unknown) => {
            const g = (item && typeof item === "object") ? item as Record<string, unknown> : {};
            
            return {
                title: typeof g.title === "string" ? g.title : "Untitled",
                type: (g.type === "movie" || g.type === "special") ? g.type : "season",
                totalEpisodes: typeof g.totalEpisodes === "number" ? g.totalEpisodes : 0,
                watchedEpisodes: Array.isArray(g.watchedEpisodes) ? (g.watchedEpisodes as number[]) : [],
                skippedEpisodes: Array.isArray(g.skippedEpisodes) ? (g.skippedEpisodes as number[]) : [],
                customLabels: Array.isArray(g.customLabels) ? (g.customLabels as string[]) : undefined
            };
        });

        return { groups };
    } catch {
        return null;
    }
}