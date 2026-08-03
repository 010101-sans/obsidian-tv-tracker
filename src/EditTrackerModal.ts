// EditTrackerModal.ts
import { App, Modal, Setting } from 'obsidian';
import { TrackerData } from './types';

export class EditTrackerModal extends Modal {
    data: TrackerData;
    onSubmit: (data: TrackerData) => void;

    constructor(app: App, currentData: TrackerData, onSubmit: (data: TrackerData) => void) {
        super(app);
        this.data = JSON.parse(JSON.stringify(currentData));
        this.onSubmit = onSubmit;
    }

    onOpen() {
        this.display();
    }

    display() {
        const { contentEl } = this;
        contentEl.empty();
        contentEl.addClass("tv-tracker-modern-modal"); // Added class for custom CSS
        
        contentEl.createEl("h2", { text: "Edit Media Tracker", cls: "tv-tracker-modal-title" });

        // A nice responsive grid container
        const grid = contentEl.createEl("div", { cls: "tv-tracker-modal-grid" });

        this.data.groups.forEach((group, index) => {
            const card = grid.createEl("div", { cls: "tv-tracker-modal-card" });
            
            // Card Header with Delete Button
            const header = card.createEl("div", { cls: "tv-tracker-modal-card-header" });
            header.createEl("h3", { text: `Column ${index + 1}` });
            
            const deleteBtn = header.createEl("button", { text: "🗑️", cls: "tv-tracker-icon-btn", title: "Delete Column" });
            deleteBtn.onclick = () => {
                this.data.groups.splice(index, 1);
                this.display(); // Re-render visually
            };

            // Inputs
            new Setting(card)
                .setName("Title")
                .addText(text => text
                    .setValue(group.title || "")
                    .onChange(value => { group.title = value; })
                );

            new Setting(card)
                .setName("Type")
                .addDropdown(drop => drop
                    .addOption("season", "Season")
                    .addOption("movie", "Movie")
                    .addOption("special", "Special")
                    // Safe fallback to prevent crashes
                    .setValue(group.type || "season") 
                    .onChange(value => { group.type = value as any; })
                );

            new Setting(card)
                .setName("Total Episodes")
                .addText(text => text
                    // Safe stringify
                    .setValue(group.totalEpisodes ? group.totalEpisodes.toString() : "1")
                    .onChange(value => {
                        const parsed = parseInt(value);
                        if (!isNaN(parsed) && parsed > 0) {
                            group.totalEpisodes = parsed;
                        }
                    })
                );
        });

        // Sticky Footer Actions
        const footer = contentEl.createEl("div", { cls: "tv-tracker-modal-footer" });
        
        new Setting(footer)
            .addButton(btn => btn
                .setButtonText("Add Column")
                .onClick(() => {
                    this.data.groups.push({
                        title: `Season ${this.data.groups.length + 1}`,
                        type: "season",
                        totalEpisodes: 12,
                        watchedEpisodes: [],
                        skippedEpisodes: []
                    });
                    this.display(); 
                })
            )
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