// types.ts

export type MediaType = "season" | "movie" | "special";

export interface MediaGroup {
    title: string;
    type?: MediaType; // "season" by default
    totalEpisodes: number;
    watchedEpisodes: number[]; 
    skippedEpisodes?: number[]; // For filler or dropped episodes
    customLabels?: string[]; // E.g., ["0", "1", "1.5"] - optional overrides
}

export interface TrackerData {
    groups: MediaGroup[]; // Renamed from columns to fit the new architecture
}