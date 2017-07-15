"use latest";

var request = require('request');

module.exports = (ctx, done) => {

  if(!ctx.data.market) {
    done(null, "Must specify market as a query parameter in the format: ?market=BTC-LTC");
  }

  const requestMarket = ctx.data.market;

  request('https://bittrex.com/api/v1.1/public/getmarkets', (err, res, body) => {
    if(err) {
      done(null, "Error from bittrex: " + err.message);
    }
    const marketInfo = JSON.parse(body);
    const availableMarkets = marketInfo.result.map((market) => {
      return market.BaseCurrency + "-" + market.MarketCurrency;
    });

    if(!marketExists(availableMarkets, requestMarket)) {
      const filteredMarkets = availableMarkets.filter((market) => {
        if(market.indexOf(requestMarket) !== -1) return true;
      });

      if(filteredMarkets.length === 0) {
          done(null, "Invalid market specified, valid markets are: " + availableMarkets);
      }
      done(null, "Available markets for " + requestMarket + ": " + filteredMarkets);
    }

    request('https://bittrex.com/api/v1.1/public/getticker?market=' + requestMarket, (err, res, body) => {
      const tickerInfo = JSON.parse(body);
      done(null, tickerInfo.result);
    });
  });
}

function marketExists(availableMarkets, requestMarket) {
  for(var i = 0; i < availableMarkets.length; i++) {
    if(availableMarkets[i] === requestMarket) return true;
  }
  return false;
}