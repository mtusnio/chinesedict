import * as setup from "./setup.js"

async function getConfig() {
    const localStorage = await chrome.storage.local.get([
        "popupcolor",
        "tonecolors",
        "fontSize",
        "skritterTLD",
        "zhuyin",
        "grammar",
        "simpTrad",
        "toneColorScheme",
        "cantoneseEntriesEnabled",
        "jyutpingEnabled",
        "pinyinEnabled",
        "ttsEnabled"
    ])

    return {
        css: localStorage['popupcolor'] || 'yellow',
        tonecolors: localStorage['tonecolors'] || 'yes',
        fontSize: localStorage['fontSize'] || 'small',
        skritterTLD: localStorage['skritterTLD'] || 'com',
        zhuyin: localStorage['zhuyin'] || 'no',
        grammar: localStorage['grammar'] || 'yes',
        simpTrad: localStorage['simpTrad'] || 'classic',
        toneColorScheme: localStorage['toneColorScheme'] || 'standard',
        cantoneseEntriesEnabled: localStorage['cantoneseEntriesEnabled'] || 'yes',
        jyutpingEnabled: localStorage['jyutpingEnabled'] || 'yes',
        pinyinEnabled: localStorage['pinyinEnabled'] || 'yes',
        ttsEnabled: localStorage['ttsEnabled'] || 'no'
    };
}


async function enableTab(tabId) {
    const data = await chrome.storage.local.get(["enabled"])
    if (data.enabled) {
        chrome.tabs.sendMessage(tabId, {
            'type': 'enable',
        }).then(() => console.log("Enabled tab", tabId)).catch(e => console.log(`Could not enable tab ${tabId} due to:`, e));
    }
}

async function search(text) {
    const config = await getConfig()
    const MAX_PHRASE_LENGTH = 7;
    if (!setup.getDictionary()) {
        // dictionary not loaded
        console.log("Dictionary not loaded")
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
        let entries = setup.getDictionary().wordSearch(searchString,
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

export { search, enableTab, getConfig }
