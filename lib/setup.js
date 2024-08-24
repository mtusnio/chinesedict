'use strict';

import { ZhongwenDictionary } from "./dict.js";

let dict = null;

function getDictionary() {
    return dict
}

async function activateExtension(tabId) {
    console.log("Activate", tabId)
    await chrome.storage.local.set({ "enabled": true })

    if (!dict) {
        await loadDictionary()
    }

    chrome.tabs.sendMessage(tabId, {
        'type': 'enable',
    });

    await chrome.action.setBadgeBackgroundColor({
        'color': [255, 0, 0, 255]
    });

    await chrome.action.setBadgeText({
        'text': 'On'
    });
}

async function loadDictData() {
    let mandarinDict = await fetch(chrome.runtime.getURL(
        "data/cedict_ts.u8")).then(r => r.text());
    let cantoneseDict = await fetch(chrome.runtime.getURL(
        "data/cedict_canto.u8")).then(r => r.text());
    let grammarKeywords = await fetch(chrome.runtime.getURL(
        "data/grammarKeywordsMin.json")).then(r => r.json());

    return [mandarinDict, cantoneseDict, grammarKeywords]
}


async function loadDictionary() {
    let [mandarinDict, cantoneseDict, grammarKeywords] = await loadDictData();
    dict = new ZhongwenDictionary([{
        type: "common",
        contents: mandarinDict
    }, {
        type: "cantonese",
        contents: cantoneseDict
    }], grammarKeywords);
}

async function deactivateExtension() {
    console.log("Deactivate")

    dict = null;

    await chrome.action.setBadgeBackgroundColor({
        'color': [0, 0, 0, 0]
    });

    await chrome.action.setBadgeText({
        'text': ''
    });

    await chrome.storage.local.set({ "enabled": false })

    const windows = chrome.windows.getAll(
        { 'populate': true }
    );

    for (let i = 0; i < windows.length; ++i) {
        let tabs = windows[i].tabs;
        for (let j = 0; j < tabs.length; ++j) {
            chrome.tabs.sendMessage(tabs[j].id, {
                'type': 'disable'
            });
        }
    }

}

async function activateExtensionToggle(currentTab) {
    const data = await chrome.storage.local.get(["enabled"])
    console.log("Toggle")
    if (data.enabled) {
        await deactivateExtension();
    } else {
        await activateExtension(currentTab.id);
    }
}


export { activateExtension, activateExtensionToggle, deactivateExtension, getDictionary, loadDictionary };

