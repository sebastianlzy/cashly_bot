## Introduction

To build a finance tracker using telegram bot

## Setup 

Add environment variable
```sh
export API_GATEWAY_URL=<API_GATEWAY_URL>
export TELEGRAM_TOKEN=<TELEGRAM_TOKEN>
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

## Future improvement

1. 1 stop cloudformation template for all setup
2. Edit and modify past transactions
3. Integration with Alexa

 