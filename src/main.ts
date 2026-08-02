// main.ts
import { Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';
import { TvTrackerSettings, DEFAULT_SETTINGS, TvTrackerSettingTab } from './settings';

export default class TvTrackerPlugin extends Plugin {
    settings!: TvTrackerSettings; // 👈 Add settings property
    
    async onload() {
        console.log("Loading TV & Media Tracker plugin");
        
        // Load settings on startup
        await this.loadSettings();
        
        // Register the settings tab UI
        this.addSettingTab(new TvTrackerSettingTab(this.app, this));

        this.registerMarkdownCodeBlockProcessor("tv-tracker", (source, el, ctx) => {
            this.processTrackerBlock(source, el, ctx);
        });
    }

    onunload() {
        console.log("Unloading TV & Media Tracker plugin");
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    private processTrackerBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const data = parseTrackerData(source);

        if (!data) {
            const errorNode = el.createEl("div", { cls: "tv-tracker-error" });
            errorNode.setText("⚠️ Invalid TV Tracker Data. Please check your JSON syntax.");
            return;
        }

        // 👈 Pass this.settings into the renderer
        renderTracker(el, data, ctx, this.settings, async (groupIndex, episode) => {
            await this.updateVaultFile(source, ctx.sourcePath, groupIndex, episode);
        });
    }

    private async updateVaultFile(originalSource: string, sourcePath: string, groupIndex: number, episode: number) {
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(file instanceof TFile)) return;

        const data = parseTrackerData(originalSource);
        if (!data) return;

        const group = data.groups[groupIndex];
        if (!group) return;

        const watchIndex = group.watchedEpisodes.indexOf(episode);
        if (watchIndex > -1) {
            group.watchedEpisodes.splice(watchIndex, 1);
        } else {
            group.watchedEpisodes.push(episode);
            group.watchedEpisodes.sort((a, b) => a - b);
        }

        const newSource = JSON.stringify(data, null, 2);
        const fileContent = await this.app.vault.read(file);
        const newFileContent = fileContent.replace(originalSource, newSource);

        await this.app.vault.modify(file, newFileContent);
    }
}