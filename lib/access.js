var passport = require('passport'),
    FoursquareStrategy = require('passport-foursquare').Strategy,
    User = require('./../models/user'),
    secret = require('./secret').secrets;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.  However, since this example does not
//   have a database of user records, the complete Foursquare profile is
//   serialized and deserialized.
passport.serializeUser(function(user, done) {
    done(null, user);
});

//пока данных мало будем все данные хранить в session
// если данных много. то в save передаем только id, а здесь ходим в DB
passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

// Use the FoursquareStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Foursquare
//   profile), and invoke a callback with a user object.
passport.use(new FoursquareStrategy({
    clientID: secret.clientId,
    clientSecret: secret.clientSecret,
    callbackURL: secret.redirectUrl
}, function(accessToken, refreshToken, profile, done) {
    var user = new User({
        id: profile.id,
        code: accessToken
    });

    user.save(function(err) {
        return done(null, user);
    });

}));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
passport.ensureAuthenticated = function(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/auth/foursquare');
    }
};

module.exports = passport;
