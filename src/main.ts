// main.ts
import { Plugin, MarkdownPostProcessorContext } from 'obsidian';
import { parseTrackerData } from './dataParser';
import { renderTracker } from './Renderer';

export default class TvTrackerPlugin extends Plugin {
    
    async onload() {
        console.log("Loading TV & Media Tracker plugin");

        this.registerMarkdownCodeBlockProcessor("tv-tracker", (source, el, ctx) => {
            this.processTrackerBlock(source, el, ctx);
        });
    }

    onunload() {
        console.log("Unloading TV & Media Tracker plugin");
    }

    private processTrackerBlock(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext) {
        const data = parseTrackerData(source);

        if (!data) {
            const errorNode = el.createEl("div", { cls: "tv-tracker-error" });
            errorNode.setText("⚠️ Invalid TV Tracker Data. Please check your JSON syntax.");
            errorNode.style.color = "red";
            errorNode.style.border = "1px solid red";
            errorNode.style.padding = "10px";
            return;
        }

        // Render the visual table
        renderTracker(el, data, ctx);
    }
}