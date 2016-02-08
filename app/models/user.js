var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');

var User = db.Model.extend({
  defaults: {
    username: "",
    password: ""
  },

  links: function() {
    return this.hasMany(Link);
  },

  initialize: function() {
    this.on('creating', function(model, attrs, options) {
      bcrypt.hash(this.password, 'saltpepper', null, function(err, hash) {
        if(err) {
          console.log('error while hasing the password: ' + err);
        }
        model.set('code', hash);
      });
    });
  }
  // login: function() {

  // },
  // signup: function() {

  // }
 
});

module.exports = User;