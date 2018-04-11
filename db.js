const Sequelize = require('sequelize');

const { mysql: _mysql }  = require ('./config');
const dialect = 'mysql';

const sequelize = new Sequelize(_mysql.database, _mysql.username, _mysql.password, {
  host: _mysql.host,
  dialect,
  operatorsAliases: false,

  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

module.exports = sequelize;
