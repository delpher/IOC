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
                var ctor = satisfyImports(constructor);
                return new ctor();
            }
        });
    };

    self.createChild = function() {
        return new Container(self)
    };

    self.resolve = function(what) {
        if (typeof what === 'string') return resolveByName(what);
        if (typeof what === 'function') return resolveByType(what, arguments);

        throw new Error('Can not call resolve with object, ' +
            'must be name or constructor');
    };

    function resolveByName(name) {
        var registration = registrations[name];
        if (registration) return registration.resolve();

        if (parentContainer) return parentContainer.resolve(name);

        throw new Error('Missing registration for: \'' + name + '\'');
    }

    function resolveByType(constructor, args) {
        var withImports = satisfyImports(constructor);
        args = Array.prototype.slice.call(args);
        var withArgs = withImports.bind.apply(withImports, args);
        return new withArgs();
    }

    function satisfyImports(constructor) {
        if (!constructor.$imports) return constructor;

        var resolvedImports = constructor.$imports.map(self.resolve);
        resolvedImports.unshift({});
        return constructor.bind.apply(constructor, resolvedImports);
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