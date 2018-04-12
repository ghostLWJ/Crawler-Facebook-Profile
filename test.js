const { wrap: async } = require ('co');

const fbApis = require ('./index');
const { add } = require ('./fb-user');
const sequelize = require ('./db');

fbApis.createService ().then ( async (function* () {
  const profiles = yield fbApis.searchPeople ('jack', 1);
  for (let profile of profiles) { add(profile); }

  /*
  const target = {
    first: '',
    second: ''
  }

  const profiles = yield fbApis.searchMutualFriends (target);
  */

  fbApis.closeService ();
  sequelize.close ();
}));
