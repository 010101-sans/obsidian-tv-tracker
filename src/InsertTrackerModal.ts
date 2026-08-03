// InsertTrackerModal.ts
import { App, Modal, Setting } from 'obsidian';
import { TrackerData, MediaGroup } from './types';

export class InsertTrackerModal extends Modal {
    showTitle: string = "New Show";
    episodesInput: string = "12, 12"; // Default placeholder
    onSubmit: (data: TrackerData) => void;

    constructor(app: App, onSubmit: (data: TrackerData) => void) {
        super(app);
        this.onSubmit = onSubmit;
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.createEl("h2", { text: "Create TV and Media Tracker" });

        new Setting(contentEl)
            .setName("Tracker Title")
            .setDesc("Optional title to help identify this tracker.")
            .addText((text) => text
                .setValue(this.showTitle)
                .onChange((value) => {
                    this.showTitle = value;
                }));

        new Setting(contentEl)
            .setName("Episodes per Season")
            .setDesc("Enter comma-separated numbers. Example: '8, 10, 12' will create Season 1 (8 eps), Season 2 (10 eps), and Season 3 (12 eps).")
            .addText((text) => text
                .setPlaceholder("e.g. 12, 12, 24")
                .setValue(this.episodesInput)
                .onChange((value) => {
                    this.episodesInput = value;
                }));

        new Setting(contentEl)
            .addButton((btn) => btn
                .setButtonText("Insert Tracker")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.generateAndSubmit();
                }));
    }

    generateAndSubmit() {
        // Convert "8, 10, 12" into [8, 10, 12]
        const seasonCounts = this.episodesInput
            .split(",")
            .map(s => parseInt(s.trim()))
            .filter(n => !isNaN(n) && n > 0);
        
        const groups: MediaGroup[] = seasonCounts.map((count, index) => ({
            title: `Season ${index + 1}`,
            type: "season",
            totalEpisodes: count,
            watchedEpisodes: [],
            skippedEpisodes: []
        }));

        const data: TrackerData = { groups };
        this.onSubmit(data);
    }

    onClose() {
        this.contentEl.empty();
    }
}