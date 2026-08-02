// Renderer.ts
import { TrackerData } from "./types";
import { MarkdownPostProcessorContext } from "obsidian";
import { TvTrackerSettings } from "./settings"; // 👈 Import the interface

export function renderTracker(
    el: HTMLElement, 
    data: TrackerData, 
    ctx: MarkdownPostProcessorContext,
    settings: TvTrackerSettings, // 👈 Accept settings as a parameter
    onUpdate: (groupIndex: number, episode: number) => void
) {
    let maxEpisodes = 0;
    data.groups.forEach(group => {
        if (group.totalEpisodes > maxEpisodes) maxEpisodes = group.totalEpisodes;
    });

    const container = el.createEl("div", { cls: "tv-tracker-container" });
    const table = container.createEl("table", { cls: "tv-tracker-table" });

    const thead = table.createEl("thead");
    const headerRow = thead.createEl("tr");
    headerRow.createEl("th", { text: "Ep", cls: "tv-tracker-ep-col" });

    data.groups.forEach(group => {
        const th = headerRow.createEl("th");
        th.createSpan({ text: group.title });
        if (group.type && group.type !== "season") {
            th.createEl("br");
            th.createSpan({ text: group.type, cls: "tv-tracker-badge" });
        }
    });

    const tbody = table.createEl("tbody");

    for (let ep = 1; ep <= maxEpisodes; ep++) {
        const row = tbody.createEl("tr");
        row.createEl("td", { text: ep.toString(), cls: "tv-tracker-ep-num" });

        data.groups.forEach((group, groupIndex) => {
            const td = row.createEl("td", { cls: "tv-tracker-cell" });

            if (ep <= group.totalEpisodes) {
                const isWatched = group.watchedEpisodes.includes(ep);
                const isSkipped = group.skippedEpisodes?.includes(ep);
                
                // 👈 Use the customizable settings here!
                let boxText = settings.unwatchedEmoji; 
                if (isWatched) boxText = settings.watchedEmoji;
                if (isSkipped) boxText = settings.skippedEmoji;

                const box = td.createEl("span", { 
                    text: boxText,
                    cls: "tv-tracker-checkbox" 
                });
                
                box.addEventListener("click", () => {
                    onUpdate(groupIndex, ep);
                });
            } else {
                td.createEl("span", { text: "-", cls: "tv-tracker-empty" });
            }
        });
    }
}