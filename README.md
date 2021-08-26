Go Lang Developer Test (JS)
===

A "go lang developer test" implemented in typescript using nestjs. 

## Installation

```bash
$ yarn
```

## Running the app

Before running the application it's important to configure mysql connection 
configuration. It can be done by setting **environment variables**.
```dotenv
CACHE_DB_USERNAME=root
CACHE_DB_PASSWORD=password
CACHE_DB_HOST=localhost
CACHE_DB_DATABASE=cryptocache
# API Response caching TTL in seconds
CACHE_TTL=170
```

After you're done configuring the app, execute one of the following commands:

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev

# production mode
$ yarn start:prod
```

When the app is up and running, there will be both REST API (Get) and WS endpoints
available at `/service/price`. By default the application uses port **3000**.

## Test

```bash
# unit tests
$ yarn test
```
