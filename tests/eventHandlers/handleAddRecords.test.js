'use strict';

const test = require('unit.js');
const {getContentFromReplyMessage} = require('../../eventHandlers/handleAddRecord')


describe('Test handleAddRecord', function() {
    it("extract reply message", async function() {

        const text1 = getContentFromReplyMessage("What was your purchase?", "bbt")
        test.string(text1).is("/add bbt")

        const text2 = getContentFromReplyMessage("How much does seafood cost", "3.5")
        test.string(text2).is("/add seafood, 3.5")

        const text3 = getContentFromReplyMessage("What should I categorise seafood, $3.5 as?", "food")
        test.string(text3).is("/add seafood, 3.5, food")

        const text4 = getContentFromReplyMessage("What are you?", "bbt")
        test.undefined(text4)
    })


});
