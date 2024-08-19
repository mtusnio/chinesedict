'use strict';

import { ZhongwenDictionary } from './dict.js';

let dict;

async function activateExtension(tabId, showHelp) {
    await chrome.storage.local.set({ "enabled": true })

    // if (!dict) {
    //     loadDictionary().then(r => dict = r);
    // }

    // chrome.action.setBadgeBackgroundColor({
    //     'color': [255, 0, 0, 255]
    // });

    // chrome.action.setBadgeText({
    //     'text': 'On'
    // });
}

async function loadDictData() {
    let mandarinDict = fetch(chrome.runtime.getURL(
        "data/cedict_ts.u8")).then(r => r.text());
    let cantoneseDict = fetch(chrome.runtime.getURL(
        "data/cedict_canto.u8")).then(r => r.text());
    let grammarKeywords = fetch(chrome.runtime.getURL(
        "data/grammarKeywordsMin.json")).then(r => r.json());

    return Promise.all([mandarinDict, cantoneseDict, grammarKeywords]);
}


async function loadDictionary() {
    let [mandarinDict, cantoneseDict, grammarKeywords] = await loadDictData();
    return new ZhongwenDictionary([{
        type: "common",
        contents: mandarinDict
    }, {
        type: "cantonese",
        contents: cantoneseDict
    }], grammarKeywords);
}

async function deactivateExtension() {
    dict = undefined;

    chrome.action.setBadgeBackgroundColor({
        'color': [0, 0, 0, 0]
    });

    chrome.action.setBadgeText({
        'text': ''
    });

    await chrome.storage.local.set({ "enabled": false })

    chrome.contextMenus.removeAll();
}

async function activateExtensionToggle(currentTab) {
    const data = await chrome.storage.local.get(["enabled"])
    if (data.enabled) {
        await deactivateExtension();
    } else {
        await activateExtension(currentTab.id, true);
    }
}

async function enableTab(tabId) {
    const data = await chrome.storage.local.get(["enabled"])
    if (data.enabled) {

        if (!isActivated) {
            activateExtension(tabId, false);
        }

        // chrome.tabs.sendMessage(tabId, {
        //     'type': 'enable',
        //     // 'config': zhongwenOptions
        // });
    }
}

function search(text) {
    const MAX_PHRASE_LENGTH = 7;
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
            zhongwenOptions['cantoneseEntriesEnabled'] === "no" ? "common" : "cantonese");

        if (entries.length > 0) {
            words.push({
                entries,
                originalWord: searchString
            });
        }
    }

    return words;
}

export { activateExtension }
