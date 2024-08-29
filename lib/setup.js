'use strict';

import { ZhongwenDictionary } from "./dict.js";

let dict = null;

function getDictionary() {
    return dict
}

async function install() {
    chrome.contextMenus.create(
        {
            id: "help",
            title: "Open help",
            contexts: ["action"]
        }
    );
    chrome.contextMenus.create(
        {
            id: "wordlist",
            title: "Open word list",
            contexts: ["action"]
        }
    );

    chrome.contextMenus.onClicked.addListener(async (info) => {
        const { menuItemId } = info

        switch (menuItemId) {
            case "wordlist": {
                await chrome.tabs.create({
                    url: chrome.runtime.getURL('/wordlist.html'),
                })
                break;
            }
            case "help": {
                await chrome.tabs.create({
                    url: chrome.runtime.getURL('/help.html'),
                })
                break;
            }
        }
    })
}

async function activateExtension(tabId) {
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
    dict = null;

    await chrome.action.setBadgeBackgroundColor({
        'color': [0, 0, 0, 0]
    });

    await chrome.action.setBadgeText({
        'text': ''
    });

    await chrome.storage.local.set({ "enabled": false })

    const windows = await chrome.windows.getAll(
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
    if (data.enabled) {
        await deactivateExtension();
    } else {
        await activateExtension(currentTab.id);
    }
}


export { activateExtension, activateExtensionToggle, deactivateExtension, getDictionary, install, loadDictionary };

