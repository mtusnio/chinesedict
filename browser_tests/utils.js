import * as puppeteer from "puppeteer";

const EXTENSION_PATH = './';

async function setupBrowser() {
    let headless = true
    if (process.env["HEADLESS"]) {
        headless = process.env["HEADLESS"] == "true"
    }

    const browser = await puppeteer.launch({
        browser: "chrome",
        headless: headless,
        devTools: true,
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

export {
    getExtensionStatus, setupBrowser, toggleExtension, wait
};

