// Установим соединение с базой
var mongoose = require('mongoose'),
    logger = require('./logger');

if ( process.env.NODE_ENV == 'test' ) {
    mongoose.connect('mongodb://localhost/test');
} else {
    mongoose.connect('mongodb://localhost/pc');
}

if (process.env.NODE_ENV == 'development') {
    mongoose.set('debug', true);
}

logger.trace("DB initialized");

module.exports = mongoose;
