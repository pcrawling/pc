function Map() {
    var params =  {
            lat: 59.949277,
            lng: 30.3041534,
            elem: document.getElementById('mapCanvas'),
            icon: '/static/i/baloon.svg'
        },
        directionDisplayOptions = {
            suppressMarkers: true,
            polylineOptions: {
                strokeColor:'red',
                strokeWeight: 5
            }
        },
        routeOptions = {
            travelMode: google.maps.TravelMode.WALKING
        },
        markers = [];

    function createMap(options) {
        return new google.maps.Map(options.elem,{
            center: new google.maps.LatLng(options.lat || options.d ,options.lng || options.e),
            disableDefaultUI: true
        })
    }

    function createIcon() {
        return new google.maps.MarkerImage(
          'img/baloon.svg',
          null, /* size is determined at runtime */
          null, /* origin is 0,0 */
          null, /* anchor is bottom center of the scaled image */
          new google.maps.Size(64, 32)
        );
    }

    function drawMarker(data, map, options){
        if(!data){ return }

        var marker = new google.maps.Marker({
            title: data.name,
            position: data.latLng,
            map: map,
            icon: options.icon
        });

        markers.push(marker);
    }

    function fitMarkers(data, map){
        var bounds = new google.maps.LatLngBounds();
        for(var i = 0; i < data.length; i++){
            bounds.extend(data[i].latLng);
        }

        map.fitBounds(bounds);
    }

    /**
     * Нормализует данные
     *
     * @private
     * @param {Array} Массив объектов вида {name: {String}, lat: {Number}, lng: {Number}}

     * @returns {Array} Объектов привиденных к виду {name:{String}, LatLng:{GoogleMap.LatLng}
     */
    function normalizeData (barsData) {
        if (!barsData[0] instanceof google.maps.LatLng){
            return barsData
        }

        var res = [],
            bar;
        for(var i = 0; i < barsData.length; i++) {
            bar = barsData[i];
            res.push({
                name: bar.name,
                latLng: new google.maps.LatLng(bar.lat, bar.lng)
            })
        }
        return res;
    }

    function createRouteUtils(map) {
        var renderer =  new google.maps.DirectionsRenderer();

        renderer.setMap(map);
        renderer.setOptions(directionDisplayOptions);

        return {
            map: map,
            service: new google.maps.DirectionsService(),
            renderer: renderer
        }
    }

    function clearMarkers() {
        for(var i = 0; i < markers.length; i++){
            markers[i].setMap(null);
        }
        markers = [];
    }

    function clearDirections(renderer) {
        renderer.setDirections({routes: []});
    }

    /**
     * Расчитывает и прокладывает маршрут
     *
     * @private
     * @param {Object} [utils] Вспомогательные объекты
     * @param {Array} [from] Точка отправления
     * @param {Object} [to] Точка назначения
     *
     * @returns {map}
     */
    this._calcRoute = function(utils, routePoints) {
        var request = {
            origin: routePoints[0].latLng,
            destination: routePoints[1].latLng,
            travelMode: routeOptions.travelMode
        };

        //TODO надо ли обернуть в promise?
        utils.service.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                utils.renderer.setDirections(response);

                var  path = response.routes[0].legs[0];

                this._draw([{
                    lat: path.start_location.lat(),
                    lng: path.start_location.lng()
                },{
                    lat: path.end_location.lat(),
                    lng: path.end_location.lng()
                }]);
            }
        }.bind(this));
    };

    /**
     * Нарисовать маркеры на карте
     *
     * @private
     * @param {Array} [barsData] Массив данных для отрисовки
     *
     * @returns {map}
     */
    this._draw = function(barsData) {
        this.clear();

        var data = normalizeData(barsData);

        data.forEach(function(barData) {
            drawMarker(barData, this.map, this.options);
        }.bind(this));

        fitMarkers(data, this.map);

        return this
    };

    /**
     * Проинициализировать синглтон карты Map
     *
     * @public
     * @param {Object} [options] Переданные параметры
     *
     * @returns {map}
     */
    this.init = function(options) {
        if(this.map) return this.map;

        //TODO выпилить $
        this.options = $.extend(params,options);
        this.options.icon = this.options.icon || createIcon();
        this.map = createMap(this.options);

        return this;
    };

    /**
     * Нарисовать маркеры на карте
     *
     * @public
     * @param {Array} [barsData] Массив данных для отрисовки
     *
     * @returns {map}
     */
    this.draw = function(barsData){
        //TODO можно убрать проверку, если инициализировать все utils в конструкторе
        this.routeUtils && clearDirections(this.routeUtils.renderer);
        return this._draw(barsData);
    };

    /**
     * Прокладывает маршрут от точки from в точку to
     *
     * @public
     * @param {Object} [from] Точка отправления
     * @param {Object} [to] Точка назначения
     *
     * @returns {map}
     */
    this.drawRoute = function(from, to) {
        var data = normalizeData(arguments);

        if(!this.routeUtils){
            this.routeUtils = createRouteUtils(this.map);
        }

        this.clear();

        //TODO человеческое API
        this._calcRoute(this.routeUtils, data);

        return this;
    };

    /**
     * Удаляет маркеры на карте и проложеный маршрут
     *
     * @public

     * @returns {map}
     */
    this.clear = function (){
        clearMarkers();
        return this;
    };
}

export default function(barsData){
  var map = new Map();
  map.init();
  map.draw(barsData);
};
