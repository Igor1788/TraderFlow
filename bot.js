const ccxt = require('ccxt');
require('dotenv').config();
const market = await binance.fetchMarkets();
const symbolInfo = market.find(m => m.symbol === symbol);
const minOrderSize = symbolInfo.limits.amount.min;

if (amount < minOrderSize) {
  console.log('Quantidade da ordem abaixo do tamanho mínimo.');
  return;
}
const order = await binance.createLimitBuyOrder(symbol, amount, price);

if (order && order.status === 'closed') {
  console.log('Compra realizada:', order);
} else {
  console.log('Ordem de compra não preenchida.');
  // Lide com a ordem não preenchida aqui
}
const binance = new ccxt.binance({
  apiKey: process.env.API_KEY,
  secret: process.env.API_SECRET,
});

const symbol = 'BNB/BRL'; // Substitua pelo símbolo da criptomoeda desejada
const buyThreshold = -0.1;
const sellThreshold1 = 0.1;
const sellThreshold2 = 1.0;

async function main() {
  while (true) {
    try {
      const ticker = await binance.fetchTicker(symbol);
      const price = ticker.close;
      const balance = await binance.fetchBalance();

      // Verifica a variação de valor
      if (price <= buyThreshold * price) {
        const availableBalance = balance.free.USDT * 0.05; // Utiliza 5% do saldo disponível
        const amount = availableBalance / price;
        const order = await binance.createLimitBuyOrder(symbol, amount, price);
        console.log('Compra realizada:', order);
      } else if (price >= sellThreshold1 * price && price < sellThreshold2 * price) {
        const availableAmount = balance.free[symbol.split('/')[0]] * 0.1; // Vende 10% da moeda
        const order = await binance.createLimitSellOrder(symbol, availableAmount, price);
        console.log('Venda realizada:', order);
      } else if (price >= sellThreshold2 * price) {
        const availableAmount = balance.free[symbol.split('/')[0]]; // Vende toda a moeda
        const order = await binance.createMarketSellOrder(symbol, availableAmount);
        console.log('Venda realizada:', order);
      }
    } catch (error) {
      console.error('Erro:', error);
    }

    await sleep(600000); // Aguarda 10 minutos
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();
