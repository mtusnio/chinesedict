import * as fs from "node:fs/promises"

let _storage = {}

global.chrome = {
    runtime: {
        getURL(path) {
            return path
        },
    },
    action: {
        setBadgeBackgroundColor: () => {
            throw Error("Not Implemented")
        },
        setBadgeText: () => {
            throw Error("Not Implemented")
        }
    },
    storage: {
        local: {
            clear: async () => { _storage = {} },
            set: async (obj) => { _storage = { ..._storage, ...obj, } },
            get: async (keys) => {
                const ret = { [keys[0]]: _storage[keys[0]] }
                return ret
            }
        }
    }
};


global.fetch = async (input, init) => {
    const data = await fs.readFile(input)
    return new Response(
        data.toString(), {
        status: 200,
        statusText: 'success',
        headers: {},
    }
    )
}
