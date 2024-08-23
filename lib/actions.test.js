'use strict';

import * as setup from "./setup.js"
import * as actions from "./actions.js"

import { jest } from '@jest/globals';

jest.useFakeTimers();

beforeEach(async () => {

})

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});


test("if dictionary is not set-up, returns an empty list", async () => {
    expect(await actions.search("律师 ")).toEqual([])
})


test("if dictionary is set-up, returns an entry for the word", async () => {
    setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.activateExtension()

    expect(await actions.search("律师")).toEqual([
        {
            "entries": [
                {
                    "definition": "lawyer",
                    "grammar": false,
                    "length": 2,
                    "originalWord": "律师",
                    "pronunciation": {
                        "cantonese": "leot6 si1",
                        "mandarin": "lu:4 shi1",
                    },
                    "simplified": "律师",
                    "traditional": "律師",
                    "type": "common",
                },
            ],
            "originalWord": "律师",
        },
        {
            "entries": [
                {
                    "definition": "surname Lü",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "Lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law/regulation/name of poetic form/standard pitch pipe/to discipline/to guide by principle",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "cantonese",
                },
            ],
            "originalWord": "律",
        },
    ])

})


test("if dictionary is set-up, searching for a word with special characters strips them away", async () => {
    setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.activateExtension()

    expect(await actions.search("律师    ")).toEqual([
        {
            "entries": [
                {
                    "definition": "lawyer",
                    "grammar": false,
                    "length": 2,
                    "originalWord": "律师",
                    "pronunciation": {
                        "cantonese": "leot6 si1",
                        "mandarin": "lu:4 shi1",
                    },
                    "simplified": "律师",
                    "traditional": "律師",
                    "type": "common",
                },
            ],
            "originalWord": "律师",
        },
        {
            "entries": [
                {
                    "definition": "surname Lü",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "Lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law/regulation/name of poetic form/standard pitch pipe/to discipline/to guide by principle",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "cantonese",
                },
            ],
            "originalWord": "律",
        },
    ])


    expect(await actions.search("律师      \n   \n")).toEqual([
        {
            "entries": [
                {
                    "definition": "lawyer",
                    "grammar": false,
                    "length": 2,
                    "originalWord": "律师",
                    "pronunciation": {
                        "cantonese": "leot6 si1",
                        "mandarin": "lu:4 shi1",
                    },
                    "simplified": "律师",
                    "traditional": "律師",
                    "type": "common",
                },
            ],
            "originalWord": "律师",
        },
        {
            "entries": [
                {
                    "definition": "surname Lü",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "Lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law/regulation/name of poetic form/standard pitch pipe/to discipline/to guide by principle",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "cantonese",
                },
            ],
            "originalWord": "律",
        },
    ])


    expect(await actions.search("律师aaaa")).toEqual([
        {
            "entries": [
                {
                    "definition": "lawyer",
                    "grammar": false,
                    "length": 2,
                    "originalWord": "律师",
                    "pronunciation": {
                        "cantonese": "leot6 si1",
                        "mandarin": "lu:4 shi1",
                    },
                    "simplified": "律师",
                    "traditional": "律師",
                    "type": "common",
                },
            ],
            "originalWord": "律师",
        },
        {
            "entries": [
                {
                    "definition": "surname Lü",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "Lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "common",
                },
                {
                    "definition": "law/regulation/name of poetic form/standard pitch pipe/to discipline/to guide by principle",
                    "grammar": false,
                    "length": 1,
                    "originalWord": "律",
                    "pronunciation": {
                        "cantonese": "leot6",
                        "mandarin": "lu:4",
                    },
                    "simplified": "律",
                    "traditional": "律",
                    "type": "cantonese",
                },
            ],
            "originalWord": "律",
        },
    ])
})

test("configuration defaults get set", async () => {
    const config = await actions.getConfig()

    expect(config).toEqual({
        css: 'yellow',
        tonecolors: 'yes',
        fontSize: 'small',
        skritterTLD: 'com',
        zhuyin: 'no',
        grammar: 'yes',
        simpTrad: 'classic',
        toneColorScheme: 'standard',
        cantoneseEntriesEnabled: 'yes',
        jyutpingEnabled: 'yes',
        pinyinEnabled: 'yes',
        ttsEnabled: 'no'
    })
})

test("configuration changes take effect", async () => {
    await chrome.storage.local.set({
        "popupcolor": "black",
    })

    const config = await actions.getConfig()

    expect(config).toEqual({
        css: 'black',
        tonecolors: 'yes',
        fontSize: 'small',
        skritterTLD: 'com',
        zhuyin: 'no',
        grammar: 'yes',
        simpTrad: 'classic',
        toneColorScheme: 'standard',
        cantoneseEntriesEnabled: 'yes',
        jyutpingEnabled: 'yes',
        pinyinEnabled: 'yes',
        ttsEnabled: 'no'
    })
})


test("enabling a tab with extension disabled does NOT send a message", async () => {
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();

    await actions.enableTab(1)

    expect(sendMessage).not.toHaveBeenCalled()
})

test("enabling a tab with extension enabled sends a message to the tab", async () => {
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();

    await setup.activateExtension()

    await actions.enableTab(5)

    expect(sendMessage).toHaveBeenCalledWith(5, { type: "enable" })
})
