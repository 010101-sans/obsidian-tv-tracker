// main.ts
import { Plugin, MarkdownPostProcessorContext, TFile, Editor, MarkdownView } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';
import { TvTrackerSettings, DEFAULT_SETTINGS, TvTrackerSettingTab } from './settings';
import { InsertTrackerModal } from './InsertTrackerModal';

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

		if (!data) {
			const errorNode = el.createEl("div", { cls: "tv-tracker-error" });
			errorNode.setText("⚠️ Invalid TV Tracker Data. Please check your JSON syntax.");
			return;
		}

		renderTracker(el, data, ctx, this.settings, async (groupIndex, episode, container) => {
			// Prevent overlapping saves
			if (this.isSaving) return;

			this.isSaving = true;

			// Visually disable the table so the user knows it's processing
			container.style.opacity = "0.6";
			container.style.pointerEvents = "none";

			await this.updateVaultFile(source, ctx.sourcePath, groupIndex, episode);

			this.isSaving = false;
		});
	}

	private async updateVaultFile(originalSource: string, sourcePath: string, groupIndex: number, episode: number) {
		const file = this.app.vault.getAbstractFileByPath(sourcePath);
		if (!(file instanceof TFile)) return;

		const data = parseTrackerData(originalSource);
		if (!data) return;

		const group = data.groups[groupIndex];
		if (!group) return;

		// Ensure skippedEpisodes array exists
		if (!group.skippedEpisodes) {
			group.skippedEpisodes = [];
		}

		const watchIndex = group.watchedEpisodes.indexOf(episode);
		const skipIndex = group.skippedEpisodes.indexOf(episode);

		// 🔄 The 3-State Toggle Logic
		if (watchIndex > -1) {
			// STATE 2 ➡️ STATE 3: (Seen ➡️ Skipped)
			// Remove from watched, add to skipped
			group.watchedEpisodes.splice(watchIndex, 1);
			group.skippedEpisodes.push(episode);
			group.skippedEpisodes.sort((a, b) => a - b);

		} else if (skipIndex > -1) {
			// STATE 3 ➡️ STATE 1: (Skipped ➡️ Unseen)
			// Remove from skipped (now it's in neither array)
			group.skippedEpisodes.splice(skipIndex, 1);

		} else {
			// STATE 1 ➡️ STATE 2: (Unseen ➡️ Seen)
			// Add to watched
			group.watchedEpisodes.push(episode);
			group.watchedEpisodes.sort((a, b) => a - b);
		}

		const newSource = JSON.stringify(data, null, 2);
		const fileContent = await this.app.vault.read(file);
		const newFileContent = fileContent.replace(originalSource, newSource);

		await this.app.vault.modify(file, newFileContent);
	}
}