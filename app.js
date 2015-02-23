var express = require('express'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    morgan = require('morgan'),
    errorhandler = require('errorhandler'),

    routes = require('./routes'),
    config = require('./lib/config'),
    secret = require('./lib/secret').secrets,
    passport = require('./lib/access'),
    mongoose = require('./lib/db'),
    logger = require('./lib/logger'),
    MongoStore = require('connect-mongo')(session),
    path = require('path');

var app = express();

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

app.use(express.static(path.join(__dirname, 'public')));

require('./dbContent');

app.all('*', routes.setResHeaders);

// GET /auth/foursquare
app.get('/auth/foursquare', passport.authenticate('foursquare'), routes.login);

// GET /auth/foursquare/callback
app.get('/callback', passport.authenticate('foursquare', { failureRedirect: '/login' }), routes.callback);


app.get('/logout', routes.logout);

//--------------- маршруты -------------
app.get('/routes', routes.routes);
app.post('/route', routes.add);
app.get('/route/:routeId', routes.route);

app.get('/detail/:routeId', routes.detail);

// эта часть  api не работает, тк надо по другому писать схемы и переписывать запросы
//app.get('/route/filter', routes.routeFilter);
//app.get('/venue/filter', routes.venueFilter);
//app.get('/drink/filter', routes.drinkFilter);

//--------------- чекины ---------------
app.all('*', passport.ensureAuthenticated);
app.get('/checkin/:venueId', routes.checkin);

//TODO error!
// В конце - обработчик ошибок
if (app.get('env') == 'development') {
    function errorHandler(err, req, res, next) {
        res.send(err.status, err.message);
    }
    app.use(errorHandler);
}

app.listen(config.app.port, function() {
    logger.trace("Express server listening on port " + config.app.port);
});

