let z = require('zero-fill')
  , n = require('numbro')
  , srsi = require('../../../lib/srsi')
  , ema = require('../../../lib/ema')
  , Phenotypes = require('../../../lib/phenotype')

module.exports = {
  name: 'mexmaker',
  description: 'Personalized algo by Loudbinary and MNelson',
  getOptions: function () {

    /**
     * useRes      = input(defval = true, title = "Use Alternate Resolution?")
     intRes      = input(defval = 3.00,    title = "Multiplier for Alernate Resolution")
     stratRes    = ismonthly? tostring(interval*intRes,"###M") : isweekly? tostring(interval*intRes,"###W") : isdaily?  tostring(interval*intRes,"###D") : isintraday ? tostring(interval*intRes,"####") : '60'
     basisType   = input(defval = "SMMA", title = "MA Type: ", options=["SMA", "EMA", "DEMA", "TEMA", "WMA", "VWMA", "SMMA", "HullMA", "LSMA", "ALMA", "SSMA", "TMA"])
     basisLen    = input(defval = 8, title = "MA Period", minval = 1)
     offsetSigma = input(defval = 6, title = "Offset for LSMA / Sigma for ALMA", minval = 0)
     offsetALMA  = input(defval = 0.85, title = "Offset for ALMA", minval = 0, step = 0.01)
     scolor      = input(false, title="Show coloured Bars to indicate Trend?")
     delayOffset = input(defval = 0, title = "Delay Open/Close MA (Forces Non-Repainting)", minval = 0, step = 1)
     tradeType   = input("BOTH", title="What trades should be taken : ", options=["LONG", "SHORT", "BOTH", "NONE"])
     */

    this.option('alternate_resolution', 'alternate resolution, same as --alternate-resolution',Boolean, true)
    this.option('resolution_multiplier', 'resolution multip;lier, same as --resolution-multiplier', Number,3.00)
    // Not sure how to include stratRes yet.
    this.option('basis_type', 'basis type, same as --basis-type', String,'smma')
    this.option('ma_period', 'ma periods, same as --ma-period', Number,8) //note min val is one. not enforcing yet.
    this.option('offset-sigma', 'offset sigma, same as --offset-sigma',Number,0) // Note defaults above.
    this.option('offset_alma', 'offset alma, same as --offset-alma', Number,0) // Note defaults and increment above.  Just don't do it, POC
    // THe reset will be handles i bot, i believe this is all options required for now to keep parity with other system.
  },

  calculate: function (s) {
    // compute Stochastic RSI
    srsi(s, 'srsi', s.options.rsi_periods, s.options.srsi_k, s.options.srsi_d)

    // compute MACD
    ema(s, 'ema_short', s.options.ema_short_period)
    ema(s, 'ema_long', s.options.ema_long_period)
    if (s.period.ema_short && s.period.ema_long) {
      s.period.macd = (s.period.ema_short - s.period.ema_long)
      ema(s, 'signal', s.options.signal_period, 'macd')
      if (s.period.signal) {
        s.period.macd_histogram = s.period.macd - s.period.signal
      }
    }
  },

  onPeriod: function (s, cb) {
    if (!s.in_preroll)
      if (typeof s.period.macd_histogram === 'number' && typeof s.lookback[0].macd_histogram === 'number' && typeof s.period.srsi_K === 'number' && typeof s.period.srsi_D === 'number')
      // Buy signal
        if (s.period.macd_histogram >= s.options.up_trend_threshold)
          if (s.period.srsi_K > s.period.srsi_D && s.period.srsi_K > s.lookback[0].srsi_K && s.period.srsi_K < s.options.oversold_rsi)
            s.signal = 'buy'

    // Sell signal
    if (s.period.macd_histogram < s.options.down_trend_threshold)
      if (s.period.srsi_K < s.period.srsi_D && s.period.srsi_K < s.lookback[0].srsi_K && s.period.srsi_K > s.options.overbought_rsi)
        s.signal = 'sell'

    // Hold
    //s.signal = null;
    cb()
  },
  onReport: function (s) {
    var cols = []
    if (typeof s.period.macd_histogram === 'number') {
      var color = 'grey'
      if (s.period.macd_histogram > 0) {
        color = 'green'
      }
      else if (s.period.macd_histogram < 0) {
        color = 'red'
      }
      cols.push(z(8, n(s.period.macd_histogram).format('+00.0000'), ' ')[color])
      cols.push(z(8, n(s.period.srsi_K).format('00.00'), ' ').cyan)
      cols.push(z(8, n(s.period.srsi_D).format('00.00'), ' ').yellow)
    }
    else {
      cols.push('         ')
    }
    return cols
  },

  phenotypes: {
    // -- common
    period_length: Phenotypes.RangePeriod(1, 120, 'm'),
    min_periods: Phenotypes.Range(1, 200),
    markdown_buy_pct: Phenotypes.RangeFloat(-1, 5),
    markup_sell_pct: Phenotypes.RangeFloat(-1, 5),
    order_type: Phenotypes.ListOption(['maker', 'taker']),
    sell_stop_pct: Phenotypes.Range0(1, 50),
    buy_stop_pct: Phenotypes.Range0(1, 50),
    profit_stop_enable_pct: Phenotypes.Range0(1, 20),
    profit_stop_pct: Phenotypes.Range(1,20),

    // -- strategy
    rsi_periods: Phenotypes.Range(1, 200),
    srsi_periods: Phenotypes.Range(1, 200),
    srsi_k: Phenotypes.Range(1, 50),
    srsi_d: Phenotypes.Range(1, 50),
    oversold_rsi: Phenotypes.Range(1, 100),
    overbought_rsi: Phenotypes.Range(1, 100),
    ema_short_period: Phenotypes.Range(1, 20),
    ema_long_period: Phenotypes.Range(20, 100),
    signal_period: Phenotypes.Range(1, 20),
    up_trend_threshold: Phenotypes.Range(0, 20),
    down_trend_threshold: Phenotypes.Range(0, 20)
  }
}
