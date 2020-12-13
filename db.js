const mysql = require('mysql');
const AWS = require('aws-sdk')
const isEmpty = require('lodash/isEmpty')

const myConfig = new AWS.Config({region: 'ap-southeast-1'});
AWS.config = myConfig

const rdsDataService = new AWS.RDSDataService()

const createSqlParams = (sql) => {
    return {
        secretArn: process.env.RDS_SECRET_ARN,
        resourceArn: process.env.RDS_RESOURCE_ARN,
        sql: sql,
        database: 'cashly_db',
        includeResultMetadata: true
    }
}

const mapDataToArray = (data) => {
    if (isEmpty(data) || isEmpty(data.columnMetadata) || isEmpty(data.records)) {
        return
    }

    // init
    const rows = []
    const cols = []

    // build an array of columns
    data.columnMetadata.map((v, i) => {
        cols.push(v.name)
    });

    // build an array of rows: { key=>value }
    data.records.map((r) => {
        const row = {}
        r.map((v, i) => {
            if (v.stringValue !== "undefined") {
                row[cols[i]] = v.stringValue;
            } else if (v.blobValue !== "undefined") {
                row[cols[i]] = v.blobValue;
            } else if (v.doubleValue !== "undefined") {
                row[cols[i]] = v.doubleValue;
            } else if (v.longValue !== "undefined") {
                row[cols[i]] = v.longValue;
            } else if (v.booleanValue !== "undefined") {
                row[cols[i]] = v.booleanValue;
            } else if (v.isNull) {
                row[cols[i]] = null;
            }
        })
        rows.push(row)
    })

    return rows
}

const executeSqlStatement = (sqlParams) => {
    return new Promise((resolve, reject) => {
        console.log(sqlParams)
        return rdsDataService.executeStatement(sqlParams, function (err, data) {
            if (err) {
                // error
                console.log(err)
                reject('Query Failed')
            } else {
                const rows = mapDataToArray(data)
                resolve(rows)
            }
        })
    })

}


//CREATE TABLE

module.exports = {
    createUserTable: async () => {
        const sqlStatement = `CREATE TABLE IF NOT EXISTS users (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    user_id VARCHAR(255),
                                    name VARCHAR(255), 
                                    allowance VARCHAR(255), 
                                    age VARCHAR(255),
                                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE now()
                            )`
        return await executeSqlStatement(createSqlParams(sqlStatement))
    },
    createRecordTable: async () => {
        const sqlStatement = `CREATE TABLE IF NOT EXISTS records (
                                    id INT AUTO_INCREMENT PRIMARY KEY,
                                    user_id VARCHAR(255),
                                    message_id VARCHAR(255),
                                    chat_id VARCHAR(255),
                                    name VARCHAR(255), 
                                    amount VARCHAR(255), 
                                    category VARCHAR(255),
                                    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                    updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE now()
                            )`
        return await executeSqlStatement(createSqlParams(sqlStatement))
    },
    updateRecord: async (userId, messageId, key, value) => {

    },
    deleteRecord: async (conditions) => {
        if (conditions) {
            let sqlStatement = `DELETE from records WHERE ${conditions}`
            return await executeSqlStatement(createSqlParams(sqlStatement))
        }
    },
    createRecord: async (userId, chatId, messageId, name, amount, category) => {
        const sqlStatement = `INSERT INTO records (user_id, chat_id, message_id, name, amount, category) 
                                VALUES ("${userId}", "${chatId}", "${messageId}", "${name}", "${amount}", "${category}")`
        return await executeSqlStatement(createSqlParams(sqlStatement))
    },
    getRecords: async ({conditions, limit, orderBy}) => {
        let sqlStatement = 'SELECT * from records'
        if (conditions) {
            sqlStatement = `${sqlStatement} WHERE ${conditions}`
        }

        if (orderBy) {
            sqlStatement = `${sqlStatement} ORDER BY ${orderBy}`
        }

        if (limit) {
            sqlStatement = `${sqlStatement} LIMIT ${limit}`
        }
        return await executeSqlStatement(createSqlParams(sqlStatement))
    }
}