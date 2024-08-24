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
    await browser.close();
    browser = null;
    worker = null
});

test("popup appears when hovering over text in plain html", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.wait(500)

    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    // Those coordinates might be screen dependent, but for now they pass on GitHub actions
    // and locally. If they start failng somewhere else, this needs to be revisited
    await page.mouse.move(40, 15)
    const exists = !! await page.waitForSelector("#zhongwen-window", { timeout: 5000 });
    expect(exists).toBe(true)
})
