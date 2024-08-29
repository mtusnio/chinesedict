/*
 Zhongwen - A Chinese-English Pop-Up Dictionary
 Copyright (C) 2010-2019 Christian Schiller
 https://chrome.google.com/extensions/detail/kkmlkkjojmombglmlpbpapmhcaljjkde

 ---

 Originally based on Rikaikun 0.8
 Copyright (C) 2010 Erek Speed
 http://code.google.com/p/rikaikun/

 ---

 Originally based on Rikaichan 1.07
 by Jonathan Zarate
 http://www.polarcloud.com/

 ---

 Originally based on RikaiXUL 0.4 by Todd Rudick
 http://www.rikai.com/
 http://rikaixul.mozdev.org/

 ---

 This program is free software; you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation; either version 2 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program; if not, write to the Free Software
 Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

 ---

 Please do not change or remove any of the copyrights or links to web pages
 when modifying any of the files.

 */


'use strict';

let savedTarget;

let savedRangeNode;

let savedRangeOffset;

let selText;

let clientX;

let clientY;

let selStartDelta;

let selStartIncrement;

let popX = 0;

let popY = 0;

let timer;

let altView = 0;

let savedSearchResults = [];

let savedSelStartOffset = 0;

let savedSelEndList = [];

// regular expression for zero-width non-joiner U+200C &zwnj;
let zwnj = /\u200c/g;

// Initialize the speech synthesis object
let synth = window.speechSynthesis;


async function getConfig() {
    const localStorage = await chrome.storage.local.get([
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
    ]);

    return {
        css: localStorage['popupColor'] || 'yellow',
        toneColors: localStorage['toneColors'] || 'yes',
        fontSize: localStorage['fontSize'] || 'small',
        skritterTLD: localStorage['skritterTLD'] || 'com',
        zhuyin: localStorage['zhuyin'] || 'no',
        grammar: localStorage['grammar'] || 'yes',
        simpTrad: localStorage['simpTrad'] || 'classic',
        toneColorScheme: localStorage['toneColorScheme'] || 'standard',
        cantoneseEntriesEnabled: localStorage['cantoneseEntriesEnabled'] || 'yes',
        jyutpingEnabled: localStorage['jyutpingEnabled'] || 'yes',
        pinyinEnabled: localStorage['pinyinEnabled'] || 'yes',
        ttsEnabled: localStorage['ttsEnabled'] || 'no'
    };
}

function disableTab() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('keydown', onKeyDown);

    let zhongwenCSS = document.getElementById('zhongwen-css');
    if (zhongwenCSS) {
        zhongwenCSS.parentNode.removeChild(zhongwenCSS);
    }
    let zhongwenToneColors = document.getElementById('zhongwen-toneColors');
    if (zhongwenToneColors) {
        zhongwenToneColors.parentNode.removeChild(zhongwenToneColors);
    }
    let zhongwenWindow = document.getElementById('zhongwen-window');
    if (zhongwenWindow) {
        zhongwenWindow.parentNode.removeChild(zhongwenWindow);
    }

    clearHighlight();
}



