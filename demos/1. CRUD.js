var Users = require('../Models/Users');
var _ = require('lodash');

//Basic CRUD operations are easy.
function createUser(data) {
  var newUser = new Users(data);
  return newUser
    .save();
}

function updateUser(data) {
  return Users.findOne({_id: data._id})
    .exec()
    .then(doc => {
      _.merge(doc, data);
      return doc.save();
    });
}

function findUser(query, select, limit, skip) {
  return Users.find(query)
    .select(select)
    .limit(limit)
    .skip(skip)
    .exec();
}

function removeUser(query) {
  return Users.remove(query)
    .exec();
}

module.exports = {
  createUser: createUser,
  updateUser: updateUser,
  findUser: findUser,
  removeUser: removeUser
}