async function get() {
    const output = await chrome.storage.local.get([
        "popupColor",
        "toneColors",
        "fontSize",
        "skritterTLD",
        "zhuyin",
        "grammar",
        "simpTrad",
        "toneColorScheme",
        "cantoneseEntriesEnabled",
        "jyutpingEnabled",
        "pinyinEnabled",
        "ttsEnabled"
    ])

    return {
        popupColor: output['popupColor'] || 'yellow',
        toneColors: output['toneColors'] || 'yes',
        fontSize: output['fontSize'] || 'small',
        skritterTLD: output['skritterTLD'] || 'com',
        zhuyin: output['zhuyin'] || 'no',
        grammar: output['grammar'] || 'yes',
        simpTrad: output['simpTrad'] || 'classic',
        toneColorScheme: output['toneColorScheme'] || 'standard',
        cantoneseEntriesEnabled: output['cantoneseEntriesEnabled'] || 'yes',
        jyutpingEnabled: output['jyutpingEnabled'] || 'yes',
        pinyinEnabled: output['pinyinEnabled'] || 'yes',
        ttsEnabled: output['ttsEnabled'] || 'no'
    };
}

export { get };
