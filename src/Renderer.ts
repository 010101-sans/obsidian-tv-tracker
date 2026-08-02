// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";

export function renderTracker(
    el: HTMLElement, 
    data: TrackerData, 
    ctx: MarkdownPostProcessorContext,
    onUpdate: (groupIndex: number, episode: number) => void // 👈 New callback parameter
) {
    const container = el.createEl("div", { cls: "tv-tracker-flex-container" });

    data.groups.forEach((group, groupIndex) => {
        const card = container.createEl("div", { cls: "tv-tracker-card" });
        
        const header = card.createEl("div", { cls: "tv-tracker-card-header" });
        header.createEl("h3", { text: group.title, cls: "tv-tracker-card-title" });
        
        if (group.type) {
            header.createEl("span", { text: group.type, cls: "tv-tracker-badge" });
        }

        const grid = card.createEl("div", { cls: "tv-tracker-grid" });

        for (let ep = 1; ep <= group.totalEpisodes; ep++) {
            const isWatched = group.watchedEpisodes.includes(ep);
            const isSkipped = group.skippedEpisodes?.includes(ep);
            
            let boxText = "⬜"; 
            if (isWatched) boxText = "✅";
            if (isSkipped) boxText = "➖";

            const box = grid.createEl("span", { 
                text: boxText,
                cls: "tv-tracker-checkbox" 
            });
            
            const label = group.customLabels && group.customLabels[ep - 1] 
                ? group.customLabels[ep - 1] 
                : ep.toString();
            box.title = `Ep ${label}`; 
            
            // 👈 Attach the click listener
            box.addEventListener("click", () => {
                onUpdate(groupIndex, ep);
            });
        }
    });
}