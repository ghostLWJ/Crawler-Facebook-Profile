const Sequelize = require('sequelize');

const FBFriend = require ('./model/fb-friend');
const { wrap: async } = require ('co');

const add = function (userId, friends) {
  FBFriend.findOrCreate ({
    defaults: {
      id: userId,
      friends
    },
    where: { id: userId }
  });
};

const findOne = async (function* (id) {
  const fbFriend = yield FBFriend.findOne({
    where: { id }
  });
  console.log (fbFriend);
});

module.exports = {
  add,
  findOne
}
