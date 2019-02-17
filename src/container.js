(function (root, factory) {
    if(typeof define === "function" && define.amd) {
        define([], function(){
            return (root.Container = factory());
        });
    } else if(typeof module === "object" && module.exports) {
        module.exports = (root.Container = factory());
    } else {
        root.Container = factory();
    }
}(this, function() {
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

        self.createChild = function () {
            return new Container(self)
        };

        self.resolve = function (name) {
            var registration = registrations[name];
            if (registration) return registration.resolve();

            if (parentContainer) return parentContainer.resolve(name);

            throw new Error('Missing registration for: \'' + name + '\'');
        };

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

    return Container;
}));