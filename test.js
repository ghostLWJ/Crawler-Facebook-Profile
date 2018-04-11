const fbApis = require ('./index');
const { wrap: async } = require ('co');

fbApis.createService ().then ( async (function* () {
  const profiles = yield fbApis.searchPeople ('jack', 10);
}));
