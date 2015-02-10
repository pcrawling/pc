var winston = require('winston')
    , config = require('./config')
    , logger = new winston.Logger(config.winston);

module.exports = logger;
