
import { jest } from '@jest/globals';

import path from 'path';
import * as utils from "./utils";

jest.retryTimes(utils.getRetryTimes());

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

test("pressing the grammar shortcut loads up grammar wiki", async () => {
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

    const windowHTML = await page.$eval(utils.ZHONGWEN_WINDOW_SELECTOR, (element) => {
        return element.innerHTML
    })

    expect(windowHTML).toEqual("<span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be</span><br><br><span class=\"grammar\">Press \"g\" for grammar and usage notes.</span><br><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">has or have</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">also/again</span><br>")

    await page.keyboard.press("g")
    await utils.wait(2000)

    const grammarPage = await utils.findOpenedPage(browser, `https://resources.allsetlearning.com/chinese/grammar/%E6%9C%89`)
    expect(grammarPage).not.toBeNull()
})

test("pressing the skritter shortcut loads up legacy skritter", async () => {
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

    await page.keyboard.press("s")
    // TODO: figure out how to avoid this long wait while skritter is redirecting
    await utils.wait(5000)

    // Test is not logged in hence it will end up being redirected to skritter login page
    const skritterPage = await utils.findOpenedPage(browser, `https://skritter.com/login`)
    expect(skritterPage).not.toBeNull()
})

test("pressing the copy shortcut puts the definition in clipboard", async () => {
    const testFileURL = `file://${path.resolve()}/browser_tests/testdata/wiki-you.html`

    const page = await browser.newPage();

    const context = browser.defaultBrowserContext();
    await context.overridePermissions(testFileURL, [
        "clipboard-read",
    ]);

    await page.goto(testFileURL, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.wait(500)

    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();
    await page.waitForSelector(utils.ZHONGWEN_WINDOW_SELECTOR, { timeout: 6000 });

    await page.keyboard.press("c")
    await utils.wait(500)

    const windowHTML = await page.$eval(utils.ZHONGWEN_WINDOW_SELECTOR, (element) => {
        return element.innerHTML
    })

    expect(windowHTML).toEqual("Copied to clipboard")

    const clipboardContent = await page.evaluate(async () => {
        const text = navigator.clipboard.readText();
        return text;
    });

    expect(clipboardContent).toEqual(`有	有	jau5	yǒu	to have/there is/there are/to exist/to be
有	有	jau5	yǒu	has or have
有	有	jau5	yǒu	to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy
有	有	jau6	yǒu	also/again
`)
})

test.each([
    { key: "1", url: "https://english.dict.naver.com/english-chinese-dictionary/#/search?query=%E6%9C%89" },
    { key: "2", url: "https://forvo.com/search/%E6%9C%89/zh/" },
    { key: "3", url: "https://dict.cn/%E6%9C%89" },
    { key: "4", url: "https://www.iciba.com/word?w=%E6%9C%89" },
    { key: "5", url: "https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=%E6%9C%89" },
    { key: "6", url: "https://www.moedict.tw/~%E6%9C%89" }
])("pressing alt + $key opens up dictionary entry at $url", async ({ key, url }) => {
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

    await page.keyboard.down('AltLeft')
    await page.keyboard.press(key)
    await page.keyboard.up('AltLeft')

    // TODO: figure out how to avoid this long wait while redirecting
    await utils.wait(3000)

    const dictionaryPage = await utils.findOpenedPage(browser, url)
    expect(dictionaryPage).not.toBeNull()
})

test("pressing 't' opens up Tatoeba", async () => {
    const url = "https://tatoeba.org/en/sentences/search?from=cmn&to=eng&query=%E6%9C%89"
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

    await page.keyboard.press('t')

    // TODO: figure out how to avoid this long wait while redirecting
    await utils.wait(3000)

    const dictionaryPage = await utils.findOpenedPage(browser, url)
    expect(dictionaryPage).not.toBeNull()
})
