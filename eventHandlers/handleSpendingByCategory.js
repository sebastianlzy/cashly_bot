const compact = require('lodash/compact')
const trim = require('lodash/trim')
const lowerCase = require('lodash/lowerCase')
const capitalize = require('lodash/capitalize')
const get = require('lodash/get')
const isNil = require('lodash/isNil')
const isEmpty = require('lodash/isEmpty')
const db = require('../db')
const sanitizeMessage = require('../utility/sanitizeMessage')
const formatCurrency = require('../utility/formatCurrency')
const {COMMANDS} = require('../constants')
const moment = require('moment')

const parseCategoryText = (text) => {
    const re = new RegExp(`/${COMMANDS.spendingByCategory} (.+)`)
    const reRes = get(text.match(re), "1", "")

    const categories = compact(reRes.split(",")).reduce((acc, category) => {
        acc.push(`"${lowerCase(trim(category))}"`)
        return acc
    }, [])

    return {
        categories: categories.join(",")
    }
}

const getMonthName = (month) => {
    if (isNil(month)) {
        return ""
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return monthNames[month]
}

const aggregateRecords = (records) => {
    return records.reduce((acc, record) => {
        const createdAt = moment(record.created_at)
        const key = createdAt.format("YYYY-MM")
        acc[key] = get(acc, key, {})
        acc[key][record.category] = get(acc, `${key}.${record.category}`, 0) + parseFloat(record.amount)
        acc[key]['total'] = get(acc, `${key}.total`, 0) + parseFloat(record.amount)
        return acc
    }, {})
}

const convertToMd = (aggregatedRecords) => {
    const keys = Object.keys(aggregatedRecords)
    keys.sort()
    return keys.reduce((monthYearAcc, monthYear) => {
        monthYearAcc.push(`*${sanitizeMessage(moment(monthYear).format("MMM, YYYY"))}*`)
        const categoryRecords = Object.keys(aggregatedRecords[monthYear]).reduce((recordAcc, category) => {
            if (category === "total") {
                return recordAcc
            }

            recordAcc.push(sanitizeMessage(`${capitalize(category)} - ${formatCurrency(aggregatedRecords[monthYear][category])}`))
            return recordAcc
        }, [])

        categoryRecords.push(sanitizeMessage(`${capitalize('total')} - ${formatCurrency(aggregatedRecords[monthYear]['total'])}`))
        monthYearAcc.push(categoryRecords.join("\n"))
        return monthYearAcc
    }, []).join("\n\n")
}

module.exports = async (message) => {
    const {categories} = parseCategoryText(message.text)
    const records = await db.getRecords({
        conditions: `user_id=${message.userId}` + isEmpty(categories) ? undefined : `AND category in (${categories})`
    })

    const aggregatedRecords = aggregateRecords(records)

    return {
        message: convertToMd(aggregatedRecords),
        options: {
            parse_mode: "MarkdownV2",
        }
    }
}