const isNumber = require('lodash/isNumber')

module.exports = (val) => {

    if (!isNumber) {
        return 0
    }

    const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    })

    return formatter.format(parseFloat(val))

}