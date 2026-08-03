# User Guide: TV & Media Tracker

Welcome to the detailed user guide! This document explains how to get the most out of the TV & Media Tracker plugin.

## Interacting with the Tracker

Once a tracker is inserted into your note, it becomes fully interactive in both **Live Preview** and **Reading Mode**.

* **Toggle States:** Click any episode box to cycle through its states:
  * `Unseen` ➡️ `Seen` ➡️ `Skipped` ➡️ `Unseen`
* **Bulk Watch (Long-Press):** If you are adding a show you've already partially watched, **click and hold** an episode box for 600ms. The plugin will automatically mark that episode and *all episodes before it* in that column as watched.

## The Visual Editor

You never have to write JSON manually. Every tracker has a sticky **⚙️ Edit** button in the top right corner. Clicking it opens the Visual Editor:

* **Rename Columns:** Change "Season 1" to "Season 1 (Dubbed)".
* **Change Types:** Tag a column as a `Season`, `Movie`, or `Special`. (Movies automatically generate only one row if set to 1 episode).
* **Drag and Drop:** Grab the `☰` handle on any card to drag and drop seasons to reorder them chronologically.
* **Add/Remove:** Use the `➕ Add Column` or `🗑️` delete buttons to manage ongoing shows.

## Customizing Emojis

Don't like the default checkboxes? You can change them globally!
1. Open Obsidian **Settings**.
2. Navigate to **TV & Media Tracker** under Community Plugins.
3. Input your preferred emojis (or text characters) for:
   * **Watched Emoji** (Default: ✅)
   * **Unwatched Emoji** (Default: ⬜)
   * **Skipped Emoji** (Default: ❌)

## Advanced: The Underlying JSON

Under the hood, the plugin stores your data in a clean `tv-tracker` JSON code block. While the Visual Editor handles this for you, power users can edit this directly in **Source Mode**.

### Example JSON Structures

1. The Standard Show (Basic Functionality)

```json
{
  "groups": [
    {
      "title": "Season 1",
      "type": "season",
      "totalEpisodes": 10,
      "watchedEpisodes": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      "skippedEpisodes": []
    },
    {
      "title": "Season 2",
      "type": "season",
      "totalEpisodes": 12,
      "watchedEpisodes": [1, 2, 3],
      "skippedEpisodes": []
    },
    {
      "title": "Season 3",
      "type": "season",
      "totalEpisodes": 8,
      "watchedEpisodes": [],
      "skippedEpisodes": []
    }
  ]
}
```

2. Mixed Media & Skipped Episodes (The Anime Test)
```json
{
  "groups": [
    {
      "title": "Season 1",
      "type": "season",
      "totalEpisodes": 24,
      "watchedEpisodes": [1, 2, 3, 4, 24],
      "skippedEpisodes": [12, 13]
    },
    {
      "title": "Mugen Train",
      "type": "movie",
      "totalEpisodes": 1,
      "watchedEpisodes": [1],
      "skippedEpisodes": []
    },
    {
      "title": "Season 2",
      "type": "season",
      "totalEpisodes": 11,
      "watchedEpisodes": [],
      "skippedEpisodes": []
    }
  ]
}
```

3. Ghost Data & Error Handling (The Out-of-Bounds Test)
```json
{
  "groups": [
    {
      "title": "Season 1 (Shrunk)",
      "type": "season",
      "totalEpisodes": 5,
      "watchedEpisodes": [1, 2, 3, 6, 7, 8],
      "skippedEpisodes": []
    }
  ]
}
```

4. Custom Labels (The Pilot/OVA Test)
```json
{
  "groups": [
    {
      "title": "Specials",
      "type": "special",
      "totalEpisodes": 4,
      "watchedEpisodes": [1],
      "skippedEpisodes": [4],
      "customLabels": ["Pilot", "OVA 1", "OVA 2", "Christmas Special"]
    },
    {
      "title": "Season 1",
      "type": "season",
      "totalEpisodes": 10,
      "watchedEpisodes": [],
      "skippedEpisodes": []
    }
  ]
}
```

**Note on `customLabels`**: You can optionally add a `"customLabels": ["Pilot", "1", "2"]` array to a group if your episodes follow non-standard numbering.