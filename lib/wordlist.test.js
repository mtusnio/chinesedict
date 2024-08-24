'use strict';


import { jest } from '@jest/globals';
import * as wordlist from "./wordlist";

const fakeDate = new Date('2024-01-01')
jest.useFakeTimers().setSystemTime(fakeDate);

beforeEach(async () => {

})

afterEach(async () => {
    jest.clearAllMocks();
    await chrome.storage.local.clear()
});


test("non-existant wordlist returns an empty array", async () => {
    expect(await wordlist.get()).toEqual([])
})


test("returns entries added to it", async () => {
    let first_entry = {
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "water",
        jyutping: "seoi2"
    };
    let second_entry = {
        simplified: "水",
        traditional: "水",
        pinyin: "shui3",
        definition: "another water",
        jyutping: "seoi2"
    };

    await wordlist.add(first_entry)
    await wordlist.add(second_entry)

    const addedTime = fakeDate.getTime()
    expect(await wordlist.get()).toEqual([{
        timestamp: addedTime, ...first_entry
    }, { timestamp: addedTime, ...second_entry }])
})

