// main.ts
import { Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';

export default class TvTrackerPlugin extends Plugin {
    
    async onload() {
        console.log("Loading TV & Media Tracker plugin");

        this.registerMarkdownCodeBlockProcessor("tv-tracker", (source, el, ctx) => {
            this.processTrackerBlock(source, el, ctx);
        });
    }

    onunload() {
        console.log("Unloading TV & Media Tracker plugin");
    }

    private processTrackerBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const data = parseTrackerData(source);

        if (!data) {
            const errorNode = el.createEl("div", { cls: "tv-tracker-error" });
            errorNode.setText("⚠️ Invalid TV Tracker Data. Please check your JSON syntax.");
            errorNode.style.color = "red";
            errorNode.style.border = "1px solid red";
            errorNode.style.padding = "10px";
            return;
        }

        // Pass the callback to the renderer
        renderTracker(el, data, ctx, async (groupIndex, episode) => {
            await this.updateVaultFile(source, ctx.sourcePath, groupIndex, episode);
        });
    }

    // 👈 New method to handle file saves
    private async updateVaultFile(originalSource: string, sourcePath: string, groupIndex: number, episode: number) {
        // 1. Get the actual file from the vault
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(file instanceof TFile)) return;

        // 2. Parse the original block's data
        const data = parseTrackerData(originalSource);
        if (!data) return;

        const group = data.groups[groupIndex];
        if (!group) return;

        // 3. Toggle the watched state
        // (If it's already watched, remove it. If not, add it.)
        const watchIndex = group.watchedEpisodes.indexOf(episode);
        if (watchIndex > -1) {
            group.watchedEpisodes.splice(watchIndex, 1);
        } else {
            group.watchedEpisodes.push(episode);
            // Sort the array so the JSON file stays clean and readable
            group.watchedEpisodes.sort((a, b) => a - b);
        }

        // 4. Stringify the updated data
        const newSource = JSON.stringify(data, null, 2);

        // 5. Read the current file content
        const fileContent = await this.app.vault.read(file);
        
        // 6. Replace the exact old JSON string with the new JSON string
        // (Using originalSource ensures we only update this specific block)
        const newFileContent = fileContent.replace(originalSource, newSource);

        // 7. Save back to the vault
        // Obsidian will detect this change and automatically re-trigger your markdown processor!
        await this.app.vault.modify(file, newFileContent);
    }
}