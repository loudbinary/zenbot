
let ccxt = require('ccxt')
let _ = require('lodash')
new ccxt.bitmex().fetch_markets().then(function(markets) {
  var products = []
  markets = markets.filter((m)=>{
    return m.active === true
  })

  markets.forEach(function (market) {
    var min_size = parseFloat(market.limits.price.min)
    var prec = 0
    if (min_size > 130 ) {
      prec = 4
    } else if (min_size > 30) {
      prec = 3
    } else if (min_size > 1) {
      prec = 2
    } else if (min_size > 0.1) {
      prec = 1
    }
    //var increment = '0.' + '0'.repeat(prec + product.price_precision - (product.pair.substring(3, 6).toUpperCase() == 'USD' ? 3 : 0)) + '1'
    console.log(min_size)
    products.push({
      id: market.id,
      asset: market.base,
      currency: market.quote,
      min_size: market.limits.amount.min,
      max_size: market.limits.amount.max,
      increment: market.limits.price.min,
      asset_increment: min_size,
      label: market.id
    })
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
