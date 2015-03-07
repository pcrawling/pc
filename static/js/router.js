var Router = Backbone.Router.extend({

    routes : {
        "" : "index",
        "!/map" : "map"
    },
    index : function() {
        this.current = "index";
    },
    map : function() {
        this.current = "map";
    }
});

