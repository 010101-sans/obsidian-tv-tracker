// EditTrackerModal.ts
import { App, Modal, Setting } from 'obsidian';
import { TrackerData } from './types';

export class EditTrackerModal extends Modal {
    data: TrackerData;
    onSubmit: (data: TrackerData) => void;

    constructor(app: App, currentData: TrackerData, onSubmit: (data: TrackerData) => void) {
        super(app);
        // We create a deep copy of the data so if the user closes the modal 
        // without saving, it doesn't accidentally modify the active UI state.
        this.data = JSON.parse(JSON.stringify(currentData));
        this.onSubmit = onSubmit;
    }

    onOpen() {
        this.display();
    }

    display() {
        const { contentEl } = this;
        contentEl.empty();
        
        contentEl.createEl("h2", { text: "Edit Tracker" });

        // Loop through each group to create an edit form
        this.data.groups.forEach((group, index) => {
            const groupHeader = contentEl.createEl("h3", { 
                text: `Column ${index + 1}`,
                cls: "tv-tracker-modal-header" 
            });

            new Setting(contentEl)
                .setName("Title")
                .addText(text => text
                    .setValue(group.title)
                    .onChange(value => { group.title = value; })
                );

            new Setting(contentEl)
                .setName("Type")
                .addDropdown(drop => drop
                    .addOption("season", "Season")
                    .addOption("movie", "Movie")
                    .addOption("special", "Special")
                    .setValue(group.type || "season")
                    .onChange(value => { group.type = value as any; })
                );

            new Setting(contentEl)
                .setName("Total Episodes")
                .addText(text => text
                    .setValue(group.totalEpisodes.toString())
                    .onChange(value => {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed > 0) {
                            group.totalEpisodes = parsed;
                        }
                    })
                );
        });

        // Add a visual separator
        contentEl.createEl("hr");

        // Button to add a new column
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText("➕ Add Column")
                .onClick(() => {
                    this.data.groups.push({
                        title: `Season ${this.data.groups.length + 1}`,
                        type: "season",
                        totalEpisodes: 12,
                        watchedEpisodes: [],
                        skippedEpisodes: []
                    });
                    this.display(); // Re-render the modal to show the new input fields
                })
            );

        // Save Button
        new Setting(contentEl)
            .addButton(btn => btn
                .setButtonText("Save Changes")
                .setCta()
                .onClick(() => {
                    this.close();
                    this.onSubmit(this.data);
                })
            );
    }

    onClose() {
        this.contentEl.empty();
    }
}