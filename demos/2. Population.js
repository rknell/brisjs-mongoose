var Widgets = require('../Models/Widgets');
var Users = require('../Models/Users');

/**
 * This looks complicated but it really isn't, its just creating 5 widgets and pushing them to an array attached to the
 * user object.
 */
function createWidgetsAndAddToUser(userId) {
  var actions = [];

  actions.push(Users.findOne({_id: userId}).exec());

  //Create 5 widgets
  for (var i = 0; i < 5; i++) {
    var newWidget = new Widgets({
      name: "Widget " + i,
      price: Number((1 + 5 * .2).toFixed(2))
    });

    actions.push(newWidget.save());
  }

  return Promise.all(actions)
    .then(results => {
      var user = results[0];

      for (var i = 1; i < results.length; i++) {
        user.widgets.push(results[i]);
      }
      
      return user.save();
    })
}

function returnPopulatedUser(userId) {
  return Users.findOne({_id: userId})
    .populate('widgets')
    .exec()
}

function returnPopulatedUserWSelect(userId) {
  return Users.findOne({_id: userId})
    .populate('widgets', '-name')
    .exec()
}

module.exports = {
  createWidgetsAndAddToUser: createWidgetsAndAddToUser,
  returnPopulatedUser: returnPopulatedUser,
  returnPopulatedUserWithSelect: returnPopulatedUserWSelect
};