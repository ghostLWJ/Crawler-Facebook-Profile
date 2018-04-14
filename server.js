const express = require('express');
const bodyParser = require('body-parser');
const _ = require ('lodash');
const { wrap: async } = require ('co');

const PORT = process.env.PORT || 3000;
const fbApis = require ('./index');
const sequelize = require ('./db');

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(PORT, function () {
    console.log(`App listening on port ${PORT}!`)
});

app.post('/', async (function* (req, res) {
	// console.log (JSON.stringify (req.body, null, 2));
	const ids = req.body.ids || {};
  const first = _.get(ids, 'first');
  const second = _.get(ids, 'second');

  let mutualFriends = [];

  if (!_.isString (first) && !_.isString (second)) {
    return res.json (mutualFriends);
  }

  const target = { first, second }

  yield fbApis.createService ()
  mutualFriends = yield fbApis.searchMutualFriends (target);

  res.json (mutualFriends);
  // fbApis.closeService ();
}));
