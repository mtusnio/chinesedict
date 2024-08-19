'use strict';

import * as setup from "./setup.js"

import { jest } from '@jest/globals';

jest.useFakeTimers();

test("activateExtension sets the extension to enabled", async () => {
    await setup.activateExtension(0, true)

    const data = await chrome.storage.local.get(["enabled"])
    expect(data.enabled).toBe(true)
});
