var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  defaults: {
    username: "",
    password: "",
    salt: "$2a$10$.KPZ1X4FboZjrhjEHQTTrO"
  },

  links: function() {
    return this.hasMany(Link);
  },

  initialize: function() {

    this.on('creating', function(model, attrs, options) {
  
      var hashing = Promise.promisify(bcrypt.hash);

      return hashing(this.get('password'), this.get('salt'), null)
        .bind(this)
        .then(function(hash) {
          model.set('password', hash);
        })
    });
  },

  createSalt: function() {
    this.set('salt', bcrypt.genSaltSync());
    return this.get('salt');
  }
});

module.exports = User;