import path from 'path';
import { TimeoutError } from 'puppeteer';
import * as utils from "./utils";


let browser = null;
let worker = null

const zhongwenWindowSelector = "#zhongwen-window"

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

test("if extension ENABLED, popup appears when hovering over text in plain html", async () => {
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
    const exists = !! await page.waitForSelector(zhongwenWindowSelector, { timeout: 6000 });
    expect(exists).toBe(true)
})

test("if extension DISABLED, popup does not appear when hovering over text in plain html", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();


    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    // Those coordinates might be screen dependent, but for now they pass on GitHub actions
    // and locally. If they start failng somewhere else, this needs to be revisited
    await page.mouse.move(40, 15)
    await expect(page.waitForSelector(zhongwenWindowSelector, { timeout: 3000 })).rejects.toThrow(TimeoutError)
})

test("if extension DISABLED, popup does not appear when hovering over text in an HTML-rich site", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await page.setViewport({ width: 1280, height: 720 });
    await utils.wait(500)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();
    await expect(page.waitForSelector(zhongwenWindowSelector, { timeout: 3000 })).rejects.toThrow(TimeoutError)
})

test("prints out a valid HTML when hovering over 有 in an HTML-rich site", async () => {
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
    const exists = !! await page.waitForSelector(zhongwenWindowSelector, { timeout: 6000 });
    expect(exists).toBe(true)

    const windowHTML = await page.$eval(zhongwenWindowSelector, (element) => {
        return element.innerHTML
    })

    expect(windowHTML).toEqual("<span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">has or have</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">also/again</span><br>")
})
