
import LevelUP from 'levelup'
import Encoding from 'encoding-down'
import { EventEmitter } from 'events'
import LevelDOWN from 'leveldown-nodejs-mobile'
import { fileURLToPath } from 'url'
import path from 'path'


const __dirname = path.dirname(fileURLToPath(import.meta.url))

class LevelDB {
    constructor() {
        if (!(this instanceof LevelDB)) {
            return new LevelDB()
        }
        EventEmitter.call(this)
        var dbPath = path.resolve(path.join(__dirname, './../leveldb'))
        this.db = LevelUP(Encoding(LevelDOWN(dbPath), { valueEncoding: 'json' }))
    }

    async insert(k, v) {
        return this.db.put(k, v)
    }

    async get(k) {
        return this.db.get(k)
    }
    async del(k) {
        return this.db.del(k)
    }
    async clear() {
        return this.db.clear()
    }
}

export default LevelDB
