'use strict';

const test = require('unit.js');
const sanitizeMessage = require('../../../utility/sanitizeMessage/index.js')


describe('Test utility/sanitizeMessage', function() {
    it("aggregate records", async function() {

        const resp = sanitizeMessage("A record for mos burger, 15.8, food has been recorded")
        test.string(resp).is("A\\ record\\ for\\ mos\\ burger\\,\\ 15\\.8\\,\\ food\\ has\\ been\\ recorded")

    })
});
