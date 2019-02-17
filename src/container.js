function Container(parentContainer) {
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
        LifeTime = LifeTime || Container.DefaultLifetime;

        registrations[name] = new LifeTime({
            resolve: function () {
                return factory(self);
            }
        });
    };

    self.registerType = function (name, constructor, LifeTime) {
        LifeTime = LifeTime || Container.DefaultLifetime;

        registrations[name] = new LifeTime({
            resolve: function () {
                var ctor = self.satisfyImports(constructor);
                return new ctor();
            }
        });
    };

    self.createChild = function() {
        return new Container(self)
    };

    self.resolve = function (name) {
        var registration = registrations[name];
        if (registration) return registration.resolve();

        if (parentContainer) return parentContainer.resolve(name);

        throw new Error('Missing registration for: \'' + name + '\'');
    };

    self.satisfyImports = function(constructor) {
        if (!constructor.$imports) return constructor;

        var arguments = constructor.$imports.map(self.resolve);
        arguments.unshift({});
        return constructor.bind.apply(constructor, arguments);
    }
}

Container.DefaultLifetime = function (registration) {
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