async function showPopup(html, elem, x, y, looseWidth) {
    const config = await getConfig();
    if (!x || !y) {
        x = y = 0;
    }

    let popup = document.getElementById('zhongwen-window');

    if (!popup) {
        popup = document.createElement('div');
        popup.setAttribute('id', 'zhongwen-window');
        document.documentElement.appendChild(popup);
    }

    popup.style.width = 'auto';
    popup.style.height = 'auto';
    popup.style.maxWidth = (looseWidth ? '' : '600px');
    popup.className = `background-${config.css} tonecolor-${config.toneColorScheme}`;

    $(popup).html(html);

    if (elem) {
        popup.style.top = '-1000px';
        popup.style.left = '0px';
        popup.style.display = '';

        let pW = popup.offsetWidth;
        let pH = popup.offsetHeight;

        if (pW <= 0) {
            pW = 200;
        }
        if (pH <= 0) {
            pH = 0;
            let j = 0;
            while ((j = html.indexOf('<br/>', j)) !== -1) {
                j += 5;
                pH += 22;
            }
            pH += 25;
        }

        if (altView === 1) {
            x = window.scrollX;
            y = window.scrollY;
        } else if (altView === 2) {
            x = (window.innerWidth - (pW + 20)) + window.scrollX;
            y = (window.innerHeight - (pH + 20)) + window.scrollY;
        } else if (elem instanceof window.HTMLOptionElement) {

            x = 0;
            y = 0;

            let p = elem;
            while (p) {
                x += p.offsetLeft;
                y += p.offsetTop;
                p = p.offsetParent;
            }

            if (elem.offsetTop > elem.parentNode.clientHeight) {
                y -= elem.offsetTop;
            }

            if (x + popup.offsetWidth > window.innerWidth) {
                // too much to the right, go left
                x -= popup.offsetWidth + 5;
                if (x < 0) {
                    x = 0;
                }
            } else {
                // use SELECT's width
                x += elem.parentNode.offsetWidth + 5;
            }
        } else {
            // go left if necessary
            if (x + pW > window.innerWidth - 20) {
                x = (window.innerWidth - pW) - 20;
                if (x < 0) {
                    x = 0;
                }
            }

            // below the mouse
            let v = 25;

            // go up if necessary
            if (y + v + pH > window.innerHeight) {
                let t = y - pH - 30;
                if (t >= 0) {
                    y = t;
                }
            } else {
                y += v;
            }

            x += window.scrollX;
            y += window.scrollY;
        }
    } else {
        x += window.scrollX;
        y += window.scrollY;
    }

    // (-1, -1) indicates: leave position unchanged
    if (x !== -1 && y !== -1) {
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        popup.style.display = '';
    }
}

function hidePopup() {
    let popup = document.getElementById('zhongwen-window');
    if (popup) {
        popup.style.display = 'none';
        popup.textContent = '';
    }
}

function highlightMatch(doc, rangeStartNode, rangeStartOffset, matchLen, selEndList) {
    if (!selEndList || selEndList.length === 0) return;

    let selEnd;
    let offset = rangeStartOffset + matchLen;

    for (let i = 0, len = selEndList.length; i < len; i++) {
        selEnd = selEndList[i];
        if (offset <= selEnd.offset) {
            break;
        }
        offset -= selEnd.offset;
    }

    let range = doc.createRange();
    range.setStart(rangeStartNode, rangeStartOffset);
    range.setEnd(selEnd.node, offset);

    let sel = window.getSelection();
    if (!sel.isCollapsed && selText !== sel.toString())
        return;
    sel.empty();
    sel.addRange(range);
    selText = sel.toString();
}

function clearHighlight() {

    if (selText === null) {
        return;
    }

    let selection = window.getSelection();
    if (selection.isCollapsed || selText === selection.toString()) {
        selection.empty();
    }
    selText = null;
}

function isVisible() {
    let popup = document.getElementById('zhongwen-window');
    return popup && popup.style.display !== 'none';
}

async function savedSearchResultToString(r) {
    const config = await getConfig();
    let tuple = config.zhuyin === 'yes'
        ? [r.traditional, r.simplified, r.pronunciation.cantonese,
        r.pronunciation.mandarin, r.pronunciation.zhuyin, r.definition]
        : [r.traditional, r.simplified, r.pronunciation.cantonese,
        r.pronunciation.mandarin, r.definition];
    return tuple.join('\t');
}

async function getTextForClipboard() {
    let result = '';
    for (let i = 0; i < savedSearchResults.length; i++) {
        result += await savedSearchResultToString(savedSearchResults[i]);
        result += '\n';
    }
    return result;
}

function makeDiv(input) {
    let div = document.createElement('div');

    div.id = 'zhongwenDiv';

    let text;
    if (input.value) {
        text = input.value;
    } else {
        text = '';
    }
    div.innerText = text;

    div.style.cssText = window.getComputedStyle(input, '').cssText;
    div.scrollTop = input.scrollTop;
    div.scrollLeft = input.scrollLeft;
    div.style.position = 'absolute';
    div.style.zIndex = 7000;
    $(div).offset({
        top: $(input).offset().top,
        left: $(input).offset().left
    });

    return div;
}

