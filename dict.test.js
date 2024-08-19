'use strict';

import { ZhongwenDictionary } from "./dict.js";

import { jest } from '@jest/globals';

jest.useFakeTimers();

afterEach(async () => {

});

test("entries with different traditional and simplified characters get added double without merging", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `

# CC-CEDICT
澇災 涝灾 [lao4 zai1 ] { lou6 zoi1 } /flooding; waterlogging/
澤國 泽国 [ ze2 guo2] { zaak6 gwok3 } /flood plains; swamps/

`
        },
        {
            type: "cantonese",
            contents: `

律師 律师 [lu:4 shi1] {leot6 si1} /lawyer/
# CC-CEDICT
傳播媒介 传播媒介 [chuan2 bo1 mei2 jie4] {cyun4 bo3 mui4 gaai3} /media [communication]; mass media/

`
        }
    ], {})

    expect(zhongwenDict.dictionary.size).toEqual(8)

    expect(zhongwenDict.wordSearch("涝灾", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '涝灾',
        traditional: '澇災',
        originalWord: "涝灾",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'flooding; waterlogging',
        grammar: false
    }])
    expect(zhongwenDict.wordSearch("澇災", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '涝灾',
        traditional: '澇災',
        originalWord: "澇災",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'flooding; waterlogging',
        grammar: false
    }])


    expect(zhongwenDict.wordSearch("律師", "cantonese")).toEqual([{
        type: 'cantonese',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律師",
        pronunciation: {
            cantonese: "leot6 si1",
            mandarin: "lu:4 shi1",
        },
        definition: 'lawyer',
        grammar: false
    }])
    expect(zhongwenDict.wordSearch("律师", "cantonese")).toEqual([{
        type: 'cantonese',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: '律师',
        pronunciation: {
            cantonese: "leot6 si1",
            mandarin: "lu:4 shi1",
        },
        definition: 'lawyer',
        grammar: false
    }])
})


test("entries with same definition and characters get different cantonese pronunciations merged in", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `
律師 律师 [lao4 zai1 ] { lou6 zoi1 } /lawyer/
`
        },
        {
            type: "cantonese",
            contents: `

律師 律师 [lu:4 shi1] {leot6 si1} /lawyer/
`
        }
    ], {})

    expect(zhongwenDict.dictionary.size).toEqual(2)

    expect(zhongwenDict.wordSearch("律師", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律師",
        pronunciation: {
            cantonese: "lou6 zoi1/leot6 si1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }])

    expect(zhongwenDict.wordSearch("律师", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律师",
        pronunciation: {
            cantonese: "lou6 zoi1/leot6 si1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }])
})

test("entries with same characters but different definitions are returned together", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `
律師 律师 [lao4 zai1 ] { lou6 zoi1 } /lawyer/
律師 律师 [lao4 zai1 ] { lou6 zoi1 } /different lawyer/
`
        },
    ], {})

    expect(zhongwenDict.dictionary.size).toEqual(2)

    expect(zhongwenDict.wordSearch("律師", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律師",
        originalWord: "律師",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }, {
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律師",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'different lawyer',
        grammar: false
    }])

    expect(zhongwenDict.wordSearch("律师", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律师",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }, {
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律师",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'different lawyer',
        grammar: false
    }])
})


test("entries with a space in between are indexed without the space, however they display it in the prompt", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `
律·師 律·师 [lao4 zai1 ] { lou6 zoi1 } /lawyer/
`
        },
    ], {})

    expect(zhongwenDict.dictionary.size).toEqual(2)

    expect(zhongwenDict.wordSearch("律師", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律·师',
        traditional: '律·師',
        originalWord: "律師",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }])

    expect(zhongwenDict.wordSearch("律师", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律·师',
        traditional: '律·師',
        originalWord: "律师",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: false
    }])
})


test("entries with a corresponding grammar keyword have it included", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `
律師 律师 [lao4 zai1 ] { lou6 zoi1 } /lawyer/
`
        },
    ], { "律师": 1 })

    expect(zhongwenDict.dictionary.size).toEqual(2)

    expect(zhongwenDict.wordSearch("律師", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律師",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: true
    }])

    expect(zhongwenDict.wordSearch("律师", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '律师',
        traditional: '律師',
        originalWord: "律师",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'lawyer',
        grammar: true
    }])
})



test("cantonese entries do not show up when restricted to using common", async () => {
    const zhongwenDict = new ZhongwenDictionary([
        {
            type: "common",
            contents: `
澤國 泽国 [ze2 guo2] { zaak6 gwok3 } /flood plains; swamps/

`
        },
        {
            type: "cantonese",
            contents: `
律師 律师 [lao4 zai1] { lou6 zoi1 } /lawyer/
澤國 泽国 [lao4 zai1] { lou6 zoi1 } /plains/
`
        }
    ], {})


    expect(zhongwenDict.wordSearch("澤國", "cantonese")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '泽国',
        traditional: '澤國',
        originalWord: "澤國",
        pronunciation: {
            cantonese: "zaak6 gwok3",
            mandarin: "ze2 guo2",
        },
        definition: 'flood plains; swamps',
        grammar: false
    }, {
        type: 'cantonese',
        length: 2,
        simplified: '泽国',
        traditional: '澤國',
        originalWord: "澤國",
        pronunciation: {
            cantonese: "lou6 zoi1",
            mandarin: "lao4 zai1",
        },
        definition: 'plains',
        grammar: false
    }])


    expect(zhongwenDict.wordSearch("澤國", "common")).toEqual([{
        type: 'common',
        length: 2,
        simplified: '泽国',
        traditional: '澤國',
        originalWord: "澤國",
        pronunciation: {
            cantonese: "zaak6 gwok3",
            mandarin: "ze2 guo2",
        },
        definition: 'flood plains; swamps',
        grammar: false
    }])

    expect(zhongwenDict.wordSearch("律師", "common")).toEqual([])
}
)





