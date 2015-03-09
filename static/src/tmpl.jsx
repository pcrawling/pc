var pc = pc || {};
var Router = ReactRouter;

/* @see http://en.wikipedia.org/wiki/Pub_crawl */

(function(pc){
    var _cache = {};

    /**
     * Запрос места
     * @see https://developer.foursquare.com/docs/responses/venue
     * @param id
     * @param isLess
     */
    pc._getVenue = function(id, isLess) {
        var def = new vow.Deferred();
        $.ajax({
            url: "/venue/" + id,
            type: "GET",
            dataType: "json"
        }).done(function(data){
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
        var promises = [];
        var def = new vow.Deferred();
        $.get('route/1', function(data) {
            data[0].venues.forEach(function(v){
                promises.push(pc.getVenue(v.id));
            });

            vow.all(promises).then(function(data) {
                def.resolve(data);
            });
        });

        return def.promise();
    };


    function setCache(id, data) {
        _cache[id] = data;
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

})(pc);

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
    getInitialState: function() {
        return {
            data: []
        }
    },
    componentDidMount: function() {
        var that = this;

        pc.getTrip().then(function(data){
            that.setState({
                data: data
            });
        });
    },

    render: function() {
        var Venues = this.state.data.map(function (venue) {
            return (
                <Venue data={venue} />
            );
        });

        return (
            <div className="VenuesList">
                {Venues}
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
                <div id="mapCanvas"></div>
            </div>
        );
    }
});

var DefaultRoute = Router.DefaultRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;

var App = React.createClass({
    render: function () {
        return (
            <div>
                <header>
                    <ul>
                        <li><Link to="map">Map</Link></li>
                        <li><Link to="list">List</Link></li>
                    </ul>
                </header>

                <RouteHandler/>
            </div>
        );
    }
});

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="map" handler={MapComponent} />
        <Route name="list" handler={VenuesList} />
        <DefaultRoute handler={VenuesList}/>
    </Route>
);

pc.init = function() {
    Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler />, document.getElementById('app'));
    });
};

pc.init();