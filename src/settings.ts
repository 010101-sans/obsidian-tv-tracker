// settings.ts
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
    skippedEmoji: '❌',
};

export class TvTrackerSettingTab extends PluginSettingTab {
    plugin: TvTrackerPlugin;

    constructor(app: App, plugin: TvTrackerPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;
        containerEl.empty();

        containerEl.createEl('h2', { text: 'TV & Media Tracker Settings' });

        new Setting(containerEl)
            .setName('Watched Emoji')
            .setDesc('The character displayed when an episode is marked as watched.')
            .addText(text => text
                .setPlaceholder('✅')
                .setValue(this.plugin.settings.watchedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.watchedEmoji = value || DEFAULT_SETTINGS.watchedEmoji;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Unwatched Emoji')
            .setDesc('The character displayed for an unwatched episode.')
            .addText(text => text
                .setPlaceholder('⬜')
                .setValue(this.plugin.settings.unwatchedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.unwatchedEmoji = value || DEFAULT_SETTINGS.unwatchedEmoji;
                    await this.plugin.saveSettings();
                }));

        new Setting(containerEl)
            .setName('Skipped / Filler Emoji')
            .setDesc('The character displayed for skipped or filler episodes.')
            .addText(text => text
                .setPlaceholder('❌')
                .setValue(this.plugin.settings.skippedEmoji)
                .onChange(async (value) => {
                    this.plugin.settings.skippedEmoji = value || DEFAULT_SETTINGS.skippedEmoji;
                    await this.plugin.saveSettings();
                }));
    }
}