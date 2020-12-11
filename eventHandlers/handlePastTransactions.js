const db = require('../db')
const sanitizeMessage = require('../utility/sanitizeMessage')
const formatCurrency = require('../utility/formatCurrency')
const capitalize = require('lodash/capitalize')
const moment = require('moment')


const convertToMd = (records) => {
    return ["*Past transactions*", ""].concat(records.reduce((acc, record) => {
        const momentAgo = moment(record.created_at).fromNow()

        acc.push(sanitizeMessage(`${capitalize(record.name)}(${capitalize(record.category)}) ${formatCurrency(record.amount)} - ${momentAgo}`))
        return acc
    }, [])).join('\n')
}

module.exports = async () => {
    const records = await db.getRecords({
        limit: 10,
        orderBy: "created_at desc"
    })

    return {
        message: convertToMd(records),
        options: {
            parse_mode: "MarkdownV2",
        }
    }
}