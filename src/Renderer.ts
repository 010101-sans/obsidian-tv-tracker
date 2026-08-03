// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";
import { TvTrackerSettings } from "./settings";

export function renderTracker(
    el: HTMLElement, 
    data: TrackerData, 
    ctx: MarkdownPostProcessorContext,
    settings: TvTrackerSettings,
    onUpdate: (groupIndex: number, episode: number, container: HTMLElement) => void,
    onEdit: (currentData: TrackerData) => void // New callback for the edit button
) {
    let maxEpisodes = 0;
    let hasGhostData = false;

    data.groups.forEach(group => {
        if (group.totalEpisodes > maxEpisodes) maxEpisodes = group.totalEpisodes;
        const outOfBounds = group.watchedEpisodes.filter(ep => ep > group.totalEpisodes);
        if (outOfBounds.length > 0) hasGhostData = true;
    });

    const container = el.createEl("div", { cls: "tv-tracker-container" });
    
    // Create a header bar for the Edit Button
    const headerBar = container.createEl("div", { cls: "tv-tracker-header-bar" });
    const editBtn = headerBar.createEl("button", { text: "⚙️ Edit", cls: "tv-tracker-edit-btn" });
    editBtn.addEventListener("click", () => {
        onEdit(data);
    });

    const table = container.createEl("table", { cls: "tv-tracker-table" });

    // Header
    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Ep", cls: "tv-tracker-ep-col" });

    data.groups.forEach(group => {
        const th = headerRow.createEl("th");
        th.createSpan({ text: group.title });
        
        const watchedCount = group.watchedEpisodes.length;
        th.createEl("div", { 
            text: `(${watchedCount}/${group.totalEpisodes})`, 
            cls: "tv-tracker-progress" 
        });

        if (group.type && group.type !== "season") {
            th.createSpan({ text: group.type, cls: "tv-tracker-badge" });
        }
    });

    // Body
    const tbody = table.createEl("tbody");

    for (let ep = 1; ep <= maxEpisodes; ep++) {
        const row = tbody.createEl("tr");
        row.createEl("td", { text: ep.toString(), cls: "tv-tracker-ep-num" });

        data.groups.forEach((group, groupIndex) => {
            const td = row.createEl("td", { cls: "tv-tracker-cell" });

            if (ep <= group.totalEpisodes) {
                const isWatched = group.watchedEpisodes.includes(ep);
                const isSkipped = group.skippedEpisodes?.includes(ep);
                
                let boxText = settings.unwatchedEmoji; 
                if (isWatched) boxText = settings.watchedEmoji;
                if (isSkipped) boxText = settings.skippedEmoji;

                const box = td.createEl("span", { 
                    text: boxText,
                    cls: "tv-tracker-checkbox" 
                });
                
                box.addEventListener("click", () => {
                    onUpdate(groupIndex, ep, container);
                });
            } else {
                td.createEl("span", { text: "-", cls: "tv-tracker-empty" });
            }
        });
    }

    if (hasGhostData) {
        const warning = container.createEl("div", { cls: "tv-tracker-warning" });
        warning.setText("⚠️ Ghost data detected! Some watched episodes exceed the total episode count for their season.");
    }
}