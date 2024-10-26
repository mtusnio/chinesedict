'use strict';

import { ZhongwenDictionary } from "./dict.js";

let dict = null;

// Enabled is a stored state, isActive is a state
// that tells us whether the extension in the current
// browser session has been set on.
let isActive = false

function getDictionary() {
    return dict
}

async function install() {
    await chrome.contextMenus.create(
        {
            id: "help",
            title: "Open help",
            contexts: ["action"]
        }
    );
    await chrome.contextMenus.create(
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


async function activateExtension(tabId, showHelp) {
    await chrome.storage.local.set({ "enabled": true })
    isActive = true

    if (showHelp) {
        await chrome.tabs.sendMessage(tabId, {
            'type': 'showHelp'
        });
    }

    await Promise.all([
        chrome.action.setBadgeBackgroundColor({
            color: [255, 0, 0, 255],
        }),
        chrome.action.setBadgeText({
            text: 'On',
        }),
        chrome.action.setIcon({
            path: {
                16: "images/on_icon-16x16.png",
                48: "images/on_icon-48x48.png",
                128: "images/on_icon-128x128.png",
                192: "images/on_icon-192x192.png",
                512: "images/on_icon-512x512.png"
            },
        })
    ])

    if (!dict) {
        await loadDictionary()
    }

    await chrome.tabs.sendMessage(tabId, {
        'type': 'enable',
    });
}

async function deactivateExtension() {
    dict = null;

    await Promise.all([
        chrome.action.setBadgeBackgroundColor({
            color: [0, 0, 0, 0],
        }),
        chrome.action.setBadgeText({
            text: '',
        }),
        chrome.action.setIcon({
            path: {
                16: "images/logo-16x16.png",
                48: "images/logo-48x48.png",
                128: "images/logo-128x128.png",
                192: "images/logo-192x192.png",
                512: "images/logo-512x512.png"
            },
        })
    ]
    )

    await chrome.storage.local.set({ "enabled": false })
    isActive = false

    const windows = await chrome.windows.getAll(
        { 'populate': true }
    );

    for (let i = 0; i < windows.length; ++i) {
        let tabs = windows[i].tabs;
        for (let j = 0; j < tabs.length; ++j) {
            await chrome.tabs.sendMessage(tabs[j].id, {
                'type': 'disable'
            });
        }
    }
}

async function toggleExtension(currentTab) {
    const data = await chrome.storage.local.get(["enabled"])
    if (data.enabled) {
        await deactivateExtension();
    } else {
        await activateExtension(currentTab.id, true);
    }
}

function isActivated() {
    return isActive
}

export { activateExtension, deactivateExtension, getDictionary, install, loadDictionary, toggleExtension, isActivated };

