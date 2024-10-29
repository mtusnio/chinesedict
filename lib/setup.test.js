'use strict';

import { expect, jest } from '@jest/globals';
import * as setup from "./setup.js";

jest.useFakeTimers();

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});

test("install sets up the context menus properly", async () => {
    const createContextMenu = jest.spyOn(chrome.contextMenus, "create").mockReturnValue();
    const addListener = jest.spyOn(chrome.contextMenus.onClicked, "addListener").mockReturnValue();
    jest.spyOn(chrome.tabs, "query").mockReturnValue([
        {
            tabId: 1,
            url: "https://test.local"
        },
        {
            tabId: 2,
            url: "https://test-2.local"
        }
    ]);
    const insertCSS = jest.spyOn(chrome.scripting, "insertCSS").mockReturnValue();
    const executeScript = jest.spyOn(chrome.scripting, "executeScript").mockReturnValue();

    await setup.install()

    expect(createContextMenu).toHaveBeenCalledWith({
        id: "wordlist",
        title: "Open word list",
        contexts: ["action"]
    })
    expect(createContextMenu).toHaveBeenCalledWith({
        id: "help",
        title: "Open help",
        contexts: ["action"]
    })
    expect(addListener).toHaveBeenCalled()
    expect(insertCSS).toHaveBeenCalledTimes(2)
    expect(executeScript).toHaveBeenCalledTimes(2)
})

test("activate extension configures the dictionary, changes enabled status and changes the badge", async () => {
    const setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    const setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();
    const setIcon = jest.spyOn(chrome.action, "setIcon").mockReturnValue();

    await setup.activateExtension(0, true)

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(setup.getDictionary().dictionary.size).not.toEqual(0)

    expect(setBadgeBackgroundColor).toHaveBeenCalled()
    expect(setBadgeText).toHaveBeenCalled()
    expect(setIcon).toHaveBeenCalled()

    expect(sendMessage).toHaveBeenCalledWith(0, { type: "enable" })
    expect(sendMessage).toHaveBeenCalledWith(0, { type: "showHelp" })
});

test("activate extension with false showHelp does not send a showHelp message", async () => {
    const setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    const setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();
    const setIcon = jest.spyOn(chrome.action, "setIcon").mockReturnValue();

    await setup.activateExtension(0, false)

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(setup.getDictionary().dictionary.size).not.toEqual(0)

    expect(setBadgeBackgroundColor).toHaveBeenCalled()
    expect(setBadgeText).toHaveBeenCalled()
    expect(setIcon).toHaveBeenCalled()

    expect(sendMessage).toHaveBeenCalledWith(0, { type: "enable" })
    expect(sendMessage).not.toHaveBeenCalledWith(0, { type: "showHelp" })
});


test("deactivating the extension clears the dictionary, changes enabled status and removes the badge", async () => {
    const setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    const setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();
    const setIcon = jest.spyOn(chrome.action, "setIcon").mockReturnValue();

    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();

    jest.spyOn(chrome.windows, "getAll").mockReturnValue([
        {
            tabs: [
                {
                    id: 1
                },
                {
                    id: 2
                }
            ]
        },
        {
            tabs: [
                {
                    id: 3
                },
                {
                    id: 4
                }
            ]
        }
    ]);


    await setup.deactivateExtension()

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(false)
    expect(setup.getDictionary()).toBe(null)

    expect(setBadgeBackgroundColor).toHaveBeenCalled()
    expect(setBadgeText).toHaveBeenCalled()
    expect(setIcon).toHaveBeenCalled()

    expect(sendMessage).toHaveBeenCalledWith(1, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(2, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(3, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(4, { type: "disable" })
});


test("activate extension toggle switches correctly", async () => {
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();
    jest.spyOn(chrome.windows, "getAll").mockReturnValue([
        {
            tabs: [
                {
                    id: 1
                },
                {
                    id: 2
                }
            ]
        },
        {
            tabs: [
                {
                    id: 3
                },
                {
                    id: 4
                }
            ]
        }
    ]);

    await setup.toggleExtension({
        id: 10
    })
    let data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(sendMessage).toHaveBeenCalledWith(10, { type: "enable" })


    await setup.toggleExtension({
        id: 10
    })
    data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(false)
    expect(sendMessage).toHaveBeenCalledWith(1, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(2, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(3, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(4, { type: "disable" })
});

