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

const upsert = async (function* (userId, friends) {
  const fbFriend = yield FBFriend.findOne ({
    where: { id: userId }
  });

  if (fbFriend) { fbFriend.update ({friends}) }
  else {
    FBFriend.create ({
      id: userId,
      friends
    });
  }
});

const findOne = async (function* (id) {
  let fbFriend;
  try {
    fbFriend = yield FBFriend.findOne({
      where: { id }
    });
  } catch (e) {
    console.log (`fb-friend findOne Error: ${e}`);
    return null;
  }
  if (fbFriend) {
    const { _id, friends } = fbFriend.dataValues;
    return { _id, friends };
  }
  return null;
});

module.exports = {
  add,
  upsert,
  findOne
}
