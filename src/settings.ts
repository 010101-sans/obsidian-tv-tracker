// src/settings.ts
import { App, PluginSettingTab, Setting } from 'obsidian';
import TvTrackerPlugin from './main';

export interface TvTrackerSettings {
    watchedEmoji: string;
    unwatchedEmoji: string;
    skippedEmoji: string;
}

export const DEFAULT_SETTINGS: TvTrackerSettings = {
    watchedEmoji: '✅',
    unwatchedEmoji: '⬜',
    skippedEmoji: '❌'
};

export class TvTrackerSettingTab extends PluginSettingTab {
    plugin: TvTrackerPlugin;

    constructor(app: App, plugin: TvTrackerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    // Supports the declarative settings search in Obsidian 1.13.0+
    getSettingDefinitions() {
        return [
            {
                name: 'Watched Emoji',
                control: { type: 'text', key: 'watchedEmoji' }
            },
            {
                name: 'Unwatched Emoji',
                control: { type: 'text', key: 'unwatchedEmoji' }
            },
            {
                name: 'Skipped Emoji',
                control: { type: 'text', key: 'skippedEmoji' }
            }
        ];
    }

    // Supports backwards compatibility for Obsidian below 1.13.0
    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        new Setting(containerEl)
            .setName("TV & Media Tracker")
            .setHeading();

        new Setting(containerEl)
            .setName('Watched Emoji')
            .setDesc('Emoji used to represent watched episodes.')
            .addText(text => text
                .setValue(this.plugin.settings.watchedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.watchedEmoji = value || '✅';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Unwatched Emoji')
            .setDesc('Emoji used to represent unwatched episodes.')
            .addText(text => text
                .setValue(this.plugin.settings.unwatchedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.unwatchedEmoji = value || '⬜';
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Skipped Emoji')
            .setDesc('Emoji used to represent skipped/filler episodes.')
            .addText(text => text
                .setValue(this.plugin.settings.skippedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.skippedEmoji = value || '❌';
                    await this.plugin.saveSettings();
                }));
    }
}