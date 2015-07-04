'use strict';
import React from 'react/addons';
import {GoogleMaps, Marker} from "react-google-maps";

import Router from 'react-router';

const { Route, NotFoundRoute, DefaultRoute, Link, RouteHandler } = Router;


const {update} = React.addons;

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

  onClick(e){
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
};


var VenuesList = React.createClass({
  mixins: [Router.State],

  getInitialState: function() {
    return {
      data: []
    }
  },

  componentDidMount: function() {
    var routeId = this.getParams().routeId;

    pc.getTrip(routeId).then((data)=> this.setState({ data: data }))
  },

  render: function() {
    var Venues = this.state.data.map((venue) =>{
      return (
        <Venue data={venue} />
      );
    });
    var id = this.getParams().routeId;

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
  render() {
    return (
      // TODO передать параметры и ренденрить
      <GoogleMaps/>
    );
  }
};

var VenuesListMap = React.createClass({
  mixins: [Router.State],

  getInitialState: function() {
    return {
      data: []
    }
  },

  componentDidMount: function() {
    var routeId = this.getParams().routeId;

    pc.getTrip(routeId).then((data)=> this.setState({ data: data }))
  },

  render: function() {

    return (
      <div className="VenuesList">
        <MapComponent

          />
      </div>

    );

  }
});

export class App extends React.Component {
  onClick(){
    console.log('__onClick__');
    //$('.b-map').toggle();
    return null;
  }

  showControls(){
    console.log('__showControls__');
    //$('#app').toggleClass('move');
  }

  render(){
    var login = !pc.auth ? <a href="/auth/foursquare">log in</a> : '';
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
};

export class SideBar extends React.Component {
  render() {
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
};

var routes = (
  <Route name="app" path="/" handler={App}>
    <Route name="routes" handler={Routes} />
    <Route name="route" path="/route/:routeId" handler={VenuesList}>
      <Route name="map" path="map" handler={VenuesListMap} />
    </Route>
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
