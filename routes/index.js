require('./api')(exports);
require('./route')(exports);

var logger = require('../lib/logger');

exports.setResHeaders = function(req, res, next){
    res.header('Access-Control-Allow-Origin', 'http://localhost:63342'); //for CORS
    res.header('Access-Control-Allow-Credentials', 'true'); //for cookies
//        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE'); // for preflight request
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

    //https://www.owasp.org/index.php/List_of_useful_HTTP_headers
    res.header("X-Frame-Options", "deny");
    res.header("X-XSS-Protection", "1; mode=block");

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};

exports.redirect = function(req, res){
    logger.warn('redirect');
    // The request will be redirected to Foursquare for authentication, so this
    // function will not be called.
};

exports.callback = function(req, res){
    if (req.user) {
        res.redirect('/');
    }
};

exports.login = function(req, res) {
    logger.info('login');
    if(!req.user) {
        logger.error('login error');
        next(new error.HttpError(500, 'login error'));
    }
};

exports.logout = function(req, res){
//    req.session.destroy();
    req.logout();
    res.send({logout: 'done'});
};
