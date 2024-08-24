'use strict';

import { jest } from '@jest/globals';
import * as setup from "./setup.js";

jest.useFakeTimers();

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});

test("activate extension configures the dictionary, changes enabled status and changes the badge", async () => {
    const setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    const setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();
    const sendMessage = jest.spyOn(chrome.tabs, "sendMessage").mockReturnValue();


    await setup.activateExtension(0)

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(setup.getDictionary().dictionary.size).not.toEqual(0)

    expect(setBadgeBackgroundColor).toHaveBeenCalled()
    expect(setBadgeText).toHaveBeenCalled()
    expect(sendMessage).toHaveBeenCalledWith(0, { type: "enable" })
});

test("deactivating the extension clears the dictionary, changes enabled status and removes the badge", async () => {
    const setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    const setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();
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

    await setup.activateExtensionToggle({
        id: 10
    })
    let data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(sendMessage).toHaveBeenCalledWith(10, { type: "enable" })


    await setup.activateExtensionToggle({
        id: 10
    })
    data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(false)
    expect(sendMessage).toHaveBeenCalledWith(1, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(2, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(3, { type: "disable" })
    expect(sendMessage).toHaveBeenCalledWith(4, { type: "disable" })
});

