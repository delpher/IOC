function Container() {
    var self = this;
    var instances = {};

    self.registerInstance = function(name, instance) {
        instances[name] = instance;
    };

    self.resolve = function(name) {
        return instances[name];
    };
}