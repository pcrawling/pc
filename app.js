var express = require('express')
    , routes = require('./routes')
    , config = require('./lib/config')
    , secret = require('./lib/secret')
    , passport = require('./lib/access')
    , mongoose = require('./lib/db')
    , logger = require('./lib/logger')
    , MongoStore = require('connect-mongo')(express)
    , http = require('http')
    , path = require('path');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.methodOverride());

app.use(express.session({
    secret: secret.session,
    cookie: config.session.cookie,
    store: new MongoStore({mongoose_connection: mongoose.connection})
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(app.router);
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



// В конце - обработчик ошибок
if (app.get('env') == 'development') {

    function errorHandler(err, req, res, next) {
        res.send(err.status, err.message);
    }

    app.use(errorHandler);
}

http.createServer(app).listen(config.app.port, function() {
    logger.trace("Express server listening on port " + config.app.port);
});

