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
      bcrypt.genSalt(10, function(err, salt) {
        if(err) {
          console.log('error while generating salt: ' + err);
        }
        bcrypt.hash(this.password, salt, null, function(err, hash) {
          if(err) {
            console.log('error while hashing the password: ' + err);
          }
          model.set('code', hash);
        });
      })
    });
  }
  // login: function() {

  // },
  // signup: function() {

  // }
 
});

module.exports = User;