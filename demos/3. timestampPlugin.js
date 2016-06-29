/**
 * Taken from https://github.com/james075/mongoose-createdat-updatedat
 * There are heaps of these exact same plugins around the place, just chose this one
 * because it came up first on google.
 */

module.exports = (schema) => {
  schema.add({
    createdAt: Date,
    updatedAt: Date
  });

  schema.pre('save', function (next) {
    var currentDate = new Date();
    this.updatedAt = currentDate;

    if (!this.createdAt) {
      this.createdAt = currentDate;
    }
    next();
  });
};