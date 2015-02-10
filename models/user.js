var mongoose = require('../lib/db'),
    Schema = mongoose.Schema;

var schema = new Schema({
    id: {
        type: String,
        unique: true,
        required: true
    },
    code: {
        type: String,
        unique: true,
        required: true
    }
});

module.exports = mongoose.model('User', schema);
