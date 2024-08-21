'use strict';

import { ZhongwenDictionary } from "./dict.js";

let dict = null;

function getDictionary() {
    return dict
}

async function activateExtension() {
    console.log("Activate")
    await chrome.storage.local.set({ "enabled": true })

    if (!dict) {
        dict = await loadDictionary()
    }

    await chrome.action.setBadgeBackgroundColor({
        'color': [255, 0, 0, 255]
    });

    await chrome.action.setBadgeText({
        'text': 'On'
    });
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
    console.log("Deactivate")

    dict = null;

    await chrome.action.setBadgeBackgroundColor({
        'color': [0, 0, 0, 0]
    });

    await chrome.action.setBadgeText({
        'text': ''
    });

    await chrome.storage.local.set({ "enabled": false })
}

async function activateExtensionToggle() {
    const data = await chrome.storage.local.get(["enabled"])
    console.log("Toggle")
    if (data.enabled) {
        await deactivateExtension();
    } else {
        await activateExtension();
    }
}


export { activateExtension, deactivateExtension, activateExtensionToggle, getDictionary, loadDictionary }
