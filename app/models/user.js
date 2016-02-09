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
    this.on('creating', function(model, attrs, options) {
  
      var hashing = Promise.promisify(bcrypt.hash);

      return hashing(this.get('password'), null, null)
        .bind(this)
        .then(function(hash) {
          console.log('hash: ' + hash);
          this.set('password', hash);
        })
    });
  },

  salting: function() {
    var salt = bcrypt.genSaltSync();
    this.set('salt', salt); 
  }
});

module.exports = User;