var logger = require('../lib/logger'),
    error = require('../lib/error'),
    secret = require('../lib/secret'),
    Foursquare = require('node-foursquare')(secret),
    checkinApi = Foursquare.Checkins;

module.exports = function(routes) {
    routes.checkin = function(req, res, next){
        var accessToken = req.user.code,
            venueID = req.params.venueId;

        if(!accessToken){
            logger.error('checkin with not valid token: %s', accessToken);
            next(new error.HttpError(403, 'token is not valid'));
        }

        logger.info('checkin in %s with %s token', venueID, accessToken);

        checkinApi.addCheckin(venueID, null, accessToken, function (err, data, next) {
            if(err) {
                logger.error('checkin error in %s with %s token', venueID, accessToken);
                next(new error.HttpError(500, 'checkin error'));
            }

            res.jsonp(data);
//            res.send(data);
        });
    }
};

