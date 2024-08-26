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

test("pressing wordlist button shows popup and adds the word to the wordlist", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.wait(500)

    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();
    await page.waitForSelector(utils.ZHONGWEN_WINDOW_SELECTOR, { timeout: 6000 });

    await page.keyboard.press("r")
    await utils.wait(500)
    await page.waitForSelector(utils.ZHONGWEN_WINDOW_SELECTOR, { timeout: 6000 });
    const windowHTML = await page.$eval(utils.ZHONGWEN_WINDOW_SELECTOR, (element) => {
        return element.innerHTML
    })

    expect(windowHTML).toEqual("Added to word list.<p>Press Alt+W to open word list.</p>")
    await page.keyboard.down('AltLeft')
    await page.keyboard.press('KeyW')
    await page.keyboard.up('AltLeft')

    await utils.wait(1000)


    const wordlistPage = await (await browser.pages()).findLast(async (page) => {
        const url = await page.url()

        if (url == `chrome-extension://${utils.EXTENSION_ID}/options.html`) {
            return true
        }
        return false
    })

    await wordlistPage.bringToFront()
    expect(await wordlistPage).not.toEqual(undefined)

    await wordlistPage.waitForSelector("::-p-text(有)", { timeout: 2000 })
})
