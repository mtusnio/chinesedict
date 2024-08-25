/*
 Zhongwen - A Chinese-English Pop-Up Dictionary
 Copyright (C) 2010-2019 Christian Schiller
 https://chrome.google.com/extensions/detail/kkmlkkjojmombglmlpbpapmhcaljjkde
 */

'use strict';
async function getConfig() {
    return await chrome.storage.local.get([
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
        "ttsEnabled",
        "saveToWordList"
    ]);
}

async function loadVals() {
    const config = await getConfig()
    const popupColor = config['popupColor'] || 'yellow';
    document.querySelector(`input[name="popupColor"][value="${popupColor}"]`).checked = true;

    const toneColors = config['toneColors'] || 'yes';
    if (toneColors === 'no') {
        document.querySelector('#toneColorsNone').checked = true;
    } else {
        const toneColorScheme = config['toneColorScheme'] || 'standard';
        document.querySelector(`input[name="toneColors"][value="${toneColorScheme}"]`).checked = true;
    }

    const fontSize = config['fontSize'] || 'small';
    document.querySelector(`input[name="fontSize"][value="${fontSize}"]`).checked = true;

    const simpTrad = config['simpTrad'] || 'classic';
    document.querySelector(`input[name="simpTrad"][value="${simpTrad}"]`).checked = true;

    const zhuyin = config['zhuyin'] || 'no';
    document.querySelector('#zhuyin').checked = zhuyin === 'yes';

    const grammar = config['grammar'] || 'yes';
    document.querySelector('#grammar').checked = grammar !== 'no';

    const saveToWordList = config['saveToWordList'] || 'allEntries';
    document.querySelector(`input[name="saveToWordList"][value="${saveToWordList}"]`).checked = true;

    const skritterTLD = config['skritterTLD'] || 'com';
    document.querySelector(`input[name="skritterTLD"][value="${skritterTLD}"]`).checked = true;

    const cantoneseEntriesEnabled = config['cantoneseEntriesEnabled'] || 'yes';
    document.querySelector('#cantoneseEntriesEnabled').checked = cantoneseEntriesEnabled === 'yes';

    const jyutpingEnabled = config['jyutpingEnabled'] || 'yes';
    document.querySelector('#jyutpingEnabled').checked = jyutpingEnabled === 'yes';

    const pinyinEnabled = config['pinyinEnabled'] || 'yes';
    document.querySelector('#pinyinEnabled').checked = pinyinEnabled === 'yes';

    const ttsEnabled = config['ttsEnabled'] || 'no';
    document.querySelector('#ttsEnabled').checked = ttsEnabled === 'yes';
}


function setToneColorScheme(toneColorScheme) {
    if (toneColorScheme === 'none') {
        setOption('toneColors', 'no');
    } else {
        setOption('toneColors', 'yes');
        setOption('toneColorScheme', toneColorScheme);
    }
}

function setOption(option, value) {
    chrome.storage.local.set({
        [option]: value
    })
}

function setBooleanOption(option, value) {
    let yesNo = value ? 'yes' : 'no';
    setOption(option, yesNo);
}

window.addEventListener('load', () => {

    document.querySelectorAll('input[name="popupColor"]').forEach((input) => {
        input.addEventListener('change',
            () => setOption("popupColor", input.getAttribute('value')))
    });

    document.querySelectorAll('input[name="toneColors"]').forEach((input) => {
        input.addEventListener('change',
            () => setToneColorScheme(input.getAttribute('value')));
    });

    document.querySelectorAll('input[name="fontSize"]').forEach((input) => {
        input.addEventListener('change',
            () => setOption('fontSize', input.getAttribute('value')));
    });

    document.querySelectorAll('input[name="simpTrad"]').forEach((input) => {
        input.addEventListener('change',
            () => setOption('simpTrad', input.getAttribute('value')));
    });

    document.querySelector('#zhuyin').addEventListener('change',
        (event) => setBooleanOption('zhuyin', event.target.checked));

    document.querySelector('#grammar').addEventListener('change',
        (event) => setBooleanOption('grammar', event.target.checked));

    document.querySelectorAll('input[name="saveToWordList"]').forEach((input) => {
        input.addEventListener('change',
            () => setOption('saveToWordList', input.getAttribute('value')));
    });

    document.querySelectorAll('input[name="skritterTLD"]').forEach((input) => {
        input.addEventListener('change',
            () => setOption('skritterTLD', input.getAttribute('value')));
    });

    document.querySelector('#cantoneseEntriesEnabled').addEventListener('change',
        (event) => setBooleanOption('cantoneseEntriesEnabled', event.target.checked));

    document.querySelector('#jyutpingEnabled').addEventListener('change',
        (event) => setBooleanOption('jyutpingEnabled', event.target.checked));

    document.querySelector('#pinyinEnabled').addEventListener('change',
        (event) => setBooleanOption('pinyinEnabled', event.target.checked));

    document.querySelector('#ttsEnabled').addEventListener('change',
        (event) => setBooleanOption('ttsEnabled', event.target.checked));
});

loadVals();
