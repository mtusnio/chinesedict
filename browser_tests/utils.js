import * as puppeteer from "puppeteer";

const EXTENSION_PATH = './';
const EXTENSION_ID = "aoofnmlljjgifabglpelnbmipdfnfflk"
const ZHONGWEN_WINDOW_SELECTOR = "#zhongwen-window"

async function setupBrowser() {
    let headless = true
    let dumpio = false
    if (process.env["HEADLESS"]) {
        headless = process.env["HEADLESS"] === "true"
    }
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
        // Assumes that there is only one service worker created by the extension and its URL ends with background.js.
        target =>
            target.type() === 'service_worker'
    );
    const worker = await workerTarget.worker()
    return { browser, worker }
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
}

async function wait(miliseconds) {
    await new Promise((r) => setTimeout(r, miliseconds));
}

async function findOpenedPage(browser, url) {
    const allPages = await browser.pages()
    for (const page of allPages) {
        const pageURL = await page.url()

        if (pageURL === url) {
            return page
        }
    }

    return null
}

async function getRetryTimes() {
    if (process.env["RETRY_TIMES"]) {
        return +process.env["RETRY_TIMES"]
    }

    return 3
}
export { EXTENSION_ID, EXTENSION_PATH, ZHONGWEN_WINDOW_SELECTOR, findOpenedPage, getExtensionStatus, getRetryTimes, setupBrowser, toggleExtension, wait };

