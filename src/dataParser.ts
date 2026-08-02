// dataParser.ts
import { TrackerData } from "./types";

export function parseTrackerData(source: string): TrackerData | null {
    try {
        // 1. Attempt to parse the raw text as JSON
        const data = JSON.parse(source);

        // 2. Validate the structure
        if (!data || typeof data !== "object") {
            return null;
        }

        if (!Array.isArray(data.columns)) {
            return null;
        }

        // Optional: Ensure each column has the required defaults
        for (const col of data.columns) {
            if (!col.title) col.title = "Unnamed";
            if (typeof col.totalEpisodes !== "number") col.totalEpisodes = 0;
            if (!Array.isArray(col.watchedEpisodes)) col.watchedEpisodes = [];
        }

        return data as TrackerData;

    } catch (error) {
        // If it fails to parse (e.g., missing a comma in JSON), return null safely
        console.error("TV Tracker Plugin: Failed to parse JSON block.", error);
        return null;
    }
}