var mongoose = require('../lib/db'),
    Schema = mongoose.Schema;

var Drink = new Schema({
    name: { type: String, required: true },
    type : { type: Number, required: true }, // для иконок, например, водка там, пиво и тд
    count: { type: Number, required: true }
});

var Venue = new Schema({
    id: { type: String, required: true },   // foursquareId for venue
    drinks: [Drink]
});

var Route = new Schema({
//    id: { type: String, required: true },   // внутренний, React требует цифровой уникальный ключ
    name: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String }, // foursquareId for user
    venues: [Venue],
    modified: { type: Date, default: Date.now }
});

// validation
Route.path('description').validate(function (desc) {
    return desc.length > 5 && desc.length < 70;
});

module.exports = mongoose.model('Route', Route);
