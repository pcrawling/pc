var mongoose = require('../lib/db'),
    Schema = mongoose.Schema;

var Venue = new Schema({
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400                              // сутки 60*60*24 = 86400
    },
    id: { type: String },
    name: { type: String, required: true },
    rating : { type: Number },
    photos: { type: Object },
    location : {                                    // если захоти использовать встроенный loc
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }

}, { strict: true });                               // http://mongoosejs.com/docs/guide.html#strict

Venue.pre("save", function(next) {
    
    if(this.photos) {
        this.photos = {
            prefix: this.photos.groups[0].items[0].prefix,
            suffix: this.photos.groups[0].items[0].suffix
        };
    }
    // да, блять, костыль, но пока не нашел как прокинуть только id  убрать стрикт
    // и pre-save обработку заменить на кастомную
    this._id = this.id;
    this.id = null;

    this.createdAt = new Date();
    this.rating = Math.floor(this.rating * 10)/10;
    next();
});

//TODO проверить автоудаление

// Да, можно реализовать расчет при save, это так для тренировки :)
//Venue.path('rating').get(function (val) {
//    return 'Mishutla';
//    return
//});

//Venue.virtual('photoUrl').get(function () {
//    return this.photos.groups[0].items[0].prefix + 'height400' + this.photos.groups[0].items[0].suffix;
//});

//Venue.set('toJSON', { virtuals: true, getters: true });

// какие-то трансформации с объектом
//schema.options.toObject.transform = function (doc, ret, options) {
//    return { movie: ret.name }
//}

// validation
//Venue.path('description').validate(function (desc) {
//    return desc.length > 5 && desc.length < 70;
//});

module.exports.VenueModel = mongoose.model('Venue', Venue);
