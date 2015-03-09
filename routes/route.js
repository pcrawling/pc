var url = require('url'),
    vow = require('vow'),
    logger = require('../lib/logger'),
    error = require('../lib/error'),
    RouteModel = require('../models/route'),
    VenueModel = require('../models/venue'),
    secret = require('../lib/secret'),
    Foursquare = require('node-foursquare')(secret),
    venuesApi = Foursquare.Venues;

module.exports = function(routes) {
    // get all routes
    routes.routes = function(req, res, next){
        var accessToken = req.user || 'unknow';

        logger.info('get all routes for %s', accessToken);

        return RouteModel.find(function (err, routes) {
            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            logger.info('send all routes for %s', accessToken);
            return res.jsonp(routes);
        });
    };

    // get route with id
    routes.route = function(req, res, next){
        //TODO вынести в отдельный middleware
        var accessToken = req.user || 'unknow',
            routeId = req.params.routeId;

        logger.info('get route with id= %s for %s', routeId, accessToken);

        return RouteModel.find({id: routeId}, function (err, route) {
            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            if (!route) {
                logger.error('Route with id=%s not found', routeId);
                return next(new error.HttpError(404, 'Not found'));
            }

            logger.info('send route with id=%s for %s', routeId, accessToken);
            return res.json(route);
        });
    };

    // get detailed route info
    routes.detail = function(req, res, next){
        //TODO вынести в отдельный middleware
        var accessToken = req.user || 'unknow',
            routeId = req.params.routeId;

        logger.info('get detailed route info with id= %s for %s', routeId, accessToken);

        return RouteModel.findById(routeId, function (err, route) {
            var trip;

            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            if (!route) {
                logger.error('Route with id=%s not found', routeId);
                //return next(new error.HttpError(404, 'Not found'));
            }

            trip = route.venues.map(function(venue){
                return fetchVenueData(venue.id);
            });

            vow.all(trip).then(function(data) {
                var fetchedData = data.map(function(item) {
                    return item.valueOf();
                });
                res.send(fetchedData);
            });

            function fetchVenueData(venueId) {
                var innerFetch = vow.defer();

                //TODO promise?
                VenueModel.findById(venueId, function (err, savedData) {
                    if (err) {
                        logger.error('Internal error: %s', err);
                        innerFetch.reject(new error.HttpError(500, 'Internal error'));
                    };

                    //TODO переделать этот кусок
                    if (savedData) {
                        logger.info('Have saved data for venue with id = %s', venueId);
                        innerFetch.resolve(savedData.toObject());
                    } else {
                        logger.info('Haven`t saved data for venue with id = %s', venueId);

                        venuesApi.getVenue(venueId, null, function(err, data){
                            if(err){
                                logger.error('Internal error: %s', err);
                                innerFetch.reject(new error.HttpError(500, 'Internal error'));
                            }
                            logger.info('Data has given for venue with id = %s', venueId);

                            new VenueModel(data.venue).save(function(err, savedData){
                                if(err){
                                    logger.error('Save error, shit happens %s', err);
                                    innerFetch.resolve(data.venue);
                                } else {
                                    innerFetch.resolve(savedData);
                                }
                            });
                        });
                    }

                    logger.info('Got data for venue with id = %s', venueId);
                });

                return innerFetch.promise();
            }
        });
    };

    // get route with custom filters
    routes.routeFilter = function(req, res, next){
        var accessToken = req.user || 'unknow',
            filter = url.parse(req.url, true).query;

        //TODO filter надо обезопасить
        console.log('filter---> ', filter);

        logger.info('get route with route filter %s for %s', filter, accessToken);

        RouteModel.find(filter , function (err, data) {
            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            if (!data) {
                logger.error('Route with filter=%s not found', filter);
                return next(new error.HttpError(404, 'Not found'));
            }

            logger.info('send route with filter=%s for %s', filter, accessToken);
            return res.jsonp(data);
        });
    };

    // get route with custom filters
    routes.venueFilter = function(req, res, next){
        var accessToken = req.user || 'unknow',
            filter = url.parse(req.url, true).query;

        console.log('filter---> ', filter);

        logger.info('get route with venue filter %s for %s', filter, accessToken);

        RouteModel.venues.find(filter , function (err, data) {
            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            if (!data) {
                logger.error('Route with venue filter=%s not found', filter);
                return next(new error.HttpError(404, 'Not found'));
            }

            logger.info('send route with venue filter=%s for %s', filter, accessToken);
            return res.jsonp(data);
        });
    };

    // get route with custom filters
    routes.drinkFilter = function(req, res, next){
        var accessToken = req.user || 'unknow',
            filter = url.parse(req.url, true).query;

        console.log('filter---> ', filter);

        logger.info('get route with filter %s for %s', filter, accessToken);

        RouteModel.find(filter , function (err, data) {
            if (err) {
                logger.error('Internal error: %s', err);
                return next(new error.HttpError(500, 'Internal error'));
            }

            if (!data) {
                logger.error('Route with filter=%s not found', filter);
                return next(new error.HttpError(404, 'Not found'));
            }

            logger.info('send route with filter=%s for %s', filter, accessToken);
            return res.jsonp(data);
        });
    };

    // add route
    routes.add = function(req, res, next){
        // в нормальной работе берем данные из req.body
        var routeData={
            // не ну а хули, попуститься надо то
            name: 'опохмел',
            description: 'отлететь',
            author: '91899962',
            id: '1488',
            venues: [
                {
                    //Бермуды
                    id: '4ceebab182125481ac3666a1',
                    drinks: [
                        {
                            name: 'рассол',
                            type: 1,
                            count: 2
                        },
                        {
                            name: 'чай с лимончиком',
                            type: 2,
                            count: 1
                        }
                    ]
                }
            ]
        };

        //TODO вынести в отдельный middleware
        var accessToken = req.user || 'unknow';

        // будем запрещать создание для unknow?
        logger.info('add new route with for %s', accessToken);

        var route = new RouteModel(routeData);

        return route.save(function (err, addedRoute) {

            if(err){
                if(err.name == 'ValidationError') {
                    logger.error('Validation error %j',err.message);
                    return next(new error.HttpError(400, 'Validation error'));
                } else {
                    logger.error('Internal error %j',err.message);
                    return next(new error.HttpError(500, 'Internal error'));
                }
            }

            logger.info("route created");
            return res.jsonp({ status: 'OK', route: route });
        });
    }
};

