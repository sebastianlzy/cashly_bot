const isEmpty = require('lodash/isEmpty')
const isNil = require('lodash/isNil')
const get = require('lodash/get')
const db = require('../db')
const compact = require('lodash/compact')
const trim = require('lodash/trim')
const lowerCase = require('lodash/lowerCase')
const {COMMANDS} = require('../constants')
const sanitizeMessage = require('../utility/sanitizeMessage')
const formatCurrency = require('../utility/formatCurrency')


const parseAddText = (text) => {
    const re = new RegExp(`/${COMMANDS.add} (.+)`)
    const reRes = get(text.match(re), "1", "")
    const [name, amount, category] = compact(reRes.split(","))

    return {
        name: lowerCase(trim(name)),
        amount: trim(amount),
        category: lowerCase(trim(category))
    }
}

const checkForMissingFields = (name, amount, category) => {

    if (isEmpty(name)) {
        return "What was your purchase?"
    }

    if (isEmpty(amount)) {
        return `How much does ${name} cost?`
    }

    if (isEmpty(category)) {
        return `What should I categorise ${name}, $${amount} as?`
    }
}

const getContentFromReplyMessage = (replyMessage, text) => {
    const regexForName = /What was your purchase?/
    const regexForCost = /How much does (.*) cost?/
    const regexForCategory = /What should I categorise (.*), \$(.*) as?/


    let res = get(replyMessage.match(regexForName), '0') ? text : undefined

    if (isNil(res)) {
        res = get(replyMessage.match(regexForCost), '1')
    }

    if (isNil(res)) {
        const resFromRegexForCategory = replyMessage.match(regexForCategory)
        res = isNil(resFromRegexForCategory) ? undefined : `${get(resFromRegexForCategory, '1')}, ${get(resFromRegexForCategory, '2')}`
    }

    if (!isNil(res)) {
        return res === text ? `/add ${text}`:`/add ${res}, ${text}`
    }

    return res
}



module.exports = async (message) => {
    const {name, amount, category} = parseAddText(message.text)
    const requestMessageForInfo = checkForMissingFields(name, amount, category)

    if (!isNil(requestMessageForInfo)) {
        return {
            message: sanitizeMessage(requestMessageForInfo),
            options: {
                reply_markup: {force_reply: true, selective: true},
                parse_mode: "MarkdownV2",
            }
        }
    }

    try {
        await db.createRecord(
            message.userId,
            message.chatId,
            message.messageId,
            name,
            amount,
            category
        )

        return {
            message: sanitizeMessage(`${name}, ${formatCurrency(amount)} has been categorised as ${category}`),
            options: {parse_mode: "MarkdownV2"}
        }
    } catch (e) {
        return {
            message: `An error has occurred: ${JSON.stringify(e)}`,
        }
    }

}

module.exports.getContentFromReplyMessage = getContentFromReplyMessage
