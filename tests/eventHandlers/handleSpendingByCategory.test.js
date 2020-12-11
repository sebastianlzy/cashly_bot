'use strict';

const test = require('unit.js');
const handleSpendingByCategoryTest = require('../../eventHandlers/handleSpendingByCategory')


describe('Test handleSpendingByCategory', function () {
    this.timeout(10000)
    it("aggregate records", async function () {
        const resp = await handleSpendingByCategoryTest({text: "/spendingbycategory food"})
        test.string(resp.message).match(/Food/i)
    })
});
