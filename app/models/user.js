var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  tableName: 'users',
  defaults: {
    username: "",
    password: ""
  },

  links: function() {
    return this.hasMany(Link);
  },

  initialize: function() {

    var salt = bcrypt.genSaltSync();
    this.on('creating', function(model, attrs, options) {
  
      var hashing = Promise.promisify(bcrypt.hash);

      return hashing(this.get('password'), salt, null)
        .bind(this)
        .then(function(hash) {
          model.set('password', hash);
        })
    });
  }
});

module.exports = User;