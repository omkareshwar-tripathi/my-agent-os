'use strict';
// Atlas hub — CLI sync: derive every registered repo's layers into atlas-data/cache.
const lib = require('./lib');
console.log('Atlas hub — sync');
for (const r of lib.syncAll()) {
  console.log(`  · ${r.id}: ${r.present ? 'synced' : 'not on this device — cache kept'}`);
}
