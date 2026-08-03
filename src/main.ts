// main.ts
import { Plugin, MarkdownPostProcessorContext, TFile } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';
import { TvTrackerSettings, DEFAULT_SETTINGS, TvTrackerSettingTab } from './settings';
import { InsertTrackerModal } from './InsertTrackerModal';
import { EditTrackerModal } from './EditTrackerModal';

export default class TvTrackerPlugin extends Plugin {
    settings!: TvTrackerSettings; 
    private isSaving = false;
    
    // Track scroll positions across re-renders
    private scrollStates = new Map<string, number>(); 
    
    async onload() {
        console.log("Loading TV and Media Tracker plugin");
        await this.loadSettings();
        this.addSettingTab(new TvTrackerSettingTab(this.app, this));

        this.addCommand({
            id: 'insert-tv-tracker',
            name: 'Insert TV Tracker Table',
            hotkeys: [{ modifiers: ["Alt"], key: "t" }],
            editorCallback: (editor, view) => { 
                new InsertTrackerModal(this.app, (data) => {
                    const jsonString = JSON.stringify(data, null, 2);
                    const codeBlock = `\`\`\`tv-tracker\n${jsonString}\n\`\`\`\n`;
                    editor.replaceSelection(codeBlock);
                }).open();
            }
        });

        this.registerMarkdownCodeBlockProcessor("tv-tracker", (source, el, ctx) => {
            this.processTrackerBlock(source, el, ctx);
        });
    }

    onunload() {
        console.log("Unloading TV and Media Tracker plugin");
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

        // Generate a unique key for this specific block's scroll position
        const scrollKey = `${ctx.sourcePath}-${data.groups[0]?.title || 'default'}`;
        const savedScroll = this.scrollStates.get(scrollKey) || 0;

        renderTracker(
            el, 
            data, 
            ctx, 
            this.settings,
            // Pass scroll data
            savedScroll,
            (scrollLeft) => {
                this.scrollStates.set(scrollKey, scrollLeft);
            },
            async (groupIndex, episode, container, isBulkWatch) => {
                if (this.isSaving) return; 
                this.isSaving = true;
                
                container.style.opacity = "0.6";
                container.style.pointerEvents = "none";

                await this.updateVaultFile(source, ctx.sourcePath, groupIndex, episode, isBulkWatch);
                
                this.isSaving = false;
            },
            (currentData) => {
                try {
                    new EditTrackerModal(this.app, currentData, async (updatedData) => {
                        const file = this.app.vault.getAbstractFileByPath(ctx.sourcePath);
                        if (!(file instanceof TFile)) return;

                        const newSource = JSON.stringify(updatedData, null, 2);
                        const fileContent = await this.app.vault.read(file);
                        const newFileContent = fileContent.replace(source, newSource);
                        await this.app.vault.modify(file, newFileContent);
                    }).open();
                } catch (e) {
                    console.error("TV Tracker Edit Modal Error:", e);
                }
            }
        );
    }

    private async updateVaultFile(originalSource: string, sourcePath: string, groupIndex: number, episode: number, isBulkWatch?: boolean) {
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(file instanceof TFile)) return;

        const data = parseTrackerData(originalSource);
        if (!data) return;

        const group = data.groups[groupIndex];
        if (!group) return;

        if (!group.skippedEpisodes) group.skippedEpisodes = [];

        if (isBulkWatch) {
            for (let i = 1; i <= episode; i++) {
                if (!group.watchedEpisodes.includes(i)) {
                    group.watchedEpisodes.push(i);
                }
                const skipIndex = group.skippedEpisodes.indexOf(i);
                if (skipIndex > -1) {
                    group.skippedEpisodes.splice(skipIndex, 1);
                }
            }
            group.watchedEpisodes.sort((a, b) => a - b);
        } else {
            const watchIndex = group.watchedEpisodes.indexOf(episode);
            const skipIndex = group.skippedEpisodes.indexOf(episode);

            if (watchIndex > -1) {
                group.watchedEpisodes.splice(watchIndex, 1);
                group.skippedEpisodes.push(episode);
                group.skippedEpisodes.sort((a, b) => a - b);
            } else if (skipIndex > -1) {
                group.skippedEpisodes.splice(skipIndex, 1);
            } else {
                group.watchedEpisodes.push(episode);
                group.watchedEpisodes.sort((a, b) => a - b);
            }
        }

        const newSource = JSON.stringify(data, null, 2);
        const fileContent = await this.app.vault.read(file);
        const newFileContent = fileContent.replace(originalSource, newSource);

        await this.app.vault.modify(file, newFileContent);
    }
}