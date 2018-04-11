const { wrap: async } = require ('co');

const fbApis = require ('./index');
const { add } = require ('./fb-user');

fbApis.createService ().then ( async (function* () {
  const profiles = yield fbApis.searchPeople ('jack', 10);
}));
