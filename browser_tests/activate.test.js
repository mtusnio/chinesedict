import { jest } from '@jest/globals';
import path from 'path';
import * as utils from "./utils";

let browser = null;
let worker = null

const miniHelp = `
    <span style="font-weight: bold;">Chinese-English Dictionary</span><br><br>
    <p>Keyboard shortcuts:</p><p>
    <table style="margin: 10px;" cellspacing="5" cellpadding="5">
    <tbody><tr><td><b>n&nbsp;:</b></td><td>&nbsp;Next word</td></tr>
    <tr><td><b>b&nbsp;:</b></td><td>&nbsp;Previous character</td></tr>
    <tr><td><b>m&nbsp;:</b></td><td>&nbsp;Next character</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>a&nbsp;:</b></td><td>&nbsp;Alternate pop-up location</td></tr>
    <tr><td><b>y&nbsp;:</b></td><td>&nbsp;Move pop-up location down</td></tr>
    <tr><td><b>x&nbsp;:</b></td><td>&nbsp;Move pop-up location up</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>c&nbsp;:</b></td><td>&nbsp;Copy translation to clipboard</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>r&nbsp;:</b></td><td>&nbsp;Remember word by adding it to the built-in word list</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>Alt w&nbsp;:</b></td><td>&nbsp;Show the built-in word list in a new tab</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>s&nbsp;:</b></td><td>&nbsp;Add word to Skritter queue</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>e&nbsp;:</b></td><td>&nbsp;Play the Cantonese pronunciation of the selected character or phrase (if enabled in options)</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>w&nbsp;:</b></td><td>&nbsp;Play the Mandarin pronunciation of the selected character or phrase (if enabled in options)</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    </tbody></table>
    Look up selected text in online resources:
    <table style="margin: 10px;" cellspacing="5" cellpadding="5">
    <tbody><tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>Alt + 1 :</b></td><td>&nbsp;LINE Dict</td></tr>
    <tr><td><b>Alt + 2 :</b></td><td>&nbsp;Forvo</td></tr>
    <tr><td><b>Alt + 3 :</b></td><td>&nbsp;Dict.cn</td></tr>
    <tr><td><b>Alt + 4&nbsp;:</b></td><td>&nbsp;iCIBA</td></tr>
    <tr><td><b>Alt + 5&nbsp;:</b></td><td>&nbsp;MDBG</td></tr>
    <tr><td><b>Alt + 6&nbsp;:</b></td><td>&nbsp;MoE Dict</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>t&nbsp;:</b></td><td>&nbsp;Tatoeba</td></tr>
    </tbody></table></p>`;

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

test("extension is disabled by default", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });

    await page.bringToFront();

    const status = await utils.getExtensionStatus(worker)
    expect(status.storage).toEqual({})
    expect(status.badgeData).toEqual({
        "text": "", "color": [0, 0, 0, 0]
    })
})

test("toggling the extension on/off two times works", async () => {
    const page = await browser.newPage();
    await page.goto(`file://${path.resolve()}/browser_tests/testdata/plain.html`, { waitUntil: ['domcontentloaded', "networkidle2"] });

    await page.bringToFront();

    for (let i = 0; i < 2; i++) {
        // On
        await utils.toggleExtension(worker)

        let status = await utils.getExtensionStatus(worker)
        expect(status.storage).toEqual({ "enabled": true })
        expect(status.badgeData).toEqual({
            "text": "On", "color": [255, 0, 0, 255]
        })

        // Test if popup appears
        const innerHTML = await utils.getZhongwenWindowContent(page)
        expect(innerHTML).toEqual(miniHelp)

        // Off
        await utils.toggleExtension(worker)
        status = await utils.getExtensionStatus(worker)
        expect(status.storage).toEqual({ "enabled": false })
        expect(status.badgeData).toEqual({
            "text": "", "color": [0, 0, 0, 0]
        })
    }

});
