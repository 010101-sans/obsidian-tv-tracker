// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";
import { TvTrackerSettings } from "./settings";

export function renderTracker(
    el: HTMLElement, 
    data: TrackerData, 
    ctx: MarkdownPostProcessorContext,
    settings: TvTrackerSettings,
    // Add isBulkWatch parameter to the callback
    onUpdate: (groupIndex: number, episode: number, container: HTMLElement, isBulkWatch?: boolean) => void,
    onEdit: (currentData: TrackerData) => void 
) {
    let maxEpisodes = 0;
    let hasGhostData = false;

    data.groups.forEach(group => {
        if (group.totalEpisodes > maxEpisodes) maxEpisodes = group.totalEpisodes;
        const outOfBounds = group.watchedEpisodes.filter(ep => ep > group.totalEpisodes);
        if (outOfBounds.length > 0) hasGhostData = true;
    });

    const container = el.createEl("div", { cls: "tv-tracker-container" });
    
    // Header Bar & Edit Button
    const headerBar = container.createEl("div", { cls: "tv-tracker-header-bar" });
    const editBtn = headerBar.createEl("button", { text: "⚙️ Edit", cls: "tv-tracker-edit-btn" });
    editBtn.addEventListener("click", () => onEdit(data));

    // Wrap the table in a new div so only the table scrolls horizontally
    const tableWrapper = container.createEl("div", { cls: "tv-tracker-table-wrapper" });
    const table = tableWrapper.createEl("table", { cls: "tv-tracker-table" });

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
                
                // Long-Press Logic Setup
                let longPressTimer: NodeJS.Timeout;
                let isLongPress = false;

                // Detect when user touches or clicks down
                box.addEventListener("pointerdown", () => {
                    isLongPress = false;
                    longPressTimer = setTimeout(() => {
                        isLongPress = true;
                        onUpdate(groupIndex, ep, container, true); // bulk watch = true
                    }, 600); // 600ms hold time
                });

                // Clear the timer if they let go early or drag their finger away
                const cancelLongPress = () => clearTimeout(longPressTimer);
                box.addEventListener("pointerup", cancelLongPress);
                box.addEventListener("pointerleave", cancelLongPress);
                box.addEventListener("pointercancel", cancelLongPress);

                // Normal click (only fires if it wasn't a long press)
                box.addEventListener("click", () => {
                    if (isLongPress) return; // Ignore click if we already triggered the bulk action
                    onUpdate(groupIndex, ep, container, false);
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