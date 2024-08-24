
async function get() {
    const output = await chrome.storage.local.get([
        "wordlist"
    ])

    const wordlist = output["wordlist"]
    if (!wordlist) {
        return []
    }

    return wordlist
}

async function add(entry) {
    const wordlist = await get()

    wordlist.push({
        timestamp: Date.now(),
        ...entry
    })

    await chrome.storage.local.set({ "wordlist": wordlist })
}


export { add, get }

