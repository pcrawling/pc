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
            url: "/api/v1/venue/" + id,
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
        $.get('/api/v1/route/' + id, function(data) {
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
        return $.get('/api/v1/checkin/' + venueId);
    };

    pc.getRoutes = function() {
        return $.get('/api/v1/routes/');
    }

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
                <MapComponent />
            </div>

        );

    }
});

var MapComponent = React.createClass({
    render: function() {
        return (
            <div className="b-map" style={{display: 'none'}}>
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
    onClick: function(){
        $('.b-map').toggle();
    },

    showControls: function(){
        $('#app').toggleClass('move');
    },

    render: function () {
        var login = !pc.auth ? <a href="/auth/foursquare">log in</a> : '';

        return (
            <div>
                <header>
                    <Link className="backBtn" to="routes">&larr;</Link>
                    <div className="controlsBtn" onClick={this.showControls}></div>
                    <div className="logo">PUB&amp;BARS</div>
                    <div className="map" onClick={this.onClick}>maps</div>
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
    getInitialState: function() {
        return {
            data: []
        }
    },
    componentDidMount: function() {
        var that = this;

        pc.getRoutes().then(function(data) {
            that.setState({
                data: data
            });
        });
    },

    render: function() {
        var Routers = this.state.data.map(function (route) {
            return (
                <Way data={route} />
            );
        });

        return (
            <div>
                {Routers}
            </div>
        )
    }
});

var Way = React.createClass({
    render: function() {
        var count = this.props.data.venues.length;
        var date = this.props.data.modified.split('T')[0].replace(/-/g, '.');

        var rnd = function() {
            return Math.round(Math.random() * 255);
        };
        var style = {
            background: 'rgba(' + rnd() + ',' + rnd() + ',' + rnd() + ', 0.2)'
        };

        return (
            <Link to="route" className="route" style={style} params={{routeId: this.props.data.id}}>
                <div className="route__name">
                    {this.props.data.name}
                </div>
                <span className="route__count">
                    Сложность: {count}
                </span>
                <span className="route__author">
                    Автор: {this.props.data.author}
                </span>
                <span className="route__modified">
                    {date}
                </span>
                <span className="route__heart">
                    <img width="15" src="/static/i/heart.svg" />
                </span>

            </Link>
        )
    }
});

var SideBar = React.createClass({
    render: function() {
        return (
            <div>
                <ul>
                    <li>Аккаунт</li>
                    <li>Список маршрутов</li>
                    <li>Мои маршруты</li>
                    <li>Добавить маршрут</li>
                    <li>Топ мест</li>
                    <li>Выход</li>
                </ul>
                <div className="sidebar-logo">
                    PUB&amp; BARS
                </div>
            </div>
        )
    }
});



var routes = (
    <Route name="app" path="/" handler={App}>
        <Route name="routes" handler={Routes} />
        <Route name="route" path="/route/:routeId" handler={VenuesList} />
        <DefaultRoute handler={Routes}/>
    </Route>
);

pc.init = function() {
    Router.run(routes, Router.HistoryLocation, function (Handler) {
        React.render(<Handler />, document.getElementById('app'));
        React.render(<SideBar />, document.getElementById('sidebar'));
    });
};

pc.init();