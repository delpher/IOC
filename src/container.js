function Container() {
    var self = this;
    var instances = {};
    var factories = {};

    self.registerInstance = function(name, instance) {
        instances[name] = instance;
    };

    self.registerFactory = function(name, factory) {
        factories[name] = factory;
    };

    self.resolve = function(name) {
        if (instances[name])
            return instances[name];

        if (factories[name])
            return factories[name](self);
    };
}