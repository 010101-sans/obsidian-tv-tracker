// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";

export function renderTracker(el: HTMLElement, data: TrackerData, ctx: MarkdownPostProcessorContext) {
    // 1. Find the maximum number of episodes to determine our row count
    let maxEpisodes = 0;
    for (const col of data.columns) {
        if (!col) continue; // TypeScript safety check
        if (col.totalEpisodes > maxEpisodes) {
            maxEpisodes = col.totalEpisodes;
        }
    }

    // 2. Build the table containers
    const container = el.createEl("div", { cls: "tv-tracker-container" });
    const table = container.createEl("table", { cls: "tv-tracker-table" });

    // 3. Build the Header (<th>)
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    
    headerRow.createEl("th", { text: "Ep", cls: "tv-tracker-ep-col" }); // First column header

    for (const col of data.columns) {
        if (!col) continue; // TypeScript safety check
        headerRow.createEl("th", { text: col.title }); // Season headers
    }

    // 4. Build the Body (<tr> and <td>)
    const tbody = table.createEl("tbody");

    for (let ep = 1; ep <= maxEpisodes; ep++) {
        const row = tbody.createEl("tr");
        
        // Episode Number column
        row.createEl("td", { text: ep.toString(), cls: "tv-tracker-ep-num" });

        // Season columns
        for (let colIndex = 0; colIndex < data.columns.length; colIndex++) {
            const col = data.columns[colIndex];
            
            const td = row.createEl("td", { cls: "tv-tracker-cell" });

            if (!col) continue; // TypeScript safety check

            if (ep <= col.totalEpisodes) {
                // The season has this episode, render a box!
                const isWatched = col.watchedEpisodes.includes(ep);
                const box = td.createEl("span", { 
                    text: isWatched ? "✅" : "⬜",
                    cls: "tv-tracker-checkbox" 
                });
                
                // Attach hidden data so we know exactly what is clicked later
                box.dataset.colIndex = colIndex.toString();
                box.dataset.episode = ep.toString();
                
            } else {
                // The season does not have this episode, render a dash
                td.createEl("span", { text: "-", cls: "tv-tracker-empty" });
            }
        }
    }
}