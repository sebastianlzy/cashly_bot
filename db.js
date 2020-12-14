const mysql = require('mysql');
const AWS = require('aws-sdk')
const get = require('lodash/get')

const myConfig = new AWS.Config({region: 'ap-southeast-1'});
AWS.config = myConfig

const secretsmanager = new AWS.SecretsManager();


const params = {
    SecretId: "rds-db-credentials/cluster-YVNPYBSET57YMFS2FTGOQ2OPZU/admin",
    VersionStage: "AWSCURRENT"
};

const getDBConnectionParams = async () => {

    return new Promise((resolve, reject) => {
        secretsmanager.getSecretValue(params, function (err, data) {
            if (err) reject(err);

            // const secret = JSON.parse(data.SecretString)
            resolve({
                host: "cashly-bot-rds-aurora-mysql-cluster.cluster-cahyycnr185u.ap-southeast-1.rds.amazonaws.com",
                user: "admin",
                password: "password",
                database: "cashly_db",
            })
        });
    })

}


let connection = undefined

const getConnection = async () => {
    if (connection === undefined) {

        const dbConnectionParams = await getDBConnectionParams()
        connection = mysql.createPool({connectionLimit : 5, ...dbConnectionParams});
        return connection
    }

    return connection
}


const executeSqlStatement = async (sql) => {
    return getConnection().then((connection) => {
        return new Promise((resolve, reject) => {
            connection.query(sql, function (error, results) {
                if (error) {
                    reject(error)
                }
                resolve(results)
            });
        })
    }).catch((err) => {
        console.log("--------------------db.js--67-err----------------------------")
        console.log(err)
        console.log("--------------------db.js--67-err---------------------------")
    })
};

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
        return await executeSqlStatement(sqlStatement)
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

        console.log(sqlStatement)
        return await executeSqlStatement(sqlStatement)
    },
    updateRecord: async (userId, messageId, key, value) => {

    },
    deleteRecord: async (conditions) => {
        if (conditions) {
            let sqlStatement = `DELETE from records WHERE ${conditions}`
            return await executeSqlStatement(sqlStatement)
        }
    },
    createRecord: async (userId, chatId, messageId, name, amount, category) => {
        const sqlStatement = `INSERT INTO records (user_id, chat_id, message_id, name, amount, category) 
                            VALUES ("${userId}", "${chatId}", "${messageId}", "${name}", "${amount}", "${category}")`
        return await executeSqlStatement(sqlStatement)
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
        return await executeSqlStatement(sqlStatement)
    },
    closeConnection: async () => {
        await connection.end()
    }
}