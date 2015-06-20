function getVparam() {
    var d = new Date();
    var month = d.getMonth() + 1;
    var date = d.getDate();
    var curr_day = (date < 10) ? '0' + date : date;
    var curr_month = (month < 10) ? '0' + month : month;
    var curr_year = d.getFullYear();

    return curr_year + '' + curr_month + '' + curr_day;
}

function sanitizeVenueData(data) {
    var photo_url;

    if (data.bestPhoto) {
        photo_url = data.bestPhoto.prefix + 'height430' + data.bestPhoto.suffix;
    }

    return {
        id: data.id,
        name: data.name,
        rating: Math.floor(data.rating * 10)/10,
        photo_url: photo_url,
        lat: data.location.lat,
        lng: data.location.lng,
        color: data.ratingColor,
        here_now: data.hereNow.count
    };
}

module.exports = {
    getVparam: getVparam,
    sanitizeVenueData: sanitizeVenueData
}