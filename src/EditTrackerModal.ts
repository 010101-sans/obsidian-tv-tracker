// EditTrackerModal.ts
import { App, Modal, Setting } from 'obsidian';
import { TrackerData } from './types';

export class EditTrackerModal extends Modal {
    data: TrackerData;
    onSubmit: (data: TrackerData) => void;
    // Track the index of the item currently being dragged
    private draggedIndex: number | null = null;

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
        contentEl.addClass("tv-tracker-modern-modal");

        contentEl.createEl("h2", { text: "Edit Media Tracker", cls: "tv-tracker-modal-title" });

        const grid = contentEl.createEl("div", { cls: "tv-tracker-modal-grid" });

        this.data.groups.forEach((group, index) => {
            const card = grid.createEl("div", { cls: "tv-tracker-modal-card" });

            // 1. Make the card draggable
            card.setAttribute("draggable", "true");

            // 2. Drag & Drop Event Listeners
            card.addEventListener("dragstart", (e) => {
                this.draggedIndex = index;
                card.addClass("tv-tracker-is-dragging");
                // Optional: set drag image/data
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                }
            });

            card.addEventListener("dragover", (e) => {
                e.preventDefault(); // Required to allow a drop
                if (this.draggedIndex === index) return;
                card.addClass("tv-tracker-drag-over");
            });

            card.addEventListener("dragleave", () => {
                card.removeClass("tv-tracker-drag-over");
            });

            card.addEventListener("drop", (e) => {
                e.preventDefault();
                card.removeClass("tv-tracker-drag-over");

                if (this.draggedIndex !== null && this.draggedIndex !== index) {
                    // Extract the item from the old position
                    const draggedItem = this.data.groups.splice(this.draggedIndex, 1)[0];

                    // Add a safety check to satisfy TypeScript
                    if (draggedItem) {
                        // Insert it at the new position
                        this.data.groups.splice(index, 0, draggedItem);
                    }

                    // Re-render the modal with the new order
                    this.draggedIndex = null;
                    this.display();
                }
            });

            card.addEventListener("dragend", () => {
                card.removeClass("tv-tracker-is-dragging");
                this.draggedIndex = null;
            });

            // Card Header
            const header = card.createEl("div", { cls: "tv-tracker-modal-card-header" });

            // Add a visual drag handle
            const titleContainer = header.createEl("div", { cls: "tv-tracker-card-title-container" });
            titleContainer.createEl("span", { text: "☰", cls: "tv-tracker-drag-handle" });
            titleContainer.createEl("h3", { text: `Column ${index + 1}` });

            const deleteBtn = header.createEl("button", { text: "🗑️", cls: "tv-tracker-icon-btn", title: "Delete Column" });
            deleteBtn.onclick = () => {
                this.data.groups.splice(index, 1);
                this.display();
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
                    .setValue(group.type || "season")
                    .onChange(value => { group.type = value as any; })
                );

            new Setting(card)
                .setName("Total Episodes")
                .addText(text => text
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
}