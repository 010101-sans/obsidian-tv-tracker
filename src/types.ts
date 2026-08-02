// types.ts

export interface Column {
    title: string;
    totalEpisodes: number;
    watchedEpisodes: number[]; // Array of episode numbers that have been watched (e.g., [1, 2, 3])
}

export interface TrackerData {
    columns: Column[];
}