var winston = require('winston')
    , ENV = process.env.NODE_ENV;

module.exports = {
    'forever': {
        'max': 3,
        'silent': false,
        'options': []
    },
    'app': {
        port: 3000
    },
    'foursquare': {
        'accessTokenUrl': 'https://foursquare.com/oauth2/access_token',
        'authenticateUrl': 'https://foursquare.com/oauth2/authenticate',
        'apiUrl': 'https://api.foursquare.com/v2'
        /*
         This field will indicate which version of the Foursquare API you wish to call. If not specified or set to 'LATEST',
         it will use the latest version by setting the version number to today's date.
         */
        //'version' : 'LATEST',
        /*
         This field determines how this library handles endpoints that return results along with an error, (e.g. deprecations).
         - If set to 'WARN' (default), log4js will write a warning to the log, (NOTE: You must raise the
         'node-foursquare.core' log4js level to WARN or lower in order to see these warnings.
         - If set to 'ERROR', the library will behave as though it encountered an ERROR and not return results.
         */
        //'warnings' : 'WARN'
    },
    // для production установим логгирование для уровня > info(4) , для development > detail(0)
    'winston': {
        'transports': [
            new winston.transports.Console({
                    'level': ENV === 'production'? 'info' : 'detail',
                    'colorize': true
                })
        ],
        'levels': {
            'detail': 0,
            'trace': 1,
            'debug': 2,
            'enter': 3,
            'info': 4,
            'warn': 5,
            'error': 6
        },
        'colors': {
            'detail': 'grey',
            'trace': 'white',
            'debug': 'blue',
            'enter': 'inverse',
            'info': 'green',
            'warn': 'yellow',
            'error': 'red'
        },
        'loggers': {
            'default': {
                'console': {
                    'level': 'none'
                }
            }
        }
    },
    'session': {
        'cookie': {
            //default settings
//            'path': '/',
//            'maxAge': null,  //тереть по окончании сессии, возможно нам нужна пожизненная
//            'httpOnly': false, //запретили читать из js
            //FIXME bad idea
            'expires': new Date(9999, 11, 31) //бесконечная кука
        }
    }
};
