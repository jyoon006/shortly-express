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
    console.log(this.password);
    this.on('creating', function(model, attrs, options) {
      var salt = bcrypt.genSaltSync();   
      var hash =  bcrypt.hashSync(model.get('password'), salt); 
      model.set('password', hash);
      console.log('finished hashing password');
    });
  }
});

module.exports = User;