'use strict';

import * as actions from "./actions.js";
import * as setup from "./setup.js";
import * as wordlist from "./wordlist.js";

import { jest } from '@jest/globals';

const fakeDate = new Date('2024-01-01')
jest.useFakeTimers().setSystemTime(fakeDate);

beforeEach(async () => {

})

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});


test("if dictionary is not set-up, it gets set up and returns an entry for the word", async () => {
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


test("if dictionary is set-up, returns an entry for the word", async () => {
    jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.loadDictionary()

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
    jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.loadDictionary()

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



test("enabling a tab with extension disabled does NOT send a message", async () => {
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();

    await actions.enableTab(1)

    expect(sendMessage).not.toHaveBeenCalled()
    expect(setup.isActivated()).toEqual(false)
})

test("enabling a tab with extension enabled sends a message to the tab and activates the extension", async () => {
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();
    jest.spyOn(chrome.action, "setIcon").mockReturnValue();
    jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await chrome.storage.local.set({
        enabled: true
    })

    await actions.enableTab(5)

    expect(sendMessage).toHaveBeenCalledWith(5, { type: "enable" })
    expect(sendMessage).toHaveBeenCalledTimes(1)

    expect(setup.isActivated()).toEqual(true)
})


test("adding entries to the word list without save first entry only adds all of them", async () => {
    let entries = [{
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "water",
        jyutping: "seoi2"
    },
    {
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "another water",
        jyutping: "seoi2"
    }];

    await actions.addtoWordlist(entries)

    const returnedEntries = await wordlist.get()

    expect(returnedEntries).toEqual([{
        timestamp: fakeDate.getTime(),
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "water",
        jyutping: "seoi2"
    },
    {
        timestamp: fakeDate.getTime(),
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "another water",
        jyutping: "seoi2"
    }])
})

test("adding entries to the word list with save first entry only adds first of them", async () => {
    let entries = [{
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "water",
        jyutping: "seoi2"
    },
    {
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "another water",
        jyutping: "seoi2"
    }];

    await chrome.storage.local.set({
        "saveToWordList": 'firstEntryOnly'
    })

    await actions.addtoWordlist(entries)

    const returnedEntries = await wordlist.get()

    expect(returnedEntries).toEqual([{
        timestamp: fakeDate.getTime(),
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "water",
        jyutping: "seoi2"
    }])
})
