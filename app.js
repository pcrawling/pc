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

app.get('/', function(req, res, next) {
    res.render('index', { title: 'Hey', message: 'Hello there!'});
});


app.get('/auth/foursquare', passport.authenticate('foursquare'), routes.login);
app.get('/callback', passport.authenticate('foursquare', { failureRedirect: '/login' }), routes.callback);
app.get('/logout', routes.logout);

app.use(passport.ensureAuthenticated);

//--------------- маршруты -------------
app.route('/route')
    .get(routes.routes)
    .post(routes.add);

app.get('/route/:routeId', routes.route);
app.get('/detail/:routeId', routes.detail);

//--------------- чекины ---------------
app.get('/checkin/:venueId', routes.checkin);

app.listen(config.app.port, function() {
    logger.trace("Express server listening on port " + config.app.port);
});

