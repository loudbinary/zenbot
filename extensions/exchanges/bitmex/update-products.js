let ccxt = require('ccxt')
let _ = require('lodash')
let contracts = ['ETHUSD','XBTUSD','XBT7D_D95','XBT7D_U105','XBTU18','XBTX18', 'ADAU18','BCHU18', 'EOSU18', 'ETHU18', 'LTCU18', 'TRXU18', 'XRPU18']


new ccxt.bitmex().fetch_markets().then(function(instruments) {
  // Serperate out tradeable markets.
  let markets = []
  _.forEach(instruments, i =>{
    _.forEach(contracts,c =>{
      if (c === i.id) {
        markets.push(i)
      }
    })
  })
  var products = []

  markets.forEach(function (market) {
    var product = market
    product.v2 = true
    products.push(product)
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
