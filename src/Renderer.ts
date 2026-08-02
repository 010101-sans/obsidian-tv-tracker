// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";

export function renderTracker(el: HTMLElement, data: TrackerData, ctx: MarkdownPostProcessorContext) {
    // 1. Create the main Flexbox container
    const container = el.createEl("div", { cls: "tv-tracker-flex-container" });

    // 2. Loop through each Media Group to create individual cards
    data.groups.forEach((group, groupIndex) => {
        const card = container.createEl("div", { cls: "tv-tracker-card" });
        
        // Card Header
        const header = card.createEl("div", { cls: "tv-tracker-card-header" });
        header.createEl("h3", { text: group.title, cls: "tv-tracker-card-title" });
        
        if (group.type) {
            header.createEl("span", { text: group.type, cls: "tv-tracker-badge" });
        }

        // 3. Create the CSS Grid for episodes
        const grid = card.createEl("div", { cls: "tv-tracker-grid" });

        // 4. Populate the grid with checkboxes
        for (let ep = 1; ep <= group.totalEpisodes; ep++) {
            const isWatched = group.watchedEpisodes.includes(ep);
            const isSkipped = group.skippedEpisodes?.includes(ep);
            
            // Determine visual state
            let boxText = "⬜"; // Default unwatched
            if (isWatched) boxText = "✅";
            if (isSkipped) boxText = "➖";

            const box = grid.createEl("span", { 
                text: boxText,
                cls: "tv-tracker-checkbox" 
            });
            
            // Optional: Show custom label or default episode number on hover
            const label = group.customLabels && group.customLabels[ep - 1] 
                ? group.customLabels[ep - 1] 
                : ep.toString();
            box.title = `Ep ${label}`; 
            
            // Attach hidden data for Phase 5 (Click Events)
            box.dataset.groupIndex = groupIndex.toString();
            box.dataset.episode = ep.toString();
        }
    });
}