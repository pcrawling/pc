var logger = require('../lib/logger');
var error = require('../lib/error');
var secret = require('../lib/secret');
var utils = require('../lib/utils');
var Foursquare = require('node-foursquare')(secret);

module.exports = function(routes) {
    routes.checkin = function(req, res, next){
        var accessToken = req.user.code,
            venueID = req.params.venueId;

        if(!accessToken){
            logger.error('checkin with not valid token: %s', accessToken);
            next(new error.HttpError(403, 'token is not valid'));
        }

        logger.info('checkin in %s with %s token', venueID, accessToken);

        Foursquare.Checkins.addCheckin(venueID, null, accessToken, function (err, data) {
            if(err) {
                logger.error('checkin error in %s with %s token', venueID, accessToken);
                next(new error.HttpError(500, 'checkin error'));
            }

            res.send(data);
        });
    };

    routes.getVenue = function(req, res, next) {
        var venueID = req.params.venueId;

        Foursquare.Venues.getVenue(venueID, null, function (err, data) {
            if (err) {
                logger.error('venue error in %s with %s token', venueID, accessToken);
                next(new error.HttpError(500, 'get venue error'));
            }

            data = utils.sanitizeVenueData(data.venue);

            res.send(data);
        });
    };
};

