// eslint-disable-next-line no-unused-vars
var colors = require('colors'),
  fs = require('fs')

String.prototype.SplitIntoParts = function(partLength)
{
  var list = []
  if (this !== '' && partLength > 0)
  {
    for (var i = 0; i < this.length; i += partLength)
    {
      list.push(this.substr(i, Math.min(partLength, this.length)))
    }
  }
  return list
}


module.exports = function (program) {
  program
    .command('list-selectors')
    .description('list available selectors')
    .action(function (/*cmd*/) {
      var exchanges = fs.readdirSync('./extensions/exchanges')
      exchanges.forEach(function(exchange){
        if (exchange === 'sim' || exchange === '_stub') return

        console.log(`${exchange}:`)
        var products = require(`../extensions/exchanges/${exchange}/products.json`)
        products.sort(function (a, b) {
          if (a.asset < b.asset) return -1
          if (a.asset > b.asset) return 1
          if (a.currency < b.currency) return -1
          if (a.currency > b.currency) return 1
          return 0
        })
        products.forEach(function (p) {
          if (p.v2 === false || typeof  p.v2 === 'undefined'){
            console.log('  ' + exchange.cyan + '.'.grey + p.asset.green + '-'.grey + p.currency.cyan + (p.label ? ('   (' + p.label + ')').grey : ''))
          } else {
            var cleaned = p.symbol.replace('_','').replace('/','')

            var instrument = cleaned.SplitIntoParts(3)
            var formatted = instrument.join('-')
            if (formatted.lastIndexOf('-') === 3) {
              console.log('  ' + exchange.cyan + '.'.grey + instrument[0] + '-'.grey + instrument[1] + (p.label ? ('   (' +  p.label + ')').grey : ''))
            } else if (formatted.lastIndexOf('-') === 7){
              console.log('  ' + exchange.cyan + '.'.grey + instrument[0] + '-'.grey + instrument[1] + '-'.grey + instrument[2] + (p.label ? ('   (' +  p.label + ')').grey : ''))
            }
          }
        })
      })
      process.exit()
    })
}
