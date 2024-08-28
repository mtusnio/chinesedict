import { jest } from '@jest/globals';
import path from 'path';
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

test("opening the wordlist with pre-existing entries displays then properly", async () => {
    const page = await browser.newPage();

    await worker.evaluate(async () => {
        const fakeDate = new Date('2024-01-01')
        await chrome.storage.local.set(
            {
                "wordlist": [{
                    timestamp: fakeDate.getTime(),
                    simplified: "水",
                    traditional: "水",
                    pinyin: "shui3",
                    definition: "water",
                    jyutping: "seoi2"
                },
                {
                    timestamp: fakeDate.getTime(),
                    simplified: "水",
                    traditional: "水",
                    pinyin: "shui1",
                    definition: "another water",
                    jyutping: "seoi3"
                }]
            })
    })

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`);
    await page.bringToFront();

    await page.waitForSelector("::-p-text(水)", { timeout: 2000 })

    const evenInnerHTML = await page.$$eval("#words .even", (elements) => {
        return elements.map(e => e.innerHTML)
    })

    const oddInnerHTML = await page.$$eval("#words .odd", (elements) => {
        return elements.map(e => e.innerHTML)
    })

    expect(oddInnerHTML).toEqual(
        [
            "<td class=\"sorting_1\">0</td><td>水</td><td>水</td><td>shui3</td><td>seoi2</td><td>water</td><td><i>Edit</i></td>",
        ])
    expect(evenInnerHTML).toEqual(
        [
            "<td class=\"sorting_1\">1</td><td>水</td><td>水</td><td>shui1</td><td>seoi3</td><td>another water</td><td><i>Edit</i></td>",
        ])
})


test("pressing wordlist button shows popup and adds the word to the wordlist", async () => {
    let page = await browser.newPage();
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

    page = (await browser.pages()).at(-1)

    expect(page).not.toBeNull()
    await page.bringToFront()

    await page.waitForSelector("::-p-text(有)", { timeout: 2000 })

    const evenInnerHtml = await page.$$eval("#words .even", (elements) => {
        return elements.map(e => e.innerHTML)
    })
    const oddInnerHtml = await page.$$eval("#words .odd", (elements) => {
        return elements.map(e => e.innerHTML)
    })

    expect(evenInnerHtml).toEqual(
        [
            "<td class=\"sorting_1\">1</td><td>有</td><td>有</td><td>yǒu</td><td>jau5</td><td>has or have</td><td><i>Edit</i></td>",
            "<td class=\"sorting_1\">3</td><td>有</td><td>有</td><td>yǒu</td><td>jau6</td><td>also/again</td><td><i>Edit</i></td>"
        ])
    expect(oddInnerHtml).toEqual(
        [
            "<td class=\"sorting_1\">0</td><td>有</td><td>有</td><td>yǒu</td><td>jau5</td><td>to have/there is/there are/to exist/to be</td><td><i>Edit</i></td>",
            "<td class=\"sorting_1\">2</td><td>有</td><td>有</td><td>yǒu</td><td>jau5</td><td>to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</td><td><i>Edit</i></td>",
        ])
})
