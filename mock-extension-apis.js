let _storage = {}

global.chrome = {
    storage: {
        local: {
            set: async (obj) => { _storage = { ..._storage, ...obj, } },
            get: async (keys) => {
                const ret = { [keys[0]]: _storage[keys[0]] }
                return ret
            }
        }
    }
};
