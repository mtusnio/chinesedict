'use strict';

import * as utils from "./utils";
let browser = null;
let worker = null

beforeEach(async () => {
    const setupData = await utils.setupBrowser()
    browser = setupData.browser
    worker = setupData.worker
});

afterEach(async () => {
    await browser.close();
    browser = null;
    worker = null
});

describe("the options page", function () {
    it("loads properly", async () => {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${utils.EXTENSION_ID}/options.html`);
    })
})
