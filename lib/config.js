var winston = require('winston')
    , ENV = process.env.NODE_ENV;

module.exports = {
    'forever': {
        'max': 3,
        'silent': false,
        'options': []
    },
    'app': {
        url: 'http://proverstka.ru',
        port: 3002
    },
    'foursquare': {
        'accessTokenUrl': 'https://foursquare.com/oauth2/access_token',
        'authenticateUrl': 'https://foursquare.com/oauth2/authenticate',
        'apiUrl': 'https://api.foursquare.com/v2'
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
            'expires': new Date(9999, 11, 31)
        }
    }
};
