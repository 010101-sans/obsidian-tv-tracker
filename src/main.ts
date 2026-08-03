// main.ts
import { Plugin, MarkdownPostProcessorContext, TFile, Editor, MarkdownView } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';
import { TvTrackerSettings, DEFAULT_SETTINGS, TvTrackerSettingTab } from './settings';
import { InsertTrackerModal } from './InsertTrackerModal';
import { EditTrackerModal } from './EditTrackerModal';

export default class TvTrackerPlugin extends Plugin {
	settings!: TvTrackerSettings;
	private isSaving = false; // Add the lock flag

	async onload() {
        console.log("Loading TV & Media Tracker plugin");
        
        // Load user settings on startup
        await this.loadSettings();
        
        // Register the settings tab UI
        this.addSettingTab(new TvTrackerSettingTab(this.app, this));

        // Register the Command Palette action
        this.addCommand({
            id: 'insert-tv-tracker',
            name: 'Insert TV Tracker Table',
            hotkeys: [{ modifiers: ["Alt"], key: "t" }],
            editorCallback: (editor, view) => { 
                // Using inferred types (editor, view) fixes the MarkdownFileInfo error
                new InsertTrackerModal(this.app, (data) => {
                    // Generate the JSON block
                    const jsonString = JSON.stringify(data, null, 2);
                    const codeBlock = `\`\`\`tv-tracker\n${jsonString}\n\`\`\`\n`;
                    
                    // Insert directly at the user's current cursor position
                    editor.replaceSelection(codeBlock);
                }).open();
            }
        });

        // Register the code block renderer
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
        if (!data) return; // ... (keep your error handling here)

        renderTracker(
            el, 
            data, 
            ctx, 
            this.settings, 
            // Accept the isBulkWatch flag here
            async (groupIndex, episode, container, isBulkWatch) => {
                if (this.isSaving) return; 
                this.isSaving = true;
                
                container.style.opacity = "0.6";
                container.style.pointerEvents = "none";

                // Pass it down to the vault file updater
                await this.updateVaultFile(source, ctx.sourcePath, groupIndex, episode, isBulkWatch);
                
                this.isSaving = false;
            },
            (currentData) => { /* ... edit modal logic (remains unchanged) ... */ }
        );
    }

    // Update signature to include isBulkWatch
    private async updateVaultFile(originalSource: string, sourcePath: string, groupIndex: number, episode: number, isBulkWatch?: boolean) {
        const file = this.app.vault.getAbstractFileByPath(sourcePath);
        if (!(file instanceof TFile)) return;

        const data = parseTrackerData(originalSource);
        if (!data) return;

        const group = data.groups[groupIndex];
        if (!group) return;

        if (!group.skippedEpisodes) group.skippedEpisodes = [];

        // Bulk Action Logic
        if (isBulkWatch) {
            // Loop from episode 1 to the held episode
            for (let i = 1; i <= episode; i++) {
                // If it's not already watched, add it
                if (!group.watchedEpisodes.includes(i)) {
                    group.watchedEpisodes.push(i);
                }
                // If it was skipped, remove it from the skipped array
                const skipIndex = group.skippedEpisodes.indexOf(i);
                if (skipIndex > -1) {
                    group.skippedEpisodes.splice(skipIndex, 1);
                }
            }
            group.watchedEpisodes.sort((a, b) => a - b);
        } 
        // Standard 3-State Toggle Logic (Unseen -> Seen -> Skipped)
        else {
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