var forever = require('forever-monitor')
    , logger = require('./lib/logger')
    , config = ('./lib/config');

var child = new (forever.Monitor)('./app.js', config.forever);

child.on('watch:restart', function(info) {
    logger.warn('Restaring script because ' + info.file + ' changed');
});

child.on('restart', function() {
    logger.warn('Forever restarting script for ' + child.times + ' time');
});

child.on('exit:code', function(code) {
    logger.error('Forever detected script exited with code ' + code);
});

child.start();
