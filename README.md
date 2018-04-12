# Crawler-Facebook-Profile

## Getting Started

### Environment

NodeJS version: v6.13.0

npm vsrsion: 3.10.10

### Installation

```bash
git clone https://github.com/ghostLWJ/Crawler-Facebook-Profile.git
cd Crawler-Facebook-Profile/
npm install
```

Note: If you are using docker, when npm install please remember add --no-bin-links.

```bash
npm install --no-bin-links
```

Please edit config.js

```javascript
module.exports = {
  fb: {
    account: '<YOUR FB ACCOUNT>',
    password: '<YOUR FB PASSWORD>'
  },
  mysql: {
    database: '<YOUR DB DATABASE>',
    username: '<YOUR DB USER NAME>',
    password: '<YOUR DB PASSWORD>',
    host: '<YOUR DB HOST>'
  }
};
```

### Usage

Follow example file test.js

```javascript
const { wrap: async } = require ('co');

const fbApis = require ('./index');
const { add } = require ('./fb-user');
const sequelize = require ('./db');

fbApis.createService ().then ( async (function* () {
  const profiles = yield fbApis.searchPeople ('<YOU WANT TO SEARCH NAME>', <NUMBER FOR YOU WANT TO SEARCH COUNT>);
  for (let profile of profiles) { add(profile); }

  const target = {
    first: 'FB user id',
    second: 'FB user id'
  }

  const profiles = yield fbApis.searchMutualFriends (target);

  fbApis.closeService ();
  sequelize.close ();
}));
```

Also you can use puppeteer headless to debug.

Edit index.js line 8 to false

**Start Server**

```bash
node server.js
```

**API**

You can use POSTMAN, curl, or others to test.

**search mutual friends**

POST to http://127.0.0.1:3000

POST example

```javascript
{
  "ids": {
    "first": "<FB user id>",
    "second": "<FB user id>"
  }
}
```

Response example

```javascript
[
  {
    "id": "FB mutual friend id",
    "name": "FB mutual friend name"
  },
  {
    "id": "FB mutual friend id",
    "name": "FB mutual friend name"
  }
]

// If not found
[]
```
