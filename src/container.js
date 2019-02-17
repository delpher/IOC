function Container() {
    var self = this;
    var registrations = {};

    self.registerInstance = function(name, instance) {
        registrations[name] = {
            resolve: function() { return instance; }
        };
    };

    self.registerFactory = function(name, factory) {
        registrations[name] = {
            resolve: function() { return factory(self); }
        };
    };

    self.resolve = function(name) {
        var registration = registrations[name];
        return registration.resolve();
    };
}