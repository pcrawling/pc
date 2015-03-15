var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    morgan = require('morgan'),

    routes = require('./routes'),
    config = require('./lib/config'),
    secret = require('./lib/secret').secrets,
    passport = require('./lib/access'),
    mongoose = require('./lib/db'),
    logger = require('./lib/logger'),
    path = require('path'),
    MongoStore = require('connect-mongo')(session);

var app = express();

app.set('views', path.join(__dirname, 'tmpl'));
app.set('view engine', 'jade');

app.use(morgan('dev'));
app.use(cookieParser());

app.use(bodyParser.json());

app.use(session({
    secret: secret.session,
    cookie: config.session.cookie,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

require('./dbContent');

app.use(routes.setResHeaders);

app.get('/auth/foursquare', passport.authenticate('foursquare'), routes.login);
app.get('/callback', passport.authenticate('foursquare', { successRedirect: '/', failureRedirect: '/login' }));
app.get('/logout', routes.logout);

//--------------- маршруты -------------

app.route('/api/v1/routes')
    .get(routes.routes)
    .post(routes.add);

app.get('/api/v1/route/:routeId', routes.route);
app.get('/api/v1/detail/:routeId', routes.detail);
app.get('/api/v1/venue/:venueId', routes.getVenue);

//--------------- чекины ---------------
app.use(passport.ensureAuthenticated);
app.get('/api/v1/checkin/:venueId', routes.checkin);

app.get('*', function(req, res) {
    res.render('index', { auth: !!req.user });
});

app.listen(config.app.port, function() {
    logger.trace("Express server listening on port " + config.app.port);
});

