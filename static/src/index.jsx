'use strict';

import React from 'react/addons';
import { GoogleMaps, Marker } from 'react-google-maps';
import SideBar from './sidebar';
import Router from 'react-router';
// TODO NotFoundRouter
const { Route, NotFoundRoute, DefaultRoute, Link, RouteHandler } = Router;
const { update } = React.addons;

const GoogleMapsAPI = google.maps;
const { LatLng, LatLngBounds } = GoogleMapsAPI;

pc = pc || {};

/* @see http://en.wikipedia.org/wiki/Pub_crawl */

(function(pc){
  var _cache = {};

  function toJson(response) {
    return response.json()
  }

  /**
   * Запрос места
   * @see https://developer.foursquare.com/docs/responses/venue
   * @param id
   * @param isLess
   */
  pc._getVenue = function(id, isLess) {
    return fetch("/api/v1/venue/" + id)
      .then(toJson)
      .then((data)=>{
        setCache(id, data);
        return data;
      })
      .catch((data) => console.error('[get Venue]', data));
  };

  pc.getVenue = function(id) {
    return _cache[id]
      ? Promise.resolve(_cache[id])
      : pc._getVenue(id);
  };

  pc.getTrip = function(id) {
    return fetch('/api/v1/route/' + id)
      .then(toJson)
      .then(function(data) {
        return Promise.all(data[0].venues.map((v)=>{
          return pc.getVenue(v.id);
        }));
      });
      //.then((data)=>{
      //  return data.json();
      //});
  };

  function setCache(id, data) {
    _cache[id] = data;
  }

  pc.doCheckIn = function(venueId) {
    return fetch('/api/v1/checkin/' + venueId).then(toJson);
  };

  pc.getRoutes = function() {
    return fetch('/api/v1/routes/').then(toJson);
  }

})(pc);

export class Venue extends React.Component {

  onClick(e) {
    var vid = e.currentTarget.dataset.vid;
    pc.doCheckIn(vid);
  }

