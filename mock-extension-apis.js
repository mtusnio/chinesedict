/* global global */


import * as fs from "node:fs/promises";

let _storage = {};

global.chrome = {
    tabs: {
        onClicked: {
            addListener: () => { throw Error("Not Implemented"); },
            onUpdated: () => { throw Error("Not Implemented"); }
        },
        sendMessage: () => { throw Error("Not Implemented"); }
    },

    runtime: {
        getURL(path) {
            return path;
        },
        onMessage: {
            addListener: () => { throw Error("Not Implemented"); }
        }
    },
    action: {
        onClicked: {
            addListener: () => { throw Error("Not Implemented"); }
        },
        setBadgeBackgroundColor: () => {
            throw Error("Not Implemented");
        },
        setBadgeText: () => {
            throw Error("Not Implemented");
        }
    },
    storage: {
        local: {
            clear: async () => { _storage = {}; },
            set: async (obj) => { _storage = { ..._storage, ...obj, }; },
            get: async (keys) => {
                return keys.reduce(function (map, key) {
                    map[key] = _storage[key];
                    return map;
                }, {});
            }
        }
    },
    windows: {
        getAll: () => { throw Error("Not implemented") }
    }
};


global.fetch = async (input, init) => {
    const data = await fs.readFile(input);
    return new Response(
        data.toString(), {
        status: 200,
        statusText: 'success',
        headers: {},
    }
    );
};
