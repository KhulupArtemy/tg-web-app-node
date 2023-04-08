const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '6235110491:AAGO2nsjElVR79g4EqKe0SnStkFR3Tt2fGY';
const webAppUrl = 'https://cerulean-fox-c4bbfc.netlify.app/';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text==='/start') {
        await bot.sendMessage(chatId, 'Заполните форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + 'form'}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Перейти в магазин', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data);

            await bot.sendMessage(chatId, "Ваши данные:");
            await bot.sendMessage(chatId, "Ваша страна " + data?.country);
            await bot.sendMessage(chatId, "Ваша улица " + data?.street);

            setTimeout(async () => {
                await bot.sendMessage(chatId, "Сообщение с 3-х " +
                    "секундной задержкой. Вы " + data?.subject);
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }
});

app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: `Сумма вашей покупки составляет ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({});
    }
})
const PORT = 8000;
app.listen(PORT, () => console.log('Server started on PORT ' + PORT))