function findNextTextNode(root, previous) {
    if (root === null) {
        return null;
    }
    let nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, null);
    let node = nodeIterator.nextNode();
    while (node !== previous) {
        node = nodeIterator.nextNode();
        if (node === null) {
            return findNextTextNode(root.parentNode, previous);
        }
    }
    let result = nodeIterator.nextNode();
    if (result !== null) {
        return result;
    } else {
        return findNextTextNode(root.parentNode, previous);
    }
}

function findPreviousTextNode(root, previous) {
    if (root === null) {
        return null;
    }
    let nodeIterator = document.createNodeIterator(root, NodeFilter.SHOW_TEXT, null);
    let node = nodeIterator.nextNode();
    while (node !== previous) {
        node = nodeIterator.nextNode();
        if (node === null) {
            return findPreviousTextNode(root.parentNode, previous);
        }
    }
    nodeIterator.previousNode();
    let result = nodeIterator.previousNode();
    if (result !== null) {
        return result;
    } else {
        return findPreviousTextNode(root.parentNode, previous);
    }
}

async function copyToClipboard(data) {
    await navigator.clipboard.writeText(data)
    await showPopup('Copied to clipboard', null, -1, -1);
}

function ttsAny(data, language) {
    let utterance = new SpeechSynthesisUtterance();
    // Set the text to be spoken
    utterance.text = data;
    // Set the language and voice for Mandarin
    utterance.lang = language;
    utterance.voice = synth.getVoices().find((voice) => voice.lang === language);
    synth.speak(utterance);
}

function ttsMandarin(data) {
    ttsAny(data, "zh-CN");
}

function ttsCantonese(data) {
    ttsAny(data, "zh-HK");
}

async function makeHtml(result, showToneColors) {
    const config = await getConfig();
    let html = '';
    let texts = [];
    let hanziClass;

    if (result === null || result.words.length === 0) return '';

    const grammarIndex = result.words.findIndex((word) => {
        for (const entry of word.entries) {
            if (entry.grammar === true) {
                return true
            }
        }
        return false
    });

    result.words.forEach((word, index) => {
        word.entries.forEach(async (entry, entryIndex) => {
            if (config.simpTrad === 'auto') {
                hanziClass = 'w-hanzi';
                if (config.fontSize === 'small') {
                    hanziClass += '-small';
                }
                html += '<span class="' + hanziClass + '">' + entry.originalWord + '</span>&nbsp;';

            } else {

                hanziClass = 'w-hanzi';
                if (config.fontSize === 'small') {
                    hanziClass += '-small';
                }
                html += '<span class="' + hanziClass + '">' + entry.traditional + '</span>&nbsp;';
                if (entry.traditional !== entry.simplified) {
                    html += '<span class="' + hanziClass + '">' + entry.simplified + '</span>&nbsp;';
                }

            }

            let pinyinClass = 'w-pinyin';
            if (config.fontSize === 'small') {
                pinyinClass += '-small';
            }

            const p = {
                mandarin: pinyinAndZhuyin(entry.pronunciation.mandarin, showToneColors, pinyinClass, config),
                cantonese: [`<span class="${pinyinClass}">${entry.pronunciation.cantonese}</span>`, entry.pronunciation.cantonese]
            };

            // Pinyin
            if (result.displayedPronunciations.includes("pinyin")) {
                html += p.mandarin[0];
            }

            // Jyutping
            if (result.displayedPronunciations.includes("jyutping")) {
                html += "&nbsp;&nbsp;&nbsp;" + p.cantonese[0];

            }

            // Cantonese entries
            if (entry.type === "cantonese") {
                html += `<span style="float: right" class="${pinyinClass}">Cant.</span>`;
            }

            // Zhuyin

            if (entry.type === "common" && config.zhuyin === 'yes') {
                html += '<br>' + p.mandarin[2];
            }

            // Definition

            let defClass = 'w-def';
            if (config.fontSize === 'small') {
                defClass += '-small';
            }

            html += '<br><span class="' + defClass + '">' + entry.definition + '</span><br>';

            // Grammar
            if (entryIndex == 0 && config.grammar !== 'no' && entry.grammar && grammarIndex === index) {
                html += '<br><span class="grammar">Press "g" for grammar and usage notes.</span><br><br>';
            }

            texts.push({
                simplified: entry.simplified,
                traditional: entry.traditional,
                pronunciation: {
                    cantonese: entry.pronunciation.cantonese,
                    mandarin: p.mandarin[1],
                    zhuyin: p.mandarin[3]
                },
                definition: entry.definition,
            });
        });
    });

    if (result.more) {
        html += '&hellip;<br/>';
    }

    savedSearchResults = Object.assign(texts);
    savedSearchResults.grammar = grammarIndex !== -1;

    return html;
}

