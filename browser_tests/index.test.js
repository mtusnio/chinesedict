import * as puppeteer from "puppeteer";

const EXTENSION_PATH = './';
const EXTENSION_ID = 'cmocagfamghfobhcgipdfhkblaghlbff';

let browser = null;
let workerTarget = null
let worker = null

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false,
        args: [
            `--disable-extensions-except=${EXTENSION_PATH}`,
            `--load-extension=${EXTENSION_PATH}`
        ]
    });

    workerTarget = await browser.waitForTarget(
        // Assumes that there is only one service worker created by the extension and its URL ends with background.js.
        target =>
            target.type() === 'service_worker'
    );
    worker = await workerTarget.worker()
});

afterEach(async () => {
    await browser.close();
    browser = null;
    workerTarget = null
});

async function getExtensionStatus() {
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

async function toggleExtension() {
    await worker.evaluate(async () => {
        const tabs = await chrome.tabs.query({ active: true })
        await chrome.action.onClicked.dispatch(tabs[0]);
    });
}
test("extension is disabled by default", async () => {
    const someOtherPage = await browser.newPage();
    await someOtherPage.goto("https://www.google.com/", { waitUntil: ['domcontentloaded', "networkidle2"] });
    await someOtherPage.bringToFront();

    const status = await getExtensionStatus()
    expect(status.storage).toEqual({})
    expect(status.badgeData).toEqual({
        "text": "", "color": [0, 0, 0, 0]
    })
})

test("toggling the extension on/off two times works", async () => {
    const someOtherPage = await browser.newPage();
    await someOtherPage.goto("https://www.google.com/", { waitUntil: ['domcontentloaded', "networkidle2"] });
    await someOtherPage.bringToFront();

    for (let i = 0; i < 2; i++) {
        // On
        await toggleExtension()
        // Need a slight wait for the extension to trigger
        await new Promise((r) => setTimeout(r, 200));
        let status = await getExtensionStatus()
        expect(status.storage).toEqual({ "enabled": true })
        expect(status.badgeData).toEqual({
            "text": "On", "color": [255, 0, 0, 255]
        })

        // Off
        await toggleExtension()
        await new Promise((r) => setTimeout(r, 200));
        status = await getExtensionStatus()
        expect(status.storage).toEqual({ "enabled": false })
        expect(status.badgeData).toEqual({
            "text": "", "color": [0, 0, 0, 0]
        })
    }

});
