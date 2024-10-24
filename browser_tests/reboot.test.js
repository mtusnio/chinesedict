import { jest } from '@jest/globals';

import path from 'path';
import * as utils from "./utils";
import * as fs from "node:fs/promises";

jest.retryTimes(utils.getRetryTimes());

test("if user data is persistent, extension gets enabled, and browser restarted, it will still work", async () => {
    let browser = null

    const directory = await fs.mkdtemp("/tmp/chinesedict-test")
    try {
        let setupData = await utils.setupBrowser(directory)
        browser = setupData.browser
        let worker = setupData.worker

        let page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
        await page.bringToFront();

        await utils.toggleExtension(worker)
        await utils.hideHelp(page)

        await browser.close()

        // Try again

        setupData = await utils.setupBrowser(directory)
        browser = setupData.browser
        worker = setupData.worker

        page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 720 });

        await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
        await page.bringToFront();

        // Those coordinates might be screen dependent, but for now they pass on GitHub actions
        // and locally. If they start failng somewhere else, this needs to be revisited
        await page.mouse.move(40, 15)
        const windowHTML = await utils.getZhongwenWindowContent(page)

        expect(windowHTML).not.toBe("")
    } finally {
        await fs.rm(directory, { recursive: true })
        await browser.close()
    }
})
