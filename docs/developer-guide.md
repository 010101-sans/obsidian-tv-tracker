# Developer Guide

Thank you for your interest in contributing to the **TV and Media Tracker**! This plugin is built with modern web technologies and strictly adheres to the Obsidian API.

## Tech Stack
* **Language:** TypeScript
* **Bundler:** esbuild
* **Styling:** Vanilla CSS (utilizing Obsidian's native CSS variables)

## Local Development Setup

1. Clone the repository into a test vault's plugin folder:
   `[VaultFolder]/.obsidian/plugins/tv-media-tracker/`
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the esbuild watcher. This will automatically compile `main.js` whenever you save a TypeScript file.
4. Reload the Obsidian app (or use a hot-reload plugin) to see your changes.

## Available Scripts

Based on our `package.json`, the following scripts are available:

* `npm run dev`: Compiles the plugin and watches for changes.
* `npm run build`: Runs TypeScript type-checking and builds the production-ready `main.js`.
* `npm run lint`: Runs ESLint to check for code quality and style issues.
* `npm run version`: Bumps the version numbers in both `manifest.json` and `versions.json`.

## Core Architecture

The codebase is modularized to separate data parsing, DOM rendering, and file IO:

* **`main.ts`**: The entry point. Handles registering commands, the code block processor, and the crucial `updateVaultFile` logic (using `app.vault.modify` to safely update the JSON blocks).
* **`types.ts`**: Contains the TypeScript interfaces (`TrackerData`, `MediaGroup`).
* **`dataParser.ts`**: A robust JSON parser that handles legacy fallbacks and injects default arrays (`[]`) to prevent crashes on malformed data.
* **`Renderer.ts`**: The visual engine. Constructs the DOM elements, calculates maximum row heights, sets up sticky horizontal scrolling, and attaches the `click` and `pointerdown` (long-press) event listeners.
* **`EditTrackerModal.ts`**: The modern, CSS-grid-based drag-and-drop visual editor.

## File IO / State Management Note

Because Obsidian operates on local markdown files, state is *not* kept in memory. When a user clicks a checkbox, the plugin stringifies the updated JSON, overwrites the specific code block in the vault file, and relies on Obsidian's reactive engine to trigger a re-render of the block.