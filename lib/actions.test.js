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