let tones = {
    1: '&#772;',
    2: '&#769;',
    3: '&#780;',
    4: '&#768;',
    5: ''
};

let utones = {
    1: '\u0304',
    2: '\u0301',
    3: '\u030C',
    4: '\u0300',
    5: ''
};

function parse(s) {
    return s.match(/([^AEIOU:aeiou]*)([AEIOUaeiou:]+)([^aeiou:]*)([1-5])/);
}

function tonify(vowels, tone) {
    let html = '';
    let text = '';

    if (vowels === 'ou') {
        html = 'o' + tones[tone] + 'u';
        text = 'o' + utones[tone] + 'u';
    } else {
        let tonified = false;
        for (let i = 0; i < vowels.length; i++) {
            let c = vowels.charAt(i);
            html += c;
            text += c;
            if (c === 'a' || c === 'e') {
                html += tones[tone];
                text += utones[tone];
                tonified = true;
            } else if (i === vowels.length - 1 && !tonified) {
                html += tones[tone];
                text += utones[tone];
                tonified = true;
            }
        }
        html = html.replace(/u:/, '&uuml;');
        text = text.replace(/u:/, '\u00FC');
    }

    return [html, text];
}

function pinyinAndZhuyin(syllables, showToneColors, pinyinClass, config) {
    let text = '';
    let html = '';
    let zhuyin = '';
    let bopomofo = [];
    let a = syllables.split(/[\s·]+/);
    for (let i = 0; i < a.length; i++) {
        let syllable = a[i];

        // ',' in pinyin
        if (syllable === ',') {
            html += ' ,';
            text += ' ,';
            continue;
        }

        if (i > 0) {
            html += '&nbsp;';
            text += ' ';
            zhuyin += '&nbsp;';
        }
        if (syllable === 'r5') {
            if (showToneColors) {
                html += '<span class="' + pinyinClass + ' tone5">r</span>';
            } else {
                html += '<span class="' + pinyinClass + '">r</span>';
            }
            text += 'r';
            continue;
        }
        if (syllable === 'xx5') {
            if (showToneColors) {
                html += '<span class="' + pinyinClass + ' tone5">??</span>';
            } else {
                html += '<span class="' + pinyinClass + '">??</span>';
            }
            text += '??';
            continue;
        }
        let m = parse(syllable);
        if (showToneColors) {
            html += '<span class="' + pinyinClass + ' tone' + m[4] + '">';
        } else {
            html += '<span class="' + pinyinClass + '">';
        }
        let t = tonify(m[2], m[4]);
        html += m[1] + t[0] + m[3];
        html += '</span>';
        text += m[1] + t[1] + m[3];

        let zhuyinClass = 'w-zhuyin';
        if (config.fontSize === 'small') {
            zhuyinClass += '-small';
        }
        let zhuyinSyllable = globalThis.numericPinyin2Zhuyin(syllable);
        bopomofo.push(zhuyinSyllable);
        zhuyin += '<span class="tone' + m[4] + ' ' + zhuyinClass + '">'
            + zhuyinSyllable + '</span>';
    }
    // [pinyinHtml, pinyinStr, zhuyinHtml, zhuyinStr]
    return [html, text, zhuyin, bopomofo.join(' ')];
}

