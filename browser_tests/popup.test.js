import { jest } from '@jest/globals';

import path from 'path';
import { TimeoutError } from 'puppeteer';
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

test("if extension ENABLED, popup appears when hovering over text in plain html", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    // Those coordinates might be screen dependent, but for now they pass on GitHub actions
    // and locally. If they start failng somewhere else, this needs to be revisited
    await page.mouse.move(40, 15)
    const windowHTML = await utils.getZhongwenWindowContent(page)

    expect(windowHTML).not.toBe("")
})

test("if extension DISABLED, popup does not appear when hovering over text in plain html", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    // Those coordinates might be screen dependent, but for now they pass on GitHub actions
    // and locally. If they start failng somewhere else, this needs to be revisited
    await page.mouse.move(40, 15)
    await expect(utils.getZhongwenWindowContent(page)).rejects.toThrow(TimeoutError)
})

test("if extension DISABLED, popup does not appear when hovering over text in an HTML-rich site", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();
    await expect(utils.getZhongwenWindowContent(page)).rejects.toThrow(TimeoutError)
})

test("prints out a valid HTML when hovering over 有 in an HTML-rich site", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();

    const windowHTML = await utils.getZhongwenWindowContent(page)

    expect(windowHTML).toEqual("<span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be</span><br><br><span class=\"grammar\">Press \"g\" for grammar and usage notes.</span><br><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">has or have</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">also/again</span><br>")
})

test("prints out a different HTML when hovering over 有 in an HTML-rich site with a custom config set up", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await worker.evaluate(async () => {
        await chrome.storage.local.set(
            {
                "popupColor": "blue",
                "fontSize": "large",
                "simpTrad": "auto",
                "zhuyin": "yes",
                "grammar": "no",
                "pinyinEnabled": "no",
                "toneColors": "yes",
                "toneColorScheme": "pleco",
                "jyutpingEnabled": "no",
                "cantoneseEntriesEnabled": "no",
                "skritterTLD": "cn",
                "saveToWordList": "firstEntryOnly",
                "ttsEnabled": "yes",
            })
    })

    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    const targetSelector = 'li.spaced ::-p-text(今天) em'
    await page.waitForSelector(targetSelector, { timeout: 6000 })
    await page.locator(targetSelector).hover();
    const windowHTML = await utils.getZhongwenWindowContent(page)

    expect(windowHTML).toEqual("<span class=\"w-hanzi\">有</span>&nbsp;<br><span class=\"tone3 w-zhuyin\">ㄧㄡˇ</span><br><span class=\"w-def\">to have/there is/there are/to exist/to be</span><br>")
})

