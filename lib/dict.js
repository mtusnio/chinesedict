/*
 Zhongwen - A Chinese-English Pop-Up Dictionary
 Copyright (C) 2019 Christian Schiller
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

export class ZhongwenDictionary {

    constructor(dictionary) {
        this.dictionary = dictionary
    }

    static createDictionary(dictionaries, grammarKeywords) {
        const dict = {};

        dictionaries.forEach((dictionary) => {

            const lines = dictionary.contents.split("\n").filter((line) => {
                return !line.startsWith("#");
            });

            // Example line:
            // 叢 丛 [cong2] { cung4 } /cluster/collection/collection of books/thicket/
            lines.forEach((line) => {
                let tokens = line.match(/(.+?) (.+?) \[[ ]*(.+?)[ ]*\] {[ ]*(.+?)[ ]*} \/(.+)\//);

                if (tokens) {
                    const simplifiedKey = tokens[2].replace("·", "")
                    const traditionalKey = tokens[1].replace("·", "")

                    const allEntries = dict[traditionalKey] || [];
                    const entry = {
                        type: dictionary.type,
                        length: traditionalKey.length,
                        simplified: tokens[2],
                        traditional: tokens[1],
                        pronunciation: {
                            // Some dictionaries might use v for u:
                            mandarin: tokens[3].replace("v", "u:"),
                            cantonese: tokens[4]
                        },
                        definition: tokens[5],
                        grammar: !!grammarKeywords[simplifiedKey]
                    };

                    // Merge duplicate entries
                    const existingEdited = allEntries.some((existingEntry) => {
                        if (existingEntry.definition === entry.definition) {
                            const existingPronunciations = existingEntry.pronunciation.cantonese.split("/");
                            const newPronunciations = entry.pronunciation.cantonese.
                                split("/").filter(x => !existingPronunciations.includes(x));
                            if (newPronunciations.length > 0) {
                                existingEntry.pronunciation.cantonese += `/${newPronunciations.join("/")}`;
                            }
                            return true;
                        }
                        return false;
                    });

                    if (existingEdited) {
                        return;
                    }

                    allEntries.push(entry);
                    dict[traditionalKey] = allEntries;
                    dict[simplifiedKey] = allEntries;
                }
            });
        });

        return new ZhongwenDictionary(dict);
    }

    wordSearch(word, type = "common") {
        const entries = this.dictionary[word] || [];
        return entries.filter(
            (entry) => entry.type === "common"
                || entry.type === type)
            .map(entry => {
                entry.originalWord = word;
                return entry;
            });
    }
}
