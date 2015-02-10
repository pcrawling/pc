var Route = require('../models/route').RouteModel
    , mongoose = require('../lib/db')
    , logger = require('../lib/logger')
    , data = require('./dataRoute.js');

var Data = [];

mongoose.connection.on('open', runIt);

function runIt() {
    dropDatabase();
    createRoutes(data);
}

function dropDatabase() {
    mongoose.connection.db.dropDatabase();
}

function createRoutes(data){
    data.map(function(dataItem){
       new Route(dataItem)
           .save(function(err, data){
               if(err) {
                   logger.error('err ', err);
               }
               Data.push(data);
           });
    });
    logger.info(Data);
}