let miniHelp = `
    <span style="font-weight: bold;">Zhongwen Chinese-English Dictionary</span><br><br>
    <p>Keyboard shortcuts:<p>
    <table style="margin: 10px;" cellspacing=5 cellpadding=5>
    <tr><td><b>n&nbsp;:</b></td><td>&nbsp;Next word</td></tr>
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
    </table>
    Look up selected text in online resources:
    <table style="margin: 10px;" cellspacing=5 cellpadding=5>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>Alt + 1 :</b></td><td>&nbsp;LINE Dict</td></tr>
    <tr><td><b>Alt + 2 :</b></td><td>&nbsp;Forvo</td></tr>
    <tr><td><b>Alt + 3 :</b></td><td>&nbsp;Dict.cn</td></tr>
    <tr><td><b>Alt + 4&nbsp;:</b></td><td>&nbsp;iCIBA</td></tr>
    <tr><td><b>Alt + 5&nbsp;:</b></td><td>&nbsp;MDBG</td></tr>
    <tr><td><b>Alt + 6&nbsp;:</b></td><td>&nbsp;JuKuu</td></tr>
    <tr><td><b>Alt + 7&nbsp;:</b></td><td>&nbsp;MoE Dict</td></tr>
    <tr><td><b>&nbsp;</b></td><td>&nbsp;</td></tr>
    <tr><td><b>t&nbsp;:</b></td><td>&nbsp;Tatoeba</td></tr>
    </table>`;


function triggerSearch() {

    let rangeNode = savedRangeNode;
    let selStartOffset = savedRangeOffset + selStartDelta;

    selStartIncrement = 1;

    if (!rangeNode) {
        clearHighlight();
        hidePopup();
        return 1;
    }

    if (selStartOffset < 0 || rangeNode.data.length <= selStartOffset) {
        clearHighlight();
        hidePopup();
        return 2;
    }

    let u = rangeNode.data.charCodeAt(selStartOffset);

    // not a Chinese character
    if (isNaN(u) ||
        (u !== 0x25CB &&
            (u < 0x3400 || 0x9FFF < u) &&
            (u < 0xF900 || 0xFAFF < u) &&
            (u < 0xFF21 || 0xFF3A < u) &&
            (u < 0xFF41 || 0xFF5A < u))) {
        clearHighlight();
        hidePopup();
        return 3;
    }

    let selEndList = [];
    let originalText = getText(rangeNode, selStartOffset, selEndList, 30 /*maxlength*/);

    // Workaround for Google Docs: remove zero-width non-joiner &zwnj;
    let text = originalText.replace(zwnj, '');

    savedSelStartOffset = selStartOffset;
    savedSelEndList = selEndList;

    chrome.runtime.sendMessage({
        'type': 'search',
        'text': text,
        'originalText': originalText
    },
        processSearchResult
    );

    return 0;
}


async function processSearchResult(result) {
    let config = await getConfig();
    let selStartOffset = savedSelStartOffset;
    let selEndList = savedSelEndList;

    if (!result || result.words.length === 0) {
        hidePopup();
        clearHighlight();
        return;
    }

    let highlightLength;
    let index = 0;

    const originalWord = result.words[0].originalWord;

    for (let i = 0; i < result.originalText.length; i++) {
        index = i + 1;
        const currentWord = result.originalText.substring(0, index)
            .replace(/\u200c/g, '');
        if (currentWord.valueOf() === originalWord.valueOf()) {
            break;
        }
    }

    highlightLength = index;

    selStartIncrement = result.words.length;
    selStartDelta = (selStartOffset - savedRangeOffset);

    let rangeNode = savedRangeNode;
    // don't try to highlight form elements
    if (!('form' in savedTarget)) {
        let doc = rangeNode.ownerDocument;
        if (!doc) {
            clearHighlight();
            hidePopup();
            return;
        }

        highlightMatch(doc, rangeNode, selStartOffset, highlightLength, selEndList);
    }

    await showPopup(await makeHtml(result, config.toneColors !== 'no'), savedTarget, popX, popY, false);
}

