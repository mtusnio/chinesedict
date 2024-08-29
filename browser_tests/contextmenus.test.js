import { jest } from '@jest/globals';
import * as utils from "./utils";

let browser = null;
let worker = null


jest.retryTimes(utils.getRetryTimes());
beforeEach(async () => {
    const setupData = await utils.setupBrowser()
    browser = setupData.browser
    worker = setupData.worker
});

afterEach(async () => {
    if (process.env["DO_NOT_CLOSE"] != "true") {
        await browser.close();
        browser = null;
        worker = null
    }
});

test("help page opens properly", async () => {
    const page = await browser.newPage();
    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/help.html`);
    await page.bringToFront();
    await page.waitForSelector("h3")
})
