
import { jest } from '@jest/globals';
import * as configuration from "./configuration.js";

jest.useFakeTimers();

beforeEach(async () => {

})

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});


test("configuration defaults get set", async () => {
    const config = await configuration.get()

    expect(config).toEqual({
        css: 'yellow',
        tonecolors: 'yes',
        fontSize: 'small',
        skritterTLD: 'com',
        zhuyin: 'no',
        grammar: 'yes',
        simpTrad: 'classic',
        toneColorScheme: 'standard',
        cantoneseEntriesEnabled: 'yes',
        jyutpingEnabled: 'yes',
        pinyinEnabled: 'yes',
        ttsEnabled: 'no'
    })
})

test("configuration changes take effect", async () => {
    await chrome.storage.local.set({
        "popupcolor": "black",
    })

    const config = await configuration.get()

    expect(config).toEqual({
        css: 'black',
        tonecolors: 'yes',
        fontSize: 'small',
        skritterTLD: 'com',
        zhuyin: 'no',
        grammar: 'yes',
        simpTrad: 'classic',
        toneColorScheme: 'standard',
        cantoneseEntriesEnabled: 'yes',
        jyutpingEnabled: 'yes',
        pinyinEnabled: 'yes',
        ttsEnabled: 'no'
    })
})
