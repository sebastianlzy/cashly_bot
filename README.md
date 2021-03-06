## Introduction

To build a finance tracker using telegram bot

## Setup 

Create a chatbot in telegram
```
Follow instructions in: https://core.telegram.org/bots#6-botfather
```

Create Codestar Resources
```
Visit https://console.aws.amazon.com/codesuite/codestar/home and create a pipeline for cashly-bot
```

Create CodeDeployRole
```
export ACCOUNT_ID=<AccountId>
aws iam create-role --role-name CodeDeployForCashlyBot --assume-role-policy-document "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":{\"Service\":[\"codedeploy.amazonaws.com\"]},\"Action\":\"sts:AssumeRole\",\"Condition\":{}}]}"
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/service-role/AWSCodeDeployRoleForLambda --role-name CodeDeployForCashlyBot
```

Create Secret 
```
export TELEGRAM_TOKEN=<TELEGRAM_TOKEN>
aws secretsmanager create-secret --name TelegramToken --secret-string $TELEGRAM_TOKEN
aws secretsmanager create-secret --name RdsCluster --secret-string '{"host":"<host>", "port":"3306", "username":"<username>", "password":"<password>","database":"cashly_db"}'
```

Deploy application using SAM
```
> sam package --resolve-s3
> sam deploy --guided --capabilities CAPABILITY_NAMED_IAM
Setting default arguments for 'sam deploy'
	=========================================
	Stack Name [cashly-bot]: cashly-bot
	AWS Region [ap-southeast-1]: ap-southeast-1
	Parameter ProjectId []:
	Parameter CodeDeployRole [CodeDeployForCashlyBot]: arn:aws:iam::<accountID>:role/CodeDeployForCashlyBot
	Parameter Stage []:
	Parameter DBUsername: <Type in a username>
	Parameter DBPassword: <Type in a password>
	#Shows you resources changes to be deployed and require a 'Y' to initiate deploy
	Confirm changes before deploy [Y/n]: y
	#SAM needs permission to be able to create roles to connect to the resources in your template
	Allow SAM CLI IAM role creation [Y/n]: y
	CashlyBotLambdaWithApiGateway may not have authorization defined, Is this okay? [y/N]: y
	Save arguments to configuration file [Y/n]: y
	SAM configuration file [samconfig.toml]:
	SAM configuration environment [default]:


> Deploy this changeset? [y/N]: y

export API_GATEWAY_URL=<API_GATEWAY_URL>

```

Create cashly_db
```
# Go to query editor: https://ap-southeast-1.console.aws.amazon.com/rds/home?region=ap-southeast-1#query-editor:
# Create cashly db
> Create database cashly_db

# Create record table
> CREATE TABLE IF NOT EXISTS records (
                                      id INT AUTO_INCREMENT PRIMARY KEY,
                                      user_id VARCHAR(255),
                                      message_id VARCHAR(255),
                                      chat_id VARCHAR(255),
                                      name VARCHAR(255), 
                                      amount VARCHAR(255), 
                                      category VARCHAR(255),
                                      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                                      updated_at TIMESTAMP NOT NULL DEFAULT NOW() ON UPDATE now()
                              )

# Insert a records
> INSERT INTO records (id, user_id, message_id, chat_id, name, amount, category) VALUES ("1", "1", "1", "1", "sebastian", "1", "Food")
```

Add RDS permission to CodeStarWorker
```
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonRDSDataFullAccess --role-name CodeStarWorker-cashly-bot-ToolChain
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite --role-name CodeStarWorker-cashly-bot-ToolChain
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite --role-name CodeStar-cashly-bot-ExecutionStaging
```

Add Code deploy permission to CodeStarWorker
```
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSCodeDeployFullAccess --role-name CodeStarWorker-cashly-bot-CloudFormation
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/IAMFullAccess --role-name CodeStarWorker-cashly-bot-CloudFormation
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AmazonRDSFullAccess --role-name CodeStarWorker-cashly-bot-CloudFormation
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/SecretsManagerReadWrite --role-name CodeStarWorker-cashly-bot-CloudFormation
aws iam attach-role-policy --policy-arn arn:aws:iam::aws:policy/AWSLambda_FullAccess --role-name CodeStarWorker-cashly-bot-CloudFormation
```

Update pipeline to update/create cashly-bot stack
```
# Go to https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/cashly-bot-Pipeline/view?region=ap-southeast-1
> https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/cashly-bot-Pipeline/view?region=ap-southeast-1 > edit > Edit:Deploy > Edit Stage > GenerateChangeSet > edit
> Update stackname to `cashly-bot`

> https://ap-southeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/cashly-bot-Pipeline/view?region=ap-southeast-1 > edit > Edit:Deploy > Edit Stage > ExecuteChangeSet > edit
> Update stackname to `cashly-bot`
```

Configure webhook for telegram
```
npm run setup:webhook
```

## Usage

To retrieve last log stream
```
npm run logs 
```

To start local api
```
npm run start:local-api
```

To get pipeline status
```
npm run pipeline:status
```

To setup webhook with telegram
```
npm run setup:webhook
```

## Test

`npm run test`

## Screenshots

### High level diagram
![Screenshot](./readme-assets/high-level-diagram.png)

### Telegram bot
![Screenshot](./readme-assets/demo-cashly-bot.gif)

### Parents' Dashboard
![Screenshot](./readme-assets/quicksight-dashboard.png)

## Future improvement

1. Modify to use secret manager for telegram token 
2. Cloudformation template for all setup
3. Cloudformation template for dashboard setup
4. Edit and modify past transactions
5. Integration with Alexa

 