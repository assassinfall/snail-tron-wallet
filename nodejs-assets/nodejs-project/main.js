import rn_bridge from './bridge.cjs';
import Wallet from './wallet.js';
import LevelDB from './leveldb/leveldb.js';


async function run() {

  const db = new LevelDB()
  const wallet = new Wallet(db, 'tron')
  await wallet.start()
  rn_bridge.channel.send('nodejs-started');
}

run()