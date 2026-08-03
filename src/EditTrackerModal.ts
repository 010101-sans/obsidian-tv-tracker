// src/EditTrackerModal.ts
import { App, Modal, Setting } from 'obsidian';
import { TrackerData, MediaType } from './types';

export class EditTrackerModal extends Modal {
    data: TrackerData;
    onSubmit: (data: TrackerData) => void;
    private draggedIndex: number | null = null; 

    constructor(app: App, currentData: TrackerData, onSubmit: (data: TrackerData) => void) {
        super(app);
        this.data = JSON.parse(JSON.stringify(currentData)) as TrackerData;
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

        const grid = contentEl.createDiv({ cls: "tv-tracker-modal-grid" });

        this.data.groups.forEach((group, index) => {
            const card = grid.createDiv({ cls: "tv-tracker-modal-card" });
            
            card.setAttribute("draggable", "true");

            card.addEventListener("dragstart", (e) => {
                this.draggedIndex = index;
                card.addClass("tv-tracker-is-dragging");
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = "move";
                }
            });

            card.addEventListener("dragover", (e) => {
                e.preventDefault();
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
                    const draggedItem = this.data.groups.splice(this.draggedIndex, 1)[0];
                    if (draggedItem) {
                        this.data.groups.splice(index, 0, draggedItem);
                    }
                    this.draggedIndex = null;
                    this.display(); 
                }
            });

            card.addEventListener("dragend", () => {
                card.removeClass("tv-tracker-is-dragging");
                this.draggedIndex = null;
            });

            const header = card.createDiv({ cls: "tv-tracker-modal-card-header" });
            
            const titleContainer = header.createDiv({ cls: "tv-tracker-card-title-container" });
            titleContainer.createSpan({ text: "☰", cls: "tv-tracker-drag-handle" });
            titleContainer.createEl("h3", { text: `Column ${index + 1}` });
            
            const deleteBtn = header.createEl("button", { text: "🗑️", cls: "tv-tracker-icon-btn", title: "Delete Column" });
            deleteBtn.onclick = () => {
                this.data.groups.splice(index, 1);
                this.display(); 
            };

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
                    .onChange(value => { group.type = value as MediaType; })
                );

            new Setting(card)
                .setName("Total Episodes")
                .addText(text => text
                    .setValue(group.totalEpisodes ? group.totalEpisodes.toString() : "1")
                    .onChange(value => {
                        const parsed = parseInt(value, 10);
                        if (!isNaN(parsed) && parsed > 0) {
                            group.totalEpisodes = parsed;
                        }
                    })
                );
        });

        const footer = contentEl.createDiv({ cls: "tv-tracker-modal-footer" });
        
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