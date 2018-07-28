const BitMEXClient = require('bitmex-realtime-api')
// See 'options' reference below
const client = new BitMEXClient({testnet: true})

client.addStream('XBTUSD', 'trade', () => {})
setTimeout(() => {
  console.log('XBTUSD trades during the last few seconds:', client.getTable('trade').XBTUSD)
}, 1000)

/*
client.on('initialize', () => {
  console.log(client.streams);  // Log .public, .private and .all stream names
});

client.addStream('XBTUSD', 'instrument', function (data, symbol, tableName) {
  // Do something with the table data...
  console.log(data);
});
*/
