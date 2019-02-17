function Container() {
    var self = this;
    var registrations = {};

    self.registerInstance = function (name, instance) {
        registrations[name] = {
            resolve: function () {
                return instance;
            }
        };
    };

    self.registerFactory = function (name, factory, LifeTime) {
        LifeTime = LifeTime || Container.Default;

        registrations[name] = new LifeTime({
            resolve: function () {
                return factory(self);
            }
        });
    };

    self.registerType = function (name, constructor, LifeTime) {
        LifeTime = LifeTime || Container.Default;

        registrations[name] = new LifeTime({
            resolve: function () {
                return new constructor();
            }
        });
    };

    self.resolve = function (name) {
        var registration = registrations[name];
        return registration.resolve();
    };
}

Container.Default = function (registration) {
    this.resolve = function () {
        return registration.resolve();
    }
};

Container.Singleton = function (registration) {
    var instance = null;

    this.resolve = function () {
        if (instance) return instance;
        return (instance = registration.resolve());
    }
};