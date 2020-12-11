'use strict';

const test = require('unit.js');
const handleSpendingByDay = require('../../eventHandlers/handleSpendingByDay')


describe('Test handleSpendingByDay', function () {
    this.timeout(10000)
    it("aggregate records", async function () {
        const resp = await handleSpendingByDay({text: "/spendingbyday"})
        test.string(resp.message).match(/Food/i)
    })
});