// modifies selEndList as a side-effect
function getText(startNode, offset, selEndList, maxLength) {
    let text = '';
    let endIndex;

    if (startNode.nodeType !== Node.TEXT_NODE) {
        return '';
    }

    endIndex = Math.min(startNode.data.length, offset + maxLength);
    text += startNode.data.substring(offset, endIndex);
    selEndList.push({
        node: startNode,
        offset: endIndex
    });

    let nextNode = startNode;
    while ((text.length < maxLength) && ((nextNode = findNextTextNode(nextNode.parentNode, nextNode)) !== null)) {
        text += getTextFromSingleNode(nextNode, selEndList, maxLength - text.length);
    }

    return text;
}

// modifies selEndList as a side-effect
function getTextFromSingleNode(node, selEndList, maxLength) {
    let endIndex;

    if (node.nodeName === '#text') {
        endIndex = Math.min(maxLength, node.data.length);
        selEndList.push({
            node: node,
            offset: endIndex
        });
        return node.data.substring(0, endIndex);
    } else {
        return '';
    }
}


function onMouseMove(mouseMove) {
    if (mouseMove.target.nodeName === 'TEXTAREA' || mouseMove.target.nodeName === 'INPUT'
        || mouseMove.target.nodeName === 'DIV') {

        let div = document.getElementById('zhongwenDiv');

        if (mouseMove.altKey) {

            if (!div && (mouseMove.target.nodeName === 'TEXTAREA' || mouseMove.target.nodeName === 'INPUT')) {

                div = makeDiv(mouseMove.target);
                document.body.appendChild(div);
                div.scrollTop = mouseMove.target.scrollTop;
                div.scrollLeft = mouseMove.target.scrollLeft;
            }
        } else {
            if (div) {
                document.body.removeChild(div);
            }
        }
    }

    if (clientX && clientY) {
        if (mouseMove.clientX === clientX && mouseMove.clientY === clientY) {
            return;
        }
    }
    clientX = mouseMove.clientX;
    clientY = mouseMove.clientY;

    let range;
    let rangeNode;
    let rangeOffset;

    // Handle Chrome and Firefox
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(mouseMove.clientX, mouseMove.clientY);
        if (range === null) {
            return;
        }
        rangeNode = range.startContainer;
        rangeOffset = range.startOffset;
    } else if (document.caretPositionFromPoint) {
        range = document.caretPositionFromPoint(mouseMove.clientX, mouseMove.clientY);
        if (range === null) {
            return;
        }
        rangeNode = range.offsetNode;
        rangeOffset = range.offset;
    }

    if (mouseMove.target === savedTarget) {
        if (rangeNode === savedRangeNode && rangeOffset === savedRangeOffset) {
            return;
        }
    }

    if (timer) {
        clearTimeout(timer);
        timer = null;
    }

    if (rangeNode.data && rangeOffset === rangeNode.data.length) {
        rangeNode = findNextTextNode(rangeNode.parentNode, rangeNode);
        rangeOffset = 0;
    }

    if (!rangeNode || rangeNode.parentNode !== mouseMove.target) {
        rangeNode = null;
        rangeOffset = -1;
    }

    savedTarget = mouseMove.target;
    savedRangeNode = rangeNode;
    savedRangeOffset = rangeOffset;

    selStartDelta = 0;
    selStartIncrement = 1;

    if (rangeNode && rangeNode.data && rangeOffset < rangeNode.data.length) {
        popX = mouseMove.clientX;
        popY = mouseMove.clientY;
        timer = setTimeout(() => triggerSearch(), 50);
        return;
    }

    // Don't close just because we moved from a valid pop-up slightly over to a place with nothing.
    let dx = popX - mouseMove.clientX;
    let dy = popY - mouseMove.clientY;
    let distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > 4) {
        clearHighlight();
        hidePopup();
    }
}