  render() {
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

    if (pc.user) {
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
};

var VenuesList = React.createClass({
  getInitialState: function() {
    return {
      data: []
    }
  },

  componentDidMount: function() {
    var routeId = this.props.params.routeId;
    pc.getTrip(routeId).then((data)=> this.setState({ data: data }))
  },

  render: function() {
    var Venues = this.state.data.map(venue =>{
      return (
        <Venue data={venue} key={venue.id} />
      );
    });
    var id = this.props.params.routeId;

    return (
      <div>
        <Link className="map" to="map" params={{routeId: id}}>Map</Link>
        <div className="VenuesList">
          {Venues}
        </div>
      </div>
    );

  }
});

export class MapComponent extends React.Component {
  // TODO up verison and state = {markers: []}
  constructor (props){
    super(props);
    this.state = {
      markers: []
    };
  }

  componentWillReceiveProps (props){
    let markers = props.data.map(venue => { return {position: new LatLng(venue.lat, venue.lng)}});
    this.setState({ markers });
  }

  componentDidUpdate(){
    let bounds = new LatLngBounds();

    this.state.markers.forEach(marker=>{
      bounds.extend(marker.position);
    });

    this.refs.map.fitBounds(bounds);
  }

  render() {
    return (
      <GoogleMaps
        containerProps={{
          style: {
            height: "500px",
            width: "100%"
          }
        }}
        ref="map"
        googleMapsApi={GoogleMapsAPI}>
          {this.state.markers.map((marker)=> <Marker position={marker.position} /> )}
      </GoogleMaps>
    );
  }
};

var VenuesListMap = React.createClass({
  getInitialState: function() {
    return {
      data: []
    }
  },

  componentDidMount: function() {
    var routeId = this.props.params.routeId;
    pc.getTrip(routeId).then((data)=> this.setState({ data: data}))
  },

  render: function(){
    // todo remove wrapper
    return (
      <div className="VenuesList">
        <MapComponent data={this.state.data} />
      </div>
    );
  }
});

export class App extends React.Component {
  onClick(){
    //console.log('__onClick__');
    $('.b-map').toggle();
    return null;
  }

  showControls(){
    //console.log('__showControls__');
    $('#app').toggleClass('move');
  }

  render(){
    var login = !pc.user ? <a href="/auth/foursquare">log in</a> : '';
    return (
      <div>
        <header>
          <Link className="backBtn" to="routes">&larr;</Link>

          <div className="controlsBtn" onClick={this.showControls}></div>
          <div className="logo">PUB&amp;BARS</div>
          <div className="user-info">
            {login}
          </div>
        </header>

        <RouteHandler/>
      </div>
    );
  }
};

export class Routes extends React.Component {
  constructor() {
    //super()
    this.state = {data: []}
  }

  componentDidMount() {
    var that = this;

    pc.getRoutes().then(function(data) {
      that.setState({
        data: data
      });
    });
  }

  render() {
    var Routers = this.state.data.map((route) =>{
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
};

export class Way extends React.Component {
  render() {
    var count = this.props.data.venues.length;
    var date = this.props.data.modified.split('T')[0].replace(/-/g, '.');

    var rnd = function() {
      return Math.round(Math.random() * 255);
    };
    var style = {
      background: 'rgba(' + rnd() + ',' + rnd() + ',' + rnd() + ', 0.2)'
    };

    return (
      <Link to="route" className="route" style={style} params={{routeId: this.props.data._id}}>
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
};

var VenueSmall = React.createClass({
  render: function() {
    return (
      <div className="venueSmall" data-id={this.props.data.id} onClick={this.props.onClick}>
        {this.props.data.name}
      </div>
    );
  }
});

var Add = React.createClass({

  getInitialState: function() {
    return {
      suggest: [],
      added: [],
      show: 'added',
      name: ''
    }
  },

  onChange: function(e) {
    var value = e.target.value;

    if (value.length > 5) {
      this.sendSearchRequest(value)
    }
  },

  onAddRouter: function() {
    var params = {
      name: this.state.name,
      venues: JSON.stringify(this.state.added)
    };

    $.post('/api/v1/routes', params, function() {
      // do something
    }, 'json');
  },

  sendSearchRequest: function(value) {
    var that = this;
    navigator.geolocation.getCurrentPosition(function(geo) {
      var params = {
        lat: geo.coords.latitude,
        lng: geo.coords.longitude
      };

      return $.get('/api/v1/search/' + value, params, function(data) {
        var state = that.state;
        state.suggest = data.venues;
        state.show = 'suggest';

        that.setState(state);
      });
    });
  },

  _onSelectVenue: function(e) {
    var state = this.state;

    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.innerText;

    state.added.push({
      name: name,
      id: id
    });

    state.show = 'added';

    this.setState(state);
  },

  onInputChange: function(e) {
    var state = this.state;
    state.name = e.target.value;

    this.setState(state)
  },

  render: function() {
    var that = this;
    var classString = 'search';

    if (this.state.show === 'suggest') {
      classString += ' show-suggest'
    }

    var SuggestedVenues = this.state.suggest.map(function (venue) {
      return (
        <VenueSmall data={venue} onClick={that._onSelectVenue} />
      );
    });

    var AddedVenues = this.state.added.map(function (venue) {
      return (
        <VenueSmall data={venue} onClick={that._onSelectVenue} />
      );
    });

    return (
      <div className={classString}>
        <input name="name" value={this.state.name} placeholder="Название маршрута" className="search-input" onChange={this.onInputChange} />
        <input name="search"  onChange={this.onChange} placeholder="Введите название заведения"  className="search-input" />
        <div className="suggest">
          {SuggestedVenues}
        </div>
        <div className="added">
          {AddedVenues}
          <button className="search-btn" onClick={this.onAddRouter}>Добавить</button>
        </div>

      </div>
    )
  }
});

var routes = (
  <Route name="app" path="/" handler={App}>
    <DefaultRoute handler={Routes}/>
    <Route name="routes" handler={Routes} />
    <Route name="route" path="/route/:routeId" handler={VenuesList} />
    <Route name="map" path="/route/:routeId/map" handler={VenuesListMap} />
    <Route name="add" path="/add" handler={Add} />
  </Route>
);

pc.init = function() {
  Router.run(routes, Router.HistoryLocation, function (Handler) {
    React.render(<Handler />, document.getElementById('app'));
    React.render(<SideBar />, document.getElementById('sidebar'));
  });
};

pc.init();
