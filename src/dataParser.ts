// dataParser.ts
import { TrackerData, MediaGroup } from "./types";

export function parseTrackerData(source: string): TrackerData | null {
    try {
        const data = JSON.parse(source);

        if (!data || typeof data !== "object") {
            return null;
        }

        // Backwards compatibility: if they used 'columns', map it to 'groups'
        const rawGroups = data.groups || data.columns;

        if (!Array.isArray(rawGroups)) {
            return null;
        }

        const groups: MediaGroup[] = rawGroups.map(group => {
            return {
                title: group.title || "Unnamed",
                type: group.type || "season",
                totalEpisodes: typeof group.totalEpisodes === "number" ? group.totalEpisodes : 1,
                watchedEpisodes: Array.isArray(group.watchedEpisodes) ? group.watchedEpisodes : [],
                skippedEpisodes: Array.isArray(group.skippedEpisodes) ? group.skippedEpisodes : [],
                customLabels: Array.isArray(group.customLabels) ? group.customLabels : undefined
            };
        });

        return { groups };

    } catch (error) {
        console.error("TV Tracker Plugin: Failed to parse JSON block.", error);
        return null;
    }
}