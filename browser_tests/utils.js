import * as puppeteer from "puppeteer";

const EXTENSION_PATH = './';
const EXTENSION_ID = "aoofnmlljjgifabglpelnbmipdfnfflk"
const ZHONGWEN_WINDOW_SELECTOR = "#zhongwen-window"

async function setupBrowser() {
    let headless = true
    let dumpio = false
    // if (process.env["HEADLESS"]) {
    //     headless = process.env["HEADLESS"] === "true"
    // }
    // Apparently some tests do not pass reliably if headless is set to true,
    // keeping this off by default for now
    headless = false
    if (process.env["DUMPIO"]) {
        dumpio = process.env["DUMPIO"] === "true"
    }


    const browser = await puppeteer.launch({
        browser: "chrome",
        headless: headless,
        devTools: true,
        dumpio: dumpio,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`,
            `--window-size=1280,720`
        ]
    });

    const workerTarget = await browser.waitForTarget(
        target =>
            target.type() === 'service_worker' && target.url().endsWith('worker.js')
    );
    const worker = await workerTarget.worker()

    while (true) {
        // Wait until permissions have been granted and extensions
        // has access to the various APIs
        const apiIsReady = await worker.evaluate(() => {
            if (chrome.storage === undefined || chrome.storage.local === undefined) {
                return false
            }

            if (chrome.query == undefined) {
                return false
            }

            return true
        })

        if (apiIsReady) {
            break
        }

        await wait(500)

        return { browser, worker }
    }
}

async function getExtensionStatus(worker) {
    const storage = await worker.evaluate(async () => {
        return await chrome.storage.local.get(["enabled"])
    })
    const badgeData = await worker.evaluate(async () => {
        return {
            "text": await chrome.action.getBadgeText({}),
            "color": await chrome.action.getBadgeBackgroundColor({}),
        }
    })

    return {
        storage,
        badgeData
    }
}

async function toggleExtension(worker) {
    await worker.evaluate(async () => {
        const tabs = await chrome.tabs.query({ active: true })
        await chrome.action.onClicked.dispatch(tabs[0]);
    });
    // TODO: Get rid of this wait somehow
    await wait(1000)
}

async function hideHelp(page) {
    // A bit heavy handed but solutions like mouse moving etc.
    // did not work properly.
    await page.evaluate(async () => {
        let popup = document.getElementById('zhongwen-window');
        if (popup) {
            popup.remove()
        }
    });
    await wait(100)
}

async function wait(miliseconds) {
    await new Promise((r) => setTimeout(r, miliseconds));
}

async function findOpenedPage(browser, url, timeout) {
    const STEP = 500
    let curTime = 0
    while (true) {
        const allPages = await browser.pages()
        for (const page of allPages) {
            const pageURL = await page.url()

            if (pageURL === url) {
                return page
            }
        }

        if (curTime >= timeout) {
            return null
        }

        curTime += STEP
        await wait(STEP)
    }
}

async function getRetryTimes() {
    if (process.env["RETRY_TIMES"]) {
        return +process.env["RETRY_TIMES"]
    }

    return 3
}

async function getZhongwenWindowContent(page) {
    await page.waitForSelector(ZHONGWEN_WINDOW_SELECTOR, { timeout: 2000 });
    await page.waitForFunction(
        selector => document.querySelector(selector).innerHTML.trim() != "",
        {
            timeout: 2000
        },
        ZHONGWEN_WINDOW_SELECTOR
    );
    const windowHTML = await page.$eval(ZHONGWEN_WINDOW_SELECTOR, (element) => {
        return element.innerHTML
    })
    return windowHTML
}

export { EXTENSION_ID, EXTENSION_PATH, ZHONGWEN_WINDOW_SELECTOR, findOpenedPage, getExtensionStatus, getRetryTimes, getZhongwenWindowContent, hideHelp, setupBrowser, toggleExtension, wait };