async function onKeyDown(keyDown) {
    const config = await getConfig()
    if (keyDown.ctrlKey || keyDown.metaKey) {
        return;
    }

    if (keyDown.keyCode === 27) {
        // esc key pressed
        hidePopup();
        return;
    }

    if (keyDown.altKey && keyDown.keyCode === 87) {
        // Alt + w
        chrome.runtime.sendMessage({
            type: 'open',
            tabType: 'wordlist',
            url: '/wordlist.html'
        });
        return;
    }

    if (!isVisible()) {
        return;
    }



    const keyCodes = { "0": 48, "1": 49, "2": 50, "3": 51, "4": 52, "5": 53, "6": 54, "7": 55, "8": 56, "9": 57, "d": 68, "b": 66, "a": 65, "s": 83, "i": 73, "f": 70, "k": 75, "ß": 219, "Dead": 220, "+": 187, "ü": 186, "p": 80, "o": 79, "u": 85, "z": 90, "t": 84, "r": 82, "e": 69, "w": 87, "g": 71, "h": 72, "j": 74, "l": 76, "ö": 192, "ä": 222, "#": 191, "y": 89, "x": 88, "c": 67, "v": 86, "n": 78, "m": 77, ",": 188, ".": 190, "-": 189, "ArrowRight": 39, "ArrowLeft": 37, "ArrowUp": 38, "ArrowDown": 40, "PageDown": 34, "Clear": 12, "Home": 36, "PageUp": 33, "End": 35, "Delete": 46, "Insert": 45, "Control": 17, "AltGraph": 18, "Meta": 92, "Alt": 18, "Shift": 16, "CapsLock": 20, "Tab": 9, "Escape": 27, "F1": 112, "F2": 113, ";": 188, ":": 190, "_": 189, "'": 191, "*": 187, "Q": 81, "W": 87, "E": 69, "R": 82, "T": 84, "Z": 90, "S": 83, "A": 65, "D": 68, "I": 73, "U": 85, "O": 79, "Y": 89, "X": 88, "C": 67, "F": 70, "V": 86, "G": 71, "B": 66, "H": 72, "N": 78, "J": 74, "M": 77, "K": 75, "L": 76, "P": 80, "Ö": 192, "Ä": 222, "Ü": 186, "!": 49, "\"": 50, "§": 51, "$": 52, "%": 53, "&": 54, "/": 55, "(": 56, ")": 57, "=": 48, "?": 219, "°": 220 }
    switch (keyDown.keyCode) {

        case keyCodes['a']:
            altView = (altView + 1) % 3;
            triggerSearch();
            break;

        case keyCodes['c']:
            await copyToClipboard(await getTextForClipboard());
            break;

        case keyCodes['e']:
            if (config.ttsEnabled === 'yes') {
                ttsCantonese(window.getSelection().toString());
            }
            break;
        case keyCodes['w']:
            if (config.ttsEnabled === 'yes') {
                ttsMandarin(window.getSelection().toString());
            }
            break;

        case keyCodes['b']:
            {
                let offset = selStartDelta;
                for (let i = 0; i < 10; i++) {
                    selStartDelta = --offset;
                    let ret = triggerSearch();
                    if (ret === 0) {
                        break;
                    } else if (ret === 2) {
                        savedRangeNode = findPreviousTextNode(savedRangeNode.parentNode, savedRangeNode);
                        savedRangeOffset = 0;
                        offset = savedRangeNode.data.length;
                    }
                }
            }
            break;

        case keyCodes['g']:
            if (config.grammar !== 'no' && savedSearchResults.grammar) {
                let sel = encodeURIComponent(window.getSelection().toString());

                // https://resources.allsetlearning.com/chinese/grammar/%E4%B8%AA
                let allset = 'https://resources.allsetlearning.com/chinese/grammar/' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: allset
                });
            }
            break;

        case keyCodes['m']:
            selStartIncrement = 1;
        // falls through
        case keyCodes['n']:
            for (let i = 0; i < 10; i++) {
                selStartDelta += selStartIncrement;
                let ret = triggerSearch();
                if (ret === 0) {
                    break;
                } else if (ret === 2) {
                    savedRangeNode = findNextTextNode(savedRangeNode.parentNode, savedRangeNode);
                    savedRangeOffset = 0;
                    selStartDelta = 0;
                    selStartIncrement = 0;
                }
            }
            break;

        case keyCodes['r']:
            {
                let entries = [];
                for (let j = 0; j < savedSearchResults.length; j++) {
                    let entry = {
                        simplified: savedSearchResults[j].simplified,
                        traditional: savedSearchResults[j].traditional,
                        pinyin: savedSearchResults[j].pronunciation.mandarin,
                        jyutping: savedSearchResults[j].pronunciation.cantonese,
                        definition: savedSearchResults[j].definition
                    };
                    entries.push(entry);
                }

                chrome.runtime.sendMessage({
                    'type': 'add',
                    'entries': entries
                });

                showPopup('Added to word list.<p>Press Alt+W to open word list.', null, -1, -1);
            }
            break;

        case keyCodes['s']:
            {

                // https://www.skritter.com/vocab/api/add?from=Chrome&lang=zh&word=浏览&trad=瀏 覽&rdng=liú lǎn&defn=to skim over; to browse

                let skritter = 'https://legacy.skritter.com';
                if (config.skritterTLD === 'cn') {
                    skritter = 'https://legacy.skritter.cn';
                }

                skritter +=
                    '/vocab/api/add?from=Zhongwen&siteref=Zhongwen&lang=zh&word=' +
                    encodeURIComponent(savedSearchResults[0].simplified) +
                    '&trad=' + encodeURIComponent(savedSearchResults[0].traditional) +
                    '&rdng=' + encodeURIComponent(savedSearchResults[0].pronunciation.mandarin) +
                    '&defn=' + encodeURIComponent(savedSearchResults[0].definition);

                chrome.runtime.sendMessage({
                    type: 'open',
                    tabType: 'skritter',
                    url: skritter
                });
            }
            break;

        case keyCodes['t']:
            {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                // https://tatoeba.org/eng/sentences/search?from=cmn&to=eng&query=%E8%BF%9B%E8%A1%8C
                let tatoeba = 'https://tatoeba.org/eng/sentences/search?from=cmn&to=eng&query=' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: tatoeba
                });
            }
            break;

        case keyCodes['x']:
            altView = 0;
            popY -= 20;
            triggerSearch();
            break;

        case keyCodes['y']:
            altView = 0;
            popY += 20;
            triggerSearch();
            break;

        case keyCodes['1']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                let linedict = 'https://english.dict.naver.com/english-chinese-dictionary/#/search?query=' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: linedict
                });
            }
            break;

        case keyCodes['2']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                var forvo = 'https://forvo.com/search/' + sel + '/zh/';

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: forvo
                });
            }
            break;

        case keyCodes['3']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                let dictcn = 'https://dict.cn/' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: dictcn
                });
            }
            break;

        case keyCodes['4']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                let iciba = 'https://www.iciba.com/word?w=' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: iciba
                });
            }
            break;

        case keyCodes['5']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                let mdbg = 'https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: mdbg
                });
            }
            break;

        case keyCodes['6']:
            if (keyDown.altKey) {
                let sel = encodeURIComponent(
                    window.getSelection().toString());

                // https://www.moedict.tw/~%E4%B8%AD%E6%96%87
                let moedict = 'https://www.moedict.tw/~' + sel;

                chrome.runtime.sendMessage({
                    type: 'open',
                    url: moedict
                });
            }
            break;


        default:
            return;
    }
}

// event listener
chrome.runtime.onMessage.addListener(
    function (request) {
        switch (request.type) {
            case 'enable':
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('keydown', onKeyDown);
                break;
            case 'disable':
                disableTab();
                break;
            case 'showPopup':
                if (!request.isHelp || window === window.top) {
                    showPopup(request.text);
                }
                break;
            case 'showHelp':
                // showPopup(miniHelp);
                break;
            default:
        }
    }
);
