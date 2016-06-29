var mongoose = require('mongoose');
var timestamp = require('../demos/3. timestampPlugin');
var fs = require('fs');
var async = require('async');
var bcrypt = require('bcrypt');

var model = {
  firstName: String,
  lastName: String,
  fullName: String, // This will be populated by our pre-insertion hook
  username: String,
  password: {type: String, select: false},
  savedPhotos: [
    {filename: {type: String, required: true}}
  ],
  photoData: [{ // This is where we will store imported data temporarily
    data: String,
    extension: String
  }],
  emailOnSave: {type: Boolean, default: true},
  widgets: [{type: mongoose.Schema.ObjectId, ref: 'Widgets'}]
};

var schema = new mongoose.Schema(model);

schema.plugin(timestamp);

/**
 * A word of warning here -
 * Pre hooks don't work properly when using the mongoose update method (loading a document and saving does work!)
 * If you are tearing out your hair, check this.
 */
schema.pre('save', function transformName(next) {
  //Transform name into the full name field
  this.fullName = this.firstName + " " + this.lastName;
  next();
});

schema.pre('save', function emailOnSave(next) {
  //Send an email to someone every time a record is updated
  //NB: You can make this one really complicated with a bunch of validation or checking
  if (this.emailOnSave) {
    console.log("Email would have sent");
  }
  next();
});

schema.pre('save', function processAndSavePhotos(next) {
  //You don't always (read often) want photos in your database for a number of reasons
  //But you will often get sent base64 code down from a cordova app etc and need to handle them.
  //I also don't like doing this in two transactions ie. send photos first then upload document unless its
  //via the web - the number of "offline / patchy reception requirements" in jobs is very high.
  var _this = this;
  async.each(_this.photoData, (item, cb) => {

    var buffer = new Buffer(item.data, 'base64');
    var index = _this.photoData.indexOf(item);
    var filename = 'image' + index + '.' + item.extension;

    fs.writeFile(filename, buffer, err => {
      if (!err) {
        _this.savedPhotos.push({filename: filename});
        _this.photoData[index] = undefined; //Clear out the photo data so as not to save it in the db
      }
      cb(err);
    })

  }, err => {
    if (!err) {
      _this.photoData = [];
    }
    next(err);
  })

});

schema.pre('save', function updatePassword(next) {
  var _this = this;
  if (this.password) {
    bcrypt.hash(this.password,8, (err, hash)=> {
      _this.password = hash;
      next(err);
    })
  } else {
    next();
  }
});

module.exports = mongoose.model('User', schema);