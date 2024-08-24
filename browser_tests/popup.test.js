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
    await utils.wait(200)

    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    await page.mouse.move(50, 10)
    const exists = !! await page.waitForSelector("#zhongwen-window");
    expect(exists).toBe(true)
})
