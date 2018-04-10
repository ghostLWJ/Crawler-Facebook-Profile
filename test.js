const fbApis = require ('./index');

fbApis.createService ().then ( function () {
  fbApis.searchPeople ('jack');
})
