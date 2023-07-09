//Packages
const dotenv = require('dotenv');
dotenv.config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

//Token
const Token = process.env.TELEGRAM_BOT_TOKEN
const bot = new TelegramBot(Token, { polling: true });

//Commands
bot.onText(/^\/([a-zA-Z]+)$/, async (msg, match) => {
    const coinSymbol = match[1].toLowerCase();

    // Skip processing for the /start command
    // if (coinSymbol === 'start') {
    //     return;
    // }

    try {
        const coinListResponse = await axios.get('https://api.coingecko.com/api/v3/coins/list');
        const coinList = coinListResponse.data;

        const coin = coinList.find(c => c.symbol === coinSymbol || c.id === coinSymbol);

        if (coin) {
            const coinDataResponse = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin.id}`);
            const coinData = coinDataResponse.data;

            const { symbol, name, market_data } = coinData;

            const price = formatNumber(market_data.current_price.usd.toFixed(2));
            const change = market_data.price_change_percentage_24h.toFixed(2);
            const cap = formatNumber(market_data.market_cap.usd);
            const volume = formatNumber(market_data.total_volume.usd);
            const supply = formatNumber(market_data.circulating_supply);

            const message = `
            Cryptocurrency Information:
Symbol: ${symbol.toUpperCase()}
Name: ${name}
Price: $${price}
Change (24h): ${change}%
Market Cap: $${cap}
Total Volume: $${volume}
Circulating Supply: ${supply}`;

            bot.sendMessage(msg.chat.id, message);
        } else { bot.sendMessage(msg.chat.id, `Coin '${coinSymbol}' not found.`); }

    } catch (error) {
        console.error(error);
        bot.sendMessage(msg.chat.id, 'Sorry, an error occurred.');
    }
});

// Format large numbers with commas
function formatNumber(number) { return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); }