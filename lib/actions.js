import * as configuration from "./configuration.js";
import * as setup from "./setup.js";
import * as wordlist from "./wordlist.js";

async function enableTab(tabId) {
    const data = await chrome.storage.local.get(["enabled"])
    if (data.enabled) {
        // Syncing isActive with the saved state
        if (!setup.isActivated()) {
            await setup.activateExtension(tabId, false)
        } else {
            chrome.tabs.sendMessage(tabId, {
                'type': 'enable',
            })
        }
    }
}

async function search(text) {
    const config = await configuration.get()

    const MAX_PHRASE_LENGTH = 7;
    const dict = await setup.getDictionary()

    if (!dict) {
        // dictionary not loaded
        return [];
    }

    const match = text.match(/^\p{sc=Han}+/u);

    if (!match) {
        return [];
    }

    const hanText = match[0].slice(0, MAX_PHRASE_LENGTH);

    let words = [];
    for (let i = hanText.length; i > 0; i--) {
        const searchString = text.slice(0, i);
        let entries = dict.wordSearch(searchString,
            config['cantoneseEntriesEnabled'] === "no" ? "common" : "cantonese");

        if (entries.length > 0) {
            words.push({
                entries,
                originalWord: searchString
            });
        }
    }

    return words;
}

async function addtoWordlist(entries) {
    const config = await configuration.get()

    let saveFirstEntryOnly = config.saveToWordList === 'firstEntryOnly';

    const timestamp = Date.now();
    for (let i in entries) {
        let entry = {
            timestamp: timestamp,
            simplified: entries[i].simplified,
            traditional: entries[i].traditional,
            pinyin: entries[i].pinyin,
            definition: entries[i].definition,
            jyutping: entries[i].jyutping,
        };

        await wordlist.add(entry)

        if (saveFirstEntryOnly) {
            break;
        }
    }

}

export { addtoWordlist, enableTab, search };

