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

And

```bash
node test.js
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

Note: If browser popup permission hint, please cancel it, or when crawler scroll down will stuck.

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

# Crawler-Facebook-Profile

## 開始

### 環境

NodeJS 版本: v6.13.0

npm 版本: 3.10.10

### 安裝

```bash
git clone https://github.com/ghostLWJ/Crawler-Facebook-Profile.git
cd Crawler-Facebook-Profile/
npm install
```

注意：如果是使用 Docker，npm install 時請加上 --no-bin-links.

```bash
npm install --no-bin-links
```

請編輯 Config.js 檔案

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

### 使用方法

請照著 test.js 檔案

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

你也可以使用 puppeteer headless 的模式來進行除錯。

注意：如果你的瀏覽器彈出要求權限提示，請將它取消，否則滑動置頁面底部功能將會卡住。

編輯 index.js 第八行，將它改為 false

**啟動伺服器**

```bash
node server.js
```

**API**

你可以使用 Postman, curl 或其他工具來進行測試 API

**搜尋共同好友**

POST 到 http://127.0.0.1:3000

POST 格式

```javascript
{
  "ids": {
    "first": "<FB user id>",
    "second": "<FB user id>"
  }
}
```

回應格式

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
