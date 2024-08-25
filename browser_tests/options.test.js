'use strict';

import path from 'path';
import * as utils from "./utils";

let browser = null;
let worker = null

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

async function testChecked(page, selector, expectedChecked) {
    await page.waitForSelector(selector)
    const isChecked = await page.$eval(selector, (input) => {
        return input.checked;
    });

    expect(isChecked).toBe(expectedChecked)
}

describe("the options page", function () {
    it("loads properly default page", async () => {
        const page = await browser.newPage();
        await page.goto(`chrome-extension://${utils.EXTENSION_ID}/options.html`);
        await page.bringToFront();

        await testChecked(page, "input[name='popupColor'][value='yellow']", true)
        await testChecked(page, "input[name='fontSize'][value='small']", true)
        await testChecked(page, "input[name='simpTrad'][value='classic']", true)
        await testChecked(page, "input[name='zhuyin']", false)
        await testChecked(page, "input[name='grammar']", true)
        await testChecked(page, "input[name='pinyinEnabled']", true)
        await testChecked(page, "input[name='toneColors'][value='standard']", true)
        await testChecked(page, "input[name='jyutpingEnabled']", true)
        await testChecked(page, "input[name='cantoneseEntriesEnabled']", true)
        await testChecked(page, "input[name='saveToWordList'][value='allEntries']", true)
        await testChecked(page, "input[name='skritterTLD'][value='com']", true)
        await testChecked(page, "input[name='ttsEnabled']", false)
    })

    it("loads all values changed", async () => {
        let page = await browser.newPage();
        await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });

        await worker.evaluate(async () => {
            await chrome.storage.local.set(
                {
                    "popupcolor": "blue",
                    "fontSize": "large",
                    "simpTrad": "auto",
                    "zhuyin": "yes",
                    "grammar": "no",
                    "pinyinEnabled": "no",
                    "tonecolors": "yes",
                    "toneColorScheme": "pleco",
                    "jyutpingEnabled": "no",
                    "cantoneseEntriesEnabled": "no",
                    "skritterTLD": "cn",
                    "saveToWordList": "firstEntryOnly",
                    "ttsEnabled": "yes",
                })
        })
        await page.close()
        page = await browser.newPage();
        await page.bringToFront();

        await page.goto(`chrome-extension://${utils.EXTENSION_ID}/options.html`);

        await testChecked(page, "input[name='popupColor'][value='blue']", true)
        await testChecked(page, "input[name='fontSize'][value='large']", true)
        await testChecked(page, "input[name='simpTrad'][value='auto']", true)
        await testChecked(page, "input[name='zhuyin']", true)
        await testChecked(page, "input[name='grammar']", false)
        await testChecked(page, "input[name='pinyinEnabled']", false)
        await testChecked(page, "input[name='toneColors'][value='pleco']", true)
        await testChecked(page, "input[name='jyutpingEnabled']", false)
        await testChecked(page, "input[name='cantoneseEntriesEnabled']", false)
        await testChecked(page, "input[name='saveToWordList'][value='firstEntryOnly']", true)
        await testChecked(page, "input[name='skritterTLD'][value='cn']", true)
        await testChecked(page, "input[name='ttsEnabled']", true)
    })
})
