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

import * as actions from "./lib/actions.js";
import * as configuration from "./lib/configuration.js";
import * as setup from "./lib/setup.js";
import * as wordlist from "./lib/wordlist.js";

let tabIDs = {};

chrome.action.onClicked.addListener(setup.activateExtensionToggle);

chrome.tabs.onActivated.addListener(activeInfo => actions.enableTab(activeInfo.tabId));
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status === 'complete') {
        actions.enableTab(tabId);
    }
});

chrome.runtime.onMessage.addListener(function (request, sender, responseCallback) {

    let tabID;

    switch (request.type) {

        case 'search': {
            configuration.get().then(async (config) => {
                const displayedPronunciations = (config["pinyinEnabled"] === "yes" ? ["pinyin"] : [])
                    .concat(config["jyutpingEnabled"] === "yes" ? ["jyutping"] : []);
                const words = await actions.search(request.text)

                const response = {
                    words: words,
                    originalText: request.originalText,
                    displayedPronunciations
                };
                responseCallback(response);
            });

            return true
        }

        case 'open':
            tabID = tabIDs[request.tabType];
            if (tabID) {
                chrome.tabs.get(tabID, function (tab) {
                    if (chrome.runtime.lastError) {
                        tab = undefined;
                    }
                    if (tab && tab.url && (tab.url.substr(-13) === 'wordlist.html')) {
                        // open existing word list
                        chrome.tabs.update(tabID, {
                            active: true
                        });
                    } else {
                        chrome.tabs.create({
                            url: request.url
                        }, function (tab) {
                            tabIDs[request.tabType] = tab.id;
                        });
                    }
                });
            } else {
                chrome.tabs.create({
                    url: request.url
                }, function (tab) {
                    tabIDs[request.tabType] = tab.id;
                    if (request.tabType === 'wordlist') {
                        // make sure the table is sized correctly
                        chrome.tabs.reload(tab.id);
                    }
                });
            }
            break;

        case 'copy': {
            let txt = document.createElement('textarea');
            txt.style.position = "absolute";
            txt.style.left = "-100%";
            txt.value = request.data;
            document.body.appendChild(txt);
            txt.select();
            document.execCommand('copy');
            document.body.removeChild(txt);
        }
            break;

        case 'add': {
            Promise.all(wordlist.get(), configuration.get()).then(([wordlist, config]) => {
                let saveFirstEntryOnly = config['saveToWordList'] === 'firstEntryOnly';


                for (let i in request.entries) {
                    let entry = {};
                    entry.timestamp = Date.now();
                    entry.simplified = request.entries[i].simplified;
                    entry.traditional = request.entries[i].traditional;
                    entry.pinyin = request.entries[i].pinyin;
                    entry.definition = request.entries[i].definition;
                    entry.jyutping = request.entries[i].jyutping;

                    wordlist.push(entry);

                    if (saveFirstEntryOnly) {
                        break;
                    }
                }
                localStorage['wordlist'] = JSON.stringify(wordlist);

                tabID = tabIDs['wordlist'];
                if (tabID) {
                    chrome.tabs.get(tabID, function (tab) {
                        if (tab) {
                            chrome.tabs.reload(tabID);
                        }
                    });
                }
            })
        }
            break;

        default:
        // ignore
    }
});
