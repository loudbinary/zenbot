let ccxt = require('ccxt')
let _ = require('lodash')
let math = require('mathjs')
let contracts = ['XBTUSD','XBT7D_D95','XBT7D_U105','XBTU18','XBTX18', 'ADAU18','BCHU18', 'EOSU18', 'ETHU18', 'LTCU18', 'TRXU18', 'XRPU18']
let getAssets = (markets,asset)=>{
  let results= _.filter(markets,(m)=>{
    return m.symbol == asset
  })
  return results
}
new ccxt.bitmex().fetch_markets().then(function(instruments) {
  // Serperate out tradeable markets.
  let markets = []
  _.forEach(instruments, i =>{
    _.forEach(contracts,c =>{
      if (c === i.symbol) {
        markets.push(i)
      }
    })
  })
  var products = []

  markets.forEach(function (market) {
    let asset = getAssets(markets,'.B' + market.info.quoteCurrency) //.B = Base .BXBT
    let asset_increment = asset[0].limits.price.min
    let min_size = math.format(market.limits.price.min,  {notation: 'fixed', precision: market.precision.price})
    if (market.id === 'XBTUSD' || market.id === 'TRXU18'){
      // console.log(market);
    }

    if (market.info.state === 'Open'){
      //console.log(market.symbol);
    }
    //Determine if market item is perpetual contract.
    var perpetual = false

    if (market.info.expiry === null){
      perpetual = true
    }
    if (perpetual === false){
      console.log(market.id,'is perpetual')
    }


    //If perpetual = false, then provide expiration date, otherwise null.
    var product = {
      id: market.id,
      asset: market.base,
      currency: market.info.quoteCurrency,
      //min_size: market.limits.amount.min,
      min_size: min_size,
      max_size: market.limits.amount.max,
      increment: market.limits.price.min,
      asset_increment: asset_increment,
      label: market.id,
      perpetual: perpetual,
      v2: true
    }
    product.instrument = {}
    product.instrument.props = {}
    product.instrument.props = market

    products.push(product)
  })

  var target = require('path').resolve(__dirname, 'products.json')
  require('fs').writeFileSync(target, JSON.stringify(products, null, 2))
  console.log('wrote', target)
  process.exit()
})
