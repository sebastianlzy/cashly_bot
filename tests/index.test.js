'use strict';

const test = require('unit.js');
const index = require('../index');
const {extractCommand} = require('../index');
const db = require('../db')

after(async function() {
  this.timeout(10000)
  await db.deleteRecord("message_id=61 OR message_id=146")
  await db.closeConnection()
})

before(async function() {
  this.timeout(10000)
  await db.createRecordTable()
  await db.createUserTable()
})

const verifyHTTPresponse = async (body) => {
  return await index.get({body: JSON.stringify(body)}, { /* context */ }, (err, result) => {
    test.number(result.statusCode).is(200);
    test.string(result.body).contains('bbt');
    test.value(result).hasHeader('content-type', 'text/html');
  });
}

describe('Test index', function() {


  it('Extract command', function() {
      const command1 = extractCommand("/add bbt")
      test.string(command1).is("add")
  })
  it('Handle create record ', async function() {

    const body =  {
      update_id: 74392486,
      message: {
        message_id: 61,
        from: {
          id: 218760256,
          is_bot: false,
          first_name: 'Sebastian',
          username: 'sebastian987',
          language_code: 'en'
        },
        chat: {
          id: 218760256,
          first_name: 'Sebastian',
          username: 'sebastian987',
          type: 'private'
        },
        date: 1604201477,
        text: '/add bbt,3.5,food'
      }
    }

    await verifyHTTPresponse(body)
    const records = await db.getRecords({conditions: "message_id=61"})
    test.number(records.length).isGreaterThan(0)


  });
  it("Handle dialog create record in reply message", async function() {

    const body = {
      update_id: 74392502,
      message: {
        message_id: 146,
        from: {
          id: 218760256,
          is_bot: false,
          first_name: 'Sebastian',
          username: 'sebastian987',
          language_code: 'en'
        },
        chat: {
          id: 218760256,
          first_name: 'Sebastian',
          username: 'sebastian987',
          type: 'private'
        },
        date: 1604221403,
        reply_to_message: {
          message_id: 145,
          from: [Object],
          chat: [Object],
          date: 1604221367,
          text: 'What should I categorise seafood, $3.5 as?'
        },
        text: 'food'
      }
    }

    await verifyHTTPresponse(body)
    const records = await db.getRecords({conditions: "message_id=146"})
    test.number(records.length).isGreaterThan(0)

  })
  it('Handle get spending by category ', async function() {

    const body =  {
      update_id: 74392486,
      message: {
        message_id: 61,
        from: {
          id: 218760256,
          is_bot: false,
          first_name: 'Sebastian',
          username: 'sebastian987',
          language_code: 'en'
        },
        chat: {
          id: 218760256,
          first_name: 'Sebastian',
          username: 'sebastian987',
          type: 'private'
        },
        date: 1604201477,
        text: '/spendingbycategory food,transport'
      }
    }

    await verifyHTTPresponse(body)
  });

  it('Handle get past transactions ', async function() {

    const body =  {
      update_id: 74392486,
      message: {
        message_id: 61,
        from: {
          id: 218760256,
          is_bot: false,
          first_name: 'Sebastian',
          username: 'sebastian987',
          language_code: 'en'
        },
        chat: {
          id: 218760256,
          first_name: 'Sebastian',
          username: 'sebastian987',
          type: 'private'
        },
        date: 1604201477,
        text: '/pasttransactions'
      }
    }

    await verifyHTTPresponse(body)
  });
});
