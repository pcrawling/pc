/** @jsx React.DOM */
/* @see http://en.wikipedia.org/wiki/Pub_crawl */
var trip = [
    '4d56f044ba5b224b8e5a2114',
    '4bad17bef964a520d12c3be3',
    '4e4ec0937d8bd425e485ef71',
    '501801e0e4b054aab314d0d6',
    '51b5e50f498ecbc1df8bdf20',
    '4fb15641e4b02f54b90ebf92',
    '4cc9b802d54fa1cde8403929',
    '4f9bfe03e4b04dce44b25a6a',
    '5257e2c011d238157c415649',
    '4f3faf9be4b0f13aa63aad1a',
    '4c63da914b5176b0bf931717',
    '4bfe718c2b83b71331e9a998',
    '4ceebab182125481ac3666a1'
];

(function(){
    var _cache = {};
    var pc = {};
    var CLIENT_ID = 'G5O2WXZXPB41SESRA1CZ3R52XZZ2112G0QD2HEZHD0IZDAXJ';
    var CLIENT_SECRET = 'QHSC0IC4RM45SHGGFHR2SP35OGTZVN4Y41MDIV2JIJJLKZBT';
    pc.requestData = {
        v: getVparam(),
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET
    }

    /**
     * Запрос места
     * @see https://developer.foursquare.com/docs/responses/venue
     * @param id
     * @param isLess
     */
    pc._getVenue = function(id, isLess) {
        var def = new vow.Deferred();
        var urlPostfix = isLess ? 'venueless' : 'venues';
        var url = "https://api.foursquare.com/v2/" + urlPostfix  + "/" + id;
        $.ajax({
            url: url,
            type: "GET",
            data: pc.requestData,
            dataType: "json"
        }).done(function(data){
            var data = sanitizeVenueData(data.response.venue);
            setCache(id, data);
            def.resolve(data);
        }).fail(function(data) {
            console.error('[get Venue]', data);
        });
        return def.promise();
    };

    pc.getVenue = function(id) {
        if (_cache[id]) {
            return vow.fulfill(_cache[id]);
        } else {
            return pc._getVenue(id);
        }
    };

    pc.getTrip = function() {
        var promises = []
        trip.forEach(function(v){
            promises.push(pc.getVenue(v));
        })
        return vow.all(promises);
    };


    function setCache(id, data) {
        _cache[id] = data;
    }

    function sanitizeVenueData(data) {
        var photo_url = data.photos.groups[0].items[0].prefix + 'height400' + data.photos.groups[0].items[0].suffix;
        return {
            id: data.id,
            name: data.name,
            rating: Math.floor(data.rating * 10)/10,
            photo_url: photo_url,
            lat: data.location.lat,
            lng: data.location.lng
        };
    }

    function getVparam() {
        var d = new Date();
        var month = d.getMonth() + 1;
        var date = d.getDate();
        var curr_day = (date < 10) ? '0' + date : date;
        var curr_month = (month < 10) ? '0' + month : month;
        var curr_year = d.getFullYear();

        return curr_year + '' + curr_month + '' + curr_day;
    }

    pc.doCheckIn = function(venueId) {
        var def = new vow.Deferred();
        var url = "https://api.foursquare.com/v2/checkins/add";
        $.ajax({
            url: url,
            type: "POST",
            data: {
                venueId: venueId,
                oauth_token: TOKEN,
                v: getVparam()
            },
            dataType: "json"
        }).done(function(data){
            def.resolve(data);
        }).fail(function(err) {
            console.warn('[checkIn]', err);
        });
        return def.promise();
    };

    window.pc = pc; // pc - Pub crawl
})();

var Venue = React.createClass({

    onClick: function(e){
        var vid = e.currentTarget.dataset.vid;
        pc.doCheckIn(vid);
    },

    render: function() {
        var divStyle = {
            background: 'url(' + this.props.data.photo_url + ') 50% 50% no-repeat'
        };
        return (
            <div className="v" style={divStyle}>
                <div className="checkinBtn" onClick={this.onClick} data-vid={this.props.data.id}>click</div>
                <div className="vName">
                    {this.props.data.name}
                </div>
                <div className="vRating">
                    {this.props.data.rating}/10
                </div>
            </div>
            );
    }
});

var VenuesList = React.createClass({
    render: function() {
        var Venues = this.props.data.map(function (venue) {
            return (
                <Venue data={venue} />
            );
        });

        return (
            <div className="VenuesList">
                {Venues}
                <a href="#!/map">Показать на карте</a>
            </div>
        );

    }
});

var MapComponent = React.createClass({
    componentDidMount: function() {
        pc.getTrip().then(function(data){
            pc.initialize(data);
        });
    },
    render: function() {
        return (
            <div className="b-map">
                <a href="#">К списку баров</a>
                <div id="mapCanvas"></div>
            </div>
        );
    }
});

var InterfaceComponent = React.createClass({
    componentWillMount : function() {
        this.callback = (function() {
            this.forceUpdate();
        }).bind(this);

        this.props.router.on("route", this.callback);
    },
    componentWillUnmount : function() {
        this.props.router.off("route", this.callback);
    },
    getInitialState: function() {
        return {data: []};
    },
    componentDidMount: function() {
        var that = this;
        pc.getTrip().then(function(data){
            that.setState({data: data});
        });


    },
    render : function() {
        if (this.props.router.current == "map") {
            return <MapComponent />;
        }
        return <VenuesList data={this.state.data} />;
    }
});

pc.router = new Router();

Backbone.history.start();

React.renderComponent(
    <InterfaceComponent router={pc.router} />,
    document.getElementById('app')
);