test("navigation forward and backwards moves between different words", async () => {
    const htmls = {
        "我": "<span class=\"w-hanzi-small\">我</span>&nbsp;<span class=\"w-pinyin-small tone3\">wǒ</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">ngo5</span><br><span class=\"w-def-small\">I/me/my</span><br><span class=\"w-hanzi-small\">我</span>&nbsp;<span class=\"w-pinyin-small tone3\">wǒ</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">ngo5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">I/me/my/us/we/our/self</span><br>",
        "爸爸": "<span class=\"w-hanzi-small\">爸爸</span>&nbsp;<span class=\"w-pinyin-small tone4\">bà</span>&nbsp;<span class=\"w-pinyin-small tone5\">ba</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">baa1 baa1</span><br><span class=\"w-def-small\">(informal) father/CL:個|个[ge4],位[wei4]</span><br><span class=\"w-hanzi-small\">爸</span>&nbsp;<span class=\"w-pinyin-small tone4\">bà</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">baa1</span><br><span class=\"w-def-small\">father/dad/pa/papa</span><br>",
        "爸": "<span class=\"w-hanzi-small\">爸</span>&nbsp;<span class=\"w-pinyin-small tone4\">bà</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">baa1</span><br><span class=\"w-def-small\">father/dad/pa/papa</span><br>",
        "没": "<span class=\"w-hanzi-small\">沒</span>&nbsp;<span class=\"w-hanzi-small\">没</span>&nbsp;<span class=\"w-pinyin-small tone2\">méi</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">mut6</span><br><span class=\"w-def-small\">(negative prefix for verbs)/have not/not</span><br><br><span class=\"grammar\">Press \"g\" for grammar and usage notes.</span><br><br><span class=\"w-hanzi-small\">沒</span>&nbsp;<span class=\"w-hanzi-small\">没</span>&nbsp;<span class=\"w-pinyin-small tone4\">mò</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">mut6</span><br><span class=\"w-def-small\">drowned/to end/to die/to inundate</span><br><span class=\"w-hanzi-small\">沒</span>&nbsp;<span class=\"w-hanzi-small\">没</span>&nbsp;<span class=\"w-pinyin-small tone2\">méi</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">mut6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(determiner) 1. No (e.g. no fun); (preposition) Be without; (adjective) submerged</span><br><span class=\"w-hanzi-small\">沒</span>&nbsp;<span class=\"w-hanzi-small\">没</span>&nbsp;<span class=\"w-pinyin-small tone2\">méi</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">mut6/mei6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(negative prefix for verbs)/have not/not/to be inferior to/to sink/to submerge/to rise beyond/to confiscate/to disappear/to come to an end</span><br>",
        "有": "<span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be</span><br><br><span class=\"grammar\">Press \"g\" for grammar and usage notes.</span><br><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">has or have</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau5</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">to have/there is/there are/to exist/to be/being/a surname/to possess/to own/used in courteous phrases expressing causing trouble/to be betrothed/to be married/to be pregnant/many/to be rich/to have money/abundant/wealthy</span><br><span class=\"w-hanzi-small\">有</span>&nbsp;<span class=\"w-pinyin-small tone3\">yǒu</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">jau6</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">also/again</span><br>",
        "工作": "<span class=\"w-hanzi-small\">工作</span>&nbsp;<span class=\"w-pinyin-small tone1\">gōng</span>&nbsp;<span class=\"w-pinyin-small tone4\">zuò</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gung1 zok3</span><br><span class=\"w-def-small\">to work/(of a machine) to operate/job/work/task/CL:個|个[ge4],份[fen4],項|项[xiang4]</span><br><span class=\"w-hanzi-small\">工</span>&nbsp;<span class=\"w-pinyin-small tone1\">gōng</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gung1</span><br><span class=\"w-def-small\">work/worker/skill/profession/trade/craft/labor</span><br><span class=\"w-hanzi-small\">工</span>&nbsp;<span class=\"w-pinyin-small tone1\">gōng</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gung1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(noun) unit of counting the time in working shift</span><br><span class=\"w-hanzi-small\">工</span>&nbsp;<span class=\"w-pinyin-small tone1\">gōng</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gung1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">work/worker/skill/profession/trade/craft/labor/man-days/skilled/skillful/dextrous/good at/expert at/shift/time used in doing a piece of work/engineering or building project/defense work/fine/KangXi radical 48</span><br>",
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    await page.goto(`file://${path.resolve()}/browser_tests/testdata/wiki-you.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    const targetSelector = 'li.spaced em ::-p-text(我)'
    await page.waitForSelector(targetSelector, { timeout: 2000 })

    await page.locator(targetSelector).hover();

    let windowHTML = await utils.getZhongwenWindowContent(page)

    expect(windowHTML).toEqual(htmls["我"])

    await page.keyboard.press('n')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["爸爸"])

    await page.keyboard.press('m')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["爸"])

    await page.keyboard.press('n')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["没"])

    await page.keyboard.press('n')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["有"])

    await page.keyboard.press('n')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["工作"])

    await page.keyboard.press('b')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["有"])

    await page.keyboard.press('b')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["没"])

    await page.keyboard.press('b')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["爸"])

    await page.keyboard.press('b')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["爸爸"])

    await page.keyboard.press('b')
    await utils.wait(300)
    windowHTML = await utils.getZhongwenWindowContent(page)
    expect(windowHTML).toEqual(htmls["我"])
})

test.each([
    {
        description: "hovering over words with different traditional/simplified characters and default config should display both characters",
        selectors: [
            "#different-simplified-and-traditional #traditional .first",
            "#different-simplified-and-traditional #simplified .first",
        ],
        expectedHTML: "<span class=\"w-hanzi-small\">機會</span>&nbsp;<span class=\"w-hanzi-small\">机会</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;<span class=\"w-pinyin-small tone4\">huì</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1 wui6/wui2</span><br><span class=\"w-def-small\">opportunity/chance/occasion/CL:個|个[ge4]</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">Jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">surname Ji</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic/CL:臺|台[tai2]</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(noun) device</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic M: 台tái [台]/witty/handphone</span><br>",
        config: {},
    },
    {
        description: "hovering over traditional characters with auto detection in config displays only the traditional characters",
        selectors: [
            "#different-simplified-and-traditional #traditional .first",
        ],
        expectedHTML: "<span class=\"w-hanzi-small\">機會</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;<span class=\"w-pinyin-small tone4\">huì</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1 wui6/wui2</span><br><span class=\"w-def-small\">opportunity/chance/occasion/CL:個|个[ge4]</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-pinyin-small tone1\">Jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">surname Ji</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic/CL:臺|台[tai2]</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(noun) device</span><br><span class=\"w-hanzi-small\">機</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic M: 台tái [台]/witty/handphone</span><br>",
        config: {
            "simpTrad": "auto"
        },
    },
    {
        description: "hovering over simplified characters with auto detection in config displays only the simplified characters",
        selectors: [
            "#different-simplified-and-traditional #simplified .first",
        ],
        expectedHTML: "<span class=\"w-hanzi-small\">机会</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;<span class=\"w-pinyin-small tone4\">huì</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1 wui6/wui2</span><br><span class=\"w-def-small\">opportunity/chance/occasion/CL:個|个[ge4]</span><br><span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">Jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">surname Ji</span><br><span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic/CL:臺|台[tai2]</span><br><span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">(noun) device</span><br><span class=\"w-hanzi-small\">机</span>&nbsp;<span class=\"w-pinyin-small tone1\">jī</span>&nbsp;&nbsp;&nbsp;<span class=\"w-pinyin-small\">gei1</span><span style=\"float: right\" class=\"w-pinyin-small\">Cant.</span><br><span class=\"w-def-small\">machine/engine/opportunity/intention/aircraft/pivot/crucial point/flexible (quick-witted)/organic M: 台tái [台]/witty/handphone</span><br>",
        config: {
            "simpTrad": "auto"
        },
    },
])("$description", async ({ selectors, expectedHTML, config }) => {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/test-cases.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });
    await page.bringToFront();

    await worker.evaluate(async (config) => {
        await chrome.storage.local.set(config)
    }, config)
    await utils.toggleExtension(worker)
    await utils.hideHelp(page)

    for (const targetSelector of selectors) {
        await page.waitForSelector(targetSelector, { timeout: 2000 })
        // Without resetting the mouse position hovering on the second element
        // often does not bring up the dictionary
        await page.mouse.move(0, 0)
        await page.locator(targetSelector).hover();

        const windowHTML = await utils.getZhongwenWindowContent(page)
        expect(windowHTML).toEqual(expectedHTML)
    }
})
