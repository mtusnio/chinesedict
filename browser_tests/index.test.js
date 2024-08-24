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


test("clicking the extension button activates the extension", async () => {
    const someOtherPage = await browser.newPage();
    await someOtherPage.goto("https://www.google.com/", { waitUntil: ['domcontentloaded', "networkidle2"] });
    await someOtherPage.bringToFront();

    await worker.evaluate(async () => {
        const tabs = await chrome.tabs.query({ active: true })
        await chrome.action.onClicked.dispatch(tabs[0]);
    });


    const storage = await worker.evaluate(async () => {
        return await chrome.storage.local.get(["enabled"])

    })

    expect(storage).toEqual({ "enabled": true })
});
