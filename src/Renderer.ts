// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";

export function renderTracker(
    el: HTMLElement, 
    data: TrackerData, 
    ctx: MarkdownPostProcessorContext,
    onUpdate: (groupIndex: number, episode: number) => void
) {
    // 1. Find the absolute maximum number of episodes across all columns
    let maxEpisodes = 0;
    data.groups.forEach(group => {
        if (group.totalEpisodes > maxEpisodes) {
            maxEpisodes = group.totalEpisodes;
        }
    });

    // 2. Build the table containers
    const container = el.createEl("div", { cls: "tv-tracker-container" });
    const table = container.createEl("table", { cls: "tv-tracker-table" });

    // 3. Build the Header (<th>)
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    
    // First column header for Episode numbers
    headerRow.createEl("th", { text: "Ep", cls: "tv-tracker-ep-col" });

    // Headers for each Media Group (Season 1, Season 2, Movie, etc.)
    data.groups.forEach(group => {
        const th = headerRow.createEl("th");
        th.createSpan({ text: group.title });
        
        // Optional: Add a small badge if it's a movie or special
        if (group.type && group.type !== "season") {
            th.createEl("br");
            th.createSpan({ text: group.type, cls: "tv-tracker-badge" });
        }
    });

    // 4. Build the Body (<tr> and <td>)
    const tbody = table.createEl("tbody");

    for (let ep = 1; ep <= maxEpisodes; ep++) {
        const row = tbody.createEl("tr");
        
        // Episode Number column
        row.createEl("td", { text: ep.toString(), cls: "tv-tracker-ep-num" });

        // Loop through each group for the current row
        data.groups.forEach((group, groupIndex) => {
            const td = row.createEl("td", { cls: "tv-tracker-cell" });

            if (ep <= group.totalEpisodes) {
                // The season/movie has this episode, render the interactive checkbox
                const isWatched = group.watchedEpisodes.includes(ep);
                const isSkipped = group.skippedEpisodes?.includes(ep);
                
                let boxText = "⬜"; // Unwatched
                if (isWatched) boxText = "✅"; // Watched
                if (isSkipped) boxText = "➖"; // Skipped/Filler

                const box = td.createEl("span", { 
                    text: boxText,
                    cls: "tv-tracker-checkbox" 
                });
                
                // Attach the click event to save it to the vault
                box.addEventListener("click", () => {
                    onUpdate(groupIndex, ep);
                });
            } else {
                // The season/movie does NOT have this episode, render a dash
                td.createEl("span", { text: "-", cls: "tv-tracker-empty" });
            }
        });
    }
}