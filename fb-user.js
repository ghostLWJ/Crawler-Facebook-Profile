const Sequelize = require('sequelize');

const FBUser = require ('./model/fb-user');

const add = function (user) {
  FBUser.findOrCreate ({
    defaults: user,
    where: { id: user.id }
  });
};

module.exports = {
  add
}
