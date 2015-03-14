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

    pc.getTrip = function(id) {
        var promises = [];
        var def = new vow.Deferred();
        $.get('/route/' + id, function(data) {
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
        return $.get('checkin/' + venueId);
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

        var ratingStyle = {
            color: '#' + this.props.data.color
        };

        var vRating;
        var vHere;
        var vCheckIn;

        if (this.props.data.rating) {
            vRating = <div className="vRating">
                <span className="vRating__num" style={ratingStyle}>
                {this.props.data.rating}
                </span>/10</div>;
        }

        if (this.props.data.here_now) {
            vHere = <span className="vHereNow">
                    {this.props.data.here_now}
                    &nbsp;<img width="13" src="/static/i/group58.svg" />
            </span>
        }

        if (pc.auth) {
            vCheckIn = <div className="checkinBtn" onClick={this.onClick} data-vid={this.props.data.id}>
            CHECK IN
            </div>
        }

        return (
            <div className="v" style={divStyle}>
                {vCheckIn}
                <div className="vName">
                    {this.props.data.name}
                </div>
                {vHere}
                {vRating}
            </div>
            );
    }
});

var VenuesList = React.createClass({
    mixins: [Router.State],

    getInitialState: function() {
        return {
            data: []
        }
    },
    componentDidMount: function() {
        var that = this;
        var routeId = this.getParams().routeId;

        pc.getTrip(routeId).then(function(data){
            that.setState({
                data: data
            });

            pc.initialize(data);
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
        pc.getTrip(1).then(function(data){
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
        var login = !pc.auth ? <a href="/auth/foursquare">log in</a> : '';

        return (
            <div>
                <header>
                    <ul>
                        <li><Link to="map">Map</Link></li>
                        <li><Link to="routes">Routes</Link></li>
                    </ul>
                    <div className="user-info">
                        {login}
                    </div>
                </header>

                <RouteHandler/>
            </div>
        );
    }
});

var Routes = React.createClass({
   render: function() {
       return (

           <div>
               <Link to="route" params={{routeId: 1}}>route1</Link>
               <Link to="route" params={{routeId: 2}}>route2</Link>
           </div>
       )
   }
});

var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="map" handler={MapComponent} />
        <Route name="routes" handler={Routes} />
        <Route name="route" path="/route/:routeId" handler={VenuesList} />
        <DefaultRoute handler={Routes}/>
    </Route>
);

pc.init = function() {
    Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler />, document.getElementById('app'));
    });
};

pc.init();