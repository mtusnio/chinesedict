import { jest } from '@jest/globals';
import * as fs from "node:fs/promises";
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

async function createEntries(count) {
    await worker.evaluate(async (count) => {
        const fakeDate = new Date('2024-01-01')
        if (!count) {
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
                    },]
                })
        } else {
            const wordlist = []
            for (let i = 0; i < count; i++) {
                wordlist.push({
                    timestamp: fakeDate.getTime(),
                    simplified: "水",
                    traditional: "水",
                    pinyin: "shui3",
                    definition: "water",
                    jyutping: "seoi2"
                })
            }
            await chrome.storage.local.set(
                {
                    "wordlist": wordlist
                })
        }
    }, count)

}

test("opening the wordlist with pre-existing entries displays then properly", async () => {
    const page = await browser.newPage();

    // The toggle here is primarily to allow for the extension to initialise
    // properly, otherwise occassionally tests fail due to chrome.* objects
    // being undefined
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    await createEntries()

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
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
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 2000 })
    await page.locator(targetSelector).hover();
    await utils.getZhongwenWindowContent(page)

    await page.keyboard.press("r")
    await utils.wait(500)
    const windowHTML = await utils.getZhongwenWindowContent(page)

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
            "<td class=\"sorting_1\">0</td><td>有</td><td>有</td><td>yǒu</td><td>jau5</td><td>to have; there is/(bound form) having; with; -ful; -ed; -al (as in 有意[you3 yi4] intentional)</td><td><i>Edit</i></td>",
            "<td class=\"sorting_1\">2</td><td>有</td><td>有</td><td>yǒu</td><td>jau5</td><td>to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</td><td><i>Edit</i></td>",
        ])
})

test("saving words to a text file exports them correctly", async () => {
    const page = await browser.newPage();

    // The toggle here is primarily to allow for the extension to initialise
    // properly, otherwise occassionally tests fail due to chrome.* objects
    // being undefined
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)


    await createEntries()

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await page.waitForSelector("::-p-text(水)", { timeout: 2000 })
    const directory = await fs.mkdtemp("/tmp/chinesedict-test")
    try {
        await page._client().send('Page.setDownloadBehavior', {
            behavior: 'allow',
            downloadPath: directory
        });
        await page.locator("#selectAll").click()
        await page.locator("#saveList").click()
        await utils.wait(1000)

        const contents = await fs.readFile(`${directory}/ChineseDict-Words.txt`)
        expect(contents.toString()).toEqual(`水	水	shui3	seoi2	water
水	水	shui1	seoi3	another water
`)
    } finally {
        await fs.rm(directory, { recursive: true })
    }
})

test("deleting selected rows works correctly", async () => {
    const page = await browser.newPage();

    // The toggle here is primarily to allow for the extension to initialise
    // properly, otherwise occassionally tests fail due to chrome.* objects
    // being undefined
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    await createEntries()

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await page.waitForSelector("::-p-text(水)", { timeout: 2000 })
    await page.locator("#words .even").click()
    await utils.wait(500)
    await page.locator("#delete").click()

    const rowCount = (await page.$$("#words tbody tr")).length
    expect(rowCount).toEqual(1)
})


test("changing display count changes the amount of rows", async () => {
    const page = await browser.newPage();

    // The toggle here is primarily to allow for the extension to initialise
    // properly, otherwise occassionally tests fail due to chrome.* objects
    // being undefined
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    await createEntries(35)

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await page.waitForSelector("::-p-text(水)", { timeout: 2000 })

    let rowCount = (await page.$$("#words tbody tr")).length
    expect(rowCount).toEqual(10)

    await page.select("select[name='words_length']", "25")

    rowCount = (await page.$$("#words tbody tr")).length
    expect(rowCount).toEqual(25)
})

test("editing notes works", async () => {
    const page = await browser.newPage();

    // The toggle here is primarily to allow for the extension to initialise
    // properly, otherwise occassionally tests fail due to chrome.* objects
    // being undefined
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    await createEntries(1)

    await page.goto(`chrome-extension://${utils.EXTENSION_ID}/wordlist.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    const notesFieldSelector = ".row td:last-child"
    const textAreaSelector = "#editNotes textArea"
    const notesLastField = await page.waitForSelector(notesFieldSelector, { timeout: 2000 })
    await notesLastField.click()

    await page.waitForSelector(textAreaSelector, { visible: true, timeout: 2000 })
    await page.type(textAreaSelector, 'My custom note', { delay: 20 })

    const saveButton = await page.waitForSelector("#saveNotes")
    await saveButton.click()

    const notesHTML = await page.$eval(notesFieldSelector, (element) => {
        return element.innerHTML
    })
    expect(notesHTML).toEqual("My custom note")
})

