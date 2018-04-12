const Sequelize = require('sequelize');

const sequelize = require ('../db');

const FBFriend = sequelize.define ('fb_friend', {
  id: {
    type: Sequelize.STRING,
    primaryKey: true
  },
  friends: {
    type: Sequelize.TEXT
  }
});

sequelize.sync();

module.exports = FBFriend;
