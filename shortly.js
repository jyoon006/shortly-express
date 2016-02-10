var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');

var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var passport = require('passport');
var Strategy = require('passport-facebook').Strategy;
var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(session({secret: 'secret'}));

//*************OAUTH**************************//

passport.use(new Strategy({
  clientID: '',
  clientSecret: '',
  callbackURL:'http://localhost:4568/login/facebook/return'
},
  function(accessToken, refreshToken, profile, cb) {


    return cb(null, profile);
    
  }
));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});
passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(passport.initialize());
app.use(passport.session());

app.get('/login/facebook', passport.authenticate('facebook'));

app.get('/login/facebook/return', passport.authenticate('facebook', {failureRedirect: '/login'}),
  function(req, res) {
    res.redirect('/');
  }
);

//*************OAUTH**************************//

app.get('/', 
function(req, res) {
  res.render('index');
});

app.get('/create', 
function(req, res) {
  //util.checkUser(req, res);
  res.render('index');
});

app.get('/links', 
function(req, res) {
  if (!req.session.username) {
    res.redirect('/login');
  }
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.get('/login', function(req, res) {
  res.render('login');  
});

app.post('/login', function(req, res) {
  var pw = req.body['password'];
  var user = req.body['username'];

  new User({username: user}).fetch().then(function(found) {
    if(found) {
      var hashed = util.checkPassword(pw, found.attributes.password);
      if(hashed) {
        req.session.username = user;
        res.redirect('/');
      }
      else {
        res.redirect('/login');
      }
    }
    res.redirect('/login');
    
  });

});

app.get('/logout', function(req, res) {
  req.session.username = null;
  res.redirect('/login');
});

app.get('/signup', function(req, res) {
  res.render('signup');  
});

// app.get('/users', 
// function(req, res) {
//   Users.reset().fetch().then(function(users) {
//     res.send(200, users.models);
//   });
// });

app.post('/signup', function(req, res) {
  var pw = req.body['password'];
  var user = req.body['username'];
  
  var user = new User({
    username: user,
    password: pw
  });

  user.save().then(function(newUser) {
    Users.add(newUser);
    res.redirect('/');
  });
});
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
