const Sequelize = require('sequelize');
const { wrap: async } = require ('co');

const { mysql: _mysql }  = require ('./config.js');
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

sequelize
  .authenticate()
    .then(() => {
      console.log('Connection has been established successfully.');
      })
    .catch(err => {
      console.error('Unable to connect to the database:', err);
    });
