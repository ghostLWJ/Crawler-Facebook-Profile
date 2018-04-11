const Sequelize = require('sequelize');

const sequelize = require ('../db');

const FBUser = sequelize.define ('fb_user', {
  id: {
      type: Sequelize.STRING,
      primaryKey: true
    },
  name: {
      type: Sequelize.STRING
    }
});

module.exports = FBUser;
