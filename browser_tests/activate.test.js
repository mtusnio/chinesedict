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

test("extension is disabled by default", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });

    await page.bringToFront();

    const status = await utils.getExtensionStatus(worker)
    expect(status.storage).toEqual({})
    expect(status.badgeData).toEqual({
        "text": "", "color": [0, 0, 0, 0]
    })
})

test("toggling the extension on/off two times works", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });

    await page.bringToFront();

    for (let i = 0; i < 2; i++) {
        // On
        await utils.toggleExtension(worker)
        // Need a slight wait for the extension to trigger
        await utils.wait(200)
        let status = await utils.getExtensionStatus(worker)
        expect(status.storage).toEqual({ "enabled": true })
        expect(status.badgeData).toEqual({
            "text": "On", "color": [255, 0, 0, 255]
        })

        // Off
        await utils.toggleExtension(worker)
        await utils.wait(200)
        status = await utils.getExtensionStatus(worker)
        expect(status.storage).toEqual({ "enabled": false })
        expect(status.badgeData).toEqual({
            "text": "", "color": [0, 0, 0, 0]
        })
    }

});
