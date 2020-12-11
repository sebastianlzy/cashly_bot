const get = require('lodash/get')
const handleAddRecord = require('./eventHandlers/handleAddRecord')
const handleSpendingByCategory = require('./eventHandlers/handleSpendingByCategory')
const handleSpendingByDay = require('./eventHandlers/handleSpendingByDay')
const handlePastTransactions = require('./eventHandlers/handlePastTransactions')
const isNil = require('lodash/isNil')
const split = require('lodash/split')
const TelegramBot = require('node-telegram-bot-api');
const {getContentFromReplyMessage} = require('./eventHandlers/handleAddRecord')
const {COMMANDS} = require('./constants')
const sanitizeMessage = require('./utility/sanitizeMessage')
const formatCurrency = require('./utility/formatCurrency')

const token = process.env.TELEGRAM_TOKEN || "";
const bot = new TelegramBot(token);

const extractCommand = (text) => {
    const re = new RegExp(`/(${COMMANDS.start}|${COMMANDS.add}|${COMMANDS.spendingByCategory}|${COMMANDS.spendingByDay}|${COMMANDS.pastTransactions})(\s.*)?`)
    const res = text.match(re)
    return get(res, '1')
}

const getMessage = (body) => {
    return {
        messageId: get(body, 'message.message_id'),
        userId: get(body, 'message.from.id'),
        text: get(body, 'message.text'),
        chatId: get(body, 'message.chat.id')
    }
}

const handleEvent = async (event) => {
    console.log("--------------------index.js-handleEvent-33-body----------------------------")
    console.log(JSON.parse(event.body))
    console.log("--------------------index.js-handleEvent-33-body---------------------------")
    const body = JSON.parse(event.body)
    const message = getMessage(body)
    const replyMessage = get(body, 'message.reply_to_message')

    if (!isNil(replyMessage)) {
        const regexForStart = /Tell me your name, monthly allowance and age?/
        const res = replyMessage.text.match(regexForStart)
        if (!isNil(res)) {
            const [name, monthlyAllowance, age] = split(message.text, ",")
            const resp = {
                message: sanitizeMessage(`Welcome ${name}, you are ${age} years old and you receive a monthly allowance of ${formatCurrency(monthlyAllowance)}`),
                options: {
                    parse_mode: "MarkdownV2",
                }
            }

            await bot.sendMessage(message.chatId, resp.message, resp.options || {})
            return
        }

        message.text = getContentFromReplyMessage(replyMessage.text, message.text)
        if (isNil(message.text)) {
            return
        }
    }

    const command = extractCommand(message.text)

    if (command === COMMANDS.start) {

        const resp = {
            message: sanitizeMessage(`Tell me your name, monthly allowance and age?`),
            options: {
                reply_markup: {force_reply: true, selective: true},
                parse_mode: "MarkdownV2",
            }
        }
        await bot.sendMessage(message.chatId, resp.message, resp.options || {})
    }

    if (command === COMMANDS.add) {
        const resp = await handleAddRecord(message)
        await bot.sendMessage(message.chatId, resp.message, resp.options || {})
    }

    if (command === COMMANDS.spendingByCategory) {
        const resp = await handleSpendingByCategory(message)
        await bot.sendMessage(message.chatId, resp.message, resp.options || {})
    }

    if (command === COMMANDS.spendingByDay) {
        const resp = await handleSpendingByDay(message)
        await bot.sendMessage(message.chatId, resp.message, resp.options || {})
    }

    if (command === COMMANDS.pastTransactions) {
        const resp = await handlePastTransactions(message)
        await bot.sendMessage(message.chatId, resp.message, resp.options || {})
    }
}

exports.get = async function (event, context, callback) {

    await handleEvent(event)
    
    const result = {
        statusCode: 200,
        body: "bbt",
        headers: {'content-type': 'text/html'}
    };
    return Promise.resolve(callback(null, result));
};


exports.getContentFromReplyMessage = getContentFromReplyMessage
exports.extractCommand = extractCommand