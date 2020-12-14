'use strict';

const test = require('unit.js');
const {getContentFromReplyMessage, validateInputs} = require('../../eventHandlers/handleAddRecord')


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

    it("validate record inputs", async function() {

        const records =
            [
                {userId: "123", chatId: "123", messageId: "123", name: "sebastian", amount: "dinner", category: "food"},
                {userId: "123", chatId: "123", messageId: "123", name: "sebastian", amount: "1.2", category: "groceries"}
            ]

        records.forEach((record) => {
            test.error(() => {
                validateInputs(record)
            }).match(`invalid input: ${JSON.stringify(record)}`)
        })

        const record = {userId: "123", chatId: "123", messageId: "123", name: "sebastian", amount: "123", category: "food"}
        test.object(record).is(record)

    })
});
