'use strict';

import * as setup from "./setup.js"
import { jest } from '@jest/globals';

jest.useFakeTimers();

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});

test("activate extension configures the dictionary, changes enabled status and changes the badge", async () => {
    setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.activateExtension(0)

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
    expect(setup.getDictionary().dictionary.size).not.toEqual(0)

    expect(setBadgeBackgroundColor.mock.calls).toHaveLength(1)
    expect(setBadgeText.mock.calls).toHaveLength(1)
});

test("deactivating the extension clears the dictionary, changes enabled status and removes the badge", async () => {
    setBadgeBackgroundColor = jest.spyOn(chrome.action, "setBadgeBackgroundColor").mockReturnValue();
    setBadgeText = jest.spyOn(chrome.action, "setBadgeText").mockReturnValue();

    await setup.deactivateExtension()

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(false)
    expect(setup.getDictionary()).toBe(null)

    expect(setBadgeBackgroundColor.mock.calls).toHaveLength(1)
    expect(setBadgeText.mock.calls).toHaveLength(1)
});


test("activate extension toggle switches correctly", async () => {
    await setup.activateExtensionToggle()
    let data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)

    await setup.activateExtensionToggle()
    data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(false)
